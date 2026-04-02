const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');

const { 
    InventarioModelo: InventarioRelacion,
    ProductoModelo: ProductoRelacion,
    PedidoModelo,
    PedidoDetalleModelo,
    PagoModelo,
    PagoAplicacionModelo,
    EstadoPedidoModelo,
    MovimientoInventarioModelo,
    UsuarioModelo,
    ClienteModelo
} = require('../Relaciones/Relaciones');

const { Op } = require('sequelize');
const { LanzarError } = require('../Utilidades/ErrorServicios');

// ELIMINAR VENTA
const EliminarVenta = async (CodigoPedido, usuario) => {

    let transaction;

    try {

        // =============================
        // VALIDACIONES
        // =============================

        if (!usuario)
            LanzarError('Usuario no autenticado', 401);

        if (!CodigoPedido)
            LanzarError('Código de pedido requerido', 400);


        // =============================
        // INICIAR TRANSACCION
        // =============================

        transaction = await BaseDatos.transaction();


        // =============================
        // OBTENER PEDIDO
        // =============================

        const pedido = await PedidoModelo.findOne({

            where: {
                CodigoPedido: CodigoPedido,
                Estatus: 1
            },

            include: [
                {
                    model: PedidoDetalleModelo,
                    as: 'PedidoDetalles',
                    attributes: [
                        'CodigoPedidoDetalle',
                        'CodigoInventario',
                        'Cantidad'
                    ],
                    required: false
                }
            ],

            transaction
        });

        if (!pedido)
            LanzarError('Venta no encontrada', 404);


        // =============================
        // DEVOLVER STOCK Y CREAR MOVIMIENTO
        // =============================

        for (const detalle of (pedido.PedidoDetalles || [])) {

            const inventario = await InventarioRelacion.findOne({

                where: {
                    CodigoInventario: detalle.CodigoInventario
                },

                attributes: [
                    'CodigoInventario',
                    'StockActual'
                ],

                transaction
            });

            if (!inventario)
                LanzarError(
                    `Inventario ${detalle.CodigoInventario} no encontrado`,
                    404
                );

            const stockAnterior = inventario.StockActual;
            const stockNuevo = stockAnterior + detalle.Cantidad;


            // =============================
            // ACTUALIZAR STOCK
            // =============================

            await inventario.update({
                StockActual: stockNuevo
            }, { transaction });


            // =============================
            // REGISTRAR MOVIMIENTO DE DEVOLUCION
            // =============================

            await MovimientoInventarioModelo.create({

                CodigoEmpresa: 1,
                CodigoInventario: detalle.CodigoInventario,
                CodigoUsuario: usuario.CodigoUsuario,

                TipoMovimiento: 'ENTRADA',
                OrigenMovimiento: 'ELIMINACION_VENTA',

                CodigoDocumento: CodigoPedido,

                Cantidad: detalle.Cantidad,
                StockAnterior: stockAnterior,
                StockNuevo: stockNuevo,

                FechaMovimiento: new Date(),
                Observacion: `Devolución por eliminación de venta Pedido ${CodigoPedido}`,

                Estatus: 1,
                FechaCreacion: new Date()

            }, { transaction });

        }


        // =============================
        // OBTENER PAGOS APLICADOS
        // =============================

        const pagosAplicados = await PagoAplicacionModelo.findAll({

            where: {
                CodigoDocumento: CodigoPedido,
                TipoDocumento: 'PEDIDO'
            },

            attributes: ['CodigoPago'],

            transaction
        });


        // =============================
        // ELIMINAR PAGO APLICACION (HIJO)
        // =============================

        await PagoAplicacionModelo.destroy({

            where: {
                CodigoDocumento: CodigoPedido,
                TipoDocumento: 'PEDIDO'
            },

            transaction
        });


        // =============================
        // ELIMINAR PAGOS (PADRE)
        // =============================

        for (const pagoAplicado of pagosAplicados) {

            await PagoModelo.destroy({

                where: {
                    CodigoPago: pagoAplicado.CodigoPago
                },

                transaction
            });

        }


        // =============================
        // ELIMINAR DETALLES
        // =============================

        await PedidoDetalleModelo.destroy({

            where: {
                CodigoPedido: CodigoPedido
            },

            transaction
        });


        // =============================
        // ELIMINAR PEDIDO
        // =============================

        await PedidoModelo.destroy({

            where: {
                CodigoPedido: CodigoPedido
            },

            transaction
        });


        // =============================
        // COMMIT
        // =============================

        await transaction.commit();

        return {
            success: true,
            message: 'Venta eliminada correctamente',
            bitacora: 'Movimiento de inventario de eliminación registrado correctamente'
        };


    } catch (error) {

        if (transaction)
            await transaction.rollback();

        console.error(error);

        LanzarError(
            error.message || 'Error al eliminar venta',
            error.statusCode || 500,
            'Error'
        );
    }
};

// CREAR VENTA (USANDO PEDIDO)
const CrearVenta = async (datos, usuario) => {

    let transaction;

    try {

        // =============================
        // VALIDAR USUARIO
        // =============================

        if (!usuario)
            LanzarError('Usuario no autenticado', 401);


        // =============================
        // INICIAR TRANSACCION
        // =============================

        transaction = await BaseDatos.transaction();


        // =============================
        // DATOS
        // =============================

        const {
            CodigoCliente,
            CodigoFormaPago,
            Descuento,
            Pago,
            Subtotal,
            Total,
            Productos,
            NumeroComprobante // 🔴 agregado
        } = datos;


        // =============================
        // VALIDACIONES
        // =============================

        if (!CodigoCliente)
            LanzarError('Cliente requerido', 400);

        if (!CodigoFormaPago)
            LanzarError('Forma de pago requerida', 400);

        if (!Productos || Productos.length === 0)
            LanzarError('Debe agregar productos', 400);

        if (!Pago || Pago <= 0)
            LanzarError('Pago inválido', 400);


        // =============================
        // OBTENER ESTADO VENDIDO
        // =============================

        const estadoVenta = await EstadoPedidoModelo.findOne({
            where: {
                NombreEstadoPedido: 'VENDIDO',
                Estatus: 1
            },
            transaction
        });

        if (!estadoVenta)
            LanzarError('Estado VENDIDO no configurado', 400);


        // =============================
        // CREAR PEDIDO
        // =============================

        const pedido = await PedidoModelo.create({

            CodigoEmpresa: 1,
            CodigoCliente: CodigoCliente,
            CodigoEstadoPedido: estadoVenta.CodigoEstadoPedido,
            CodigoUsuario: usuario.CodigoUsuario,

            FechaCreacion: new Date(),
            FechaEntrega: new Date(),

            Subtotal: Subtotal,
            Descuento: Descuento,
            Total: Total,

            Observacion: 'Venta directa',
            Estatus: 1

        }, { transaction });

        const CodigoPedido = pedido.CodigoPedido;


        // =============================
        // RECORRER PRODUCTOS
        // =============================

        for (const item of Productos) {

            const inventario = await InventarioRelacion.findOne({

                where: {
                    CodigoInventario: item.CodigoInventario,
                    Estatus: 1
                },

                transaction

            });

            if (!inventario)
                LanzarError(`Producto ${item.CodigoInventario} no existe`, 404);

            if (inventario.StockActual < item.Cantidad)
                LanzarError(
                    `Stock insuficiente del producto ${item.CodigoInventario}`,
                    400
                );

            const stockAnterior = inventario.StockActual;
            const stockNuevo = stockAnterior - item.Cantidad;


            // =============================
            // PEDIDO DETALLE
            // =============================

            await PedidoDetalleModelo.create({

                CodigoPedido: CodigoPedido,
                CodigoInventario: item.CodigoInventario,

                CodigoTela: null,
                CodigoTipoCuello: null,
                CodigoSolapa: null,
                CodigoTipoCorte: null,
                CodigoBoton: null,
                CodigoAbertura: null,

                Cantidad: item.Cantidad,
                PrecioVenta: item.PrecioVenta,
                Subtotal: item.Total,

                Estatus: 1

            }, { transaction });


            // =============================
            // ACTUALIZAR STOCK
            // =============================

            await InventarioRelacion.update({

                StockActual: stockNuevo

            }, {

                where: {
                    CodigoInventario: item.CodigoInventario
                },

                transaction

            });


            // =============================
            // MOVIMIENTO INVENTARIO
            // =============================

            await MovimientoInventarioModelo.create({

                CodigoEmpresa: 1,

                CodigoInventario: item.CodigoInventario,

                CodigoUsuario: usuario.CodigoUsuario,

                TipoMovimiento: 'SALIDA',

                OrigenMovimiento: 'VENTA',

                TipoDocumento: 'PEDIDO',

                CodigoDocumento: CodigoPedido,

                Cantidad: item.Cantidad,

                StockAnterior: stockAnterior,

                StockNuevo: stockNuevo,

                FechaMovimiento: new Date(),

                Observacion: `Salida por venta Pedido ${CodigoPedido}`,

                Estatus: 1,

                FechaCreacion: new Date()

            }, { transaction });

        }


        // =============================
        // CREAR PAGO
        // =============================

        const pago = await PagoModelo.create({

            CodigoEmpresa: 1,

            CodigoFormaPago: CodigoFormaPago,

            CodigoUsuario: usuario.CodigoUsuario,

            FechaPago: new Date(),

            Monto: Pago,

            NumeroComprobante: NumeroComprobante, // 🔴 agregado aquí

            Observacion: 'Pago de venta',

            Estatus: 1,

            FechaCreacion: new Date()

        }, { transaction });


        // =============================
        // APLICAR PAGO
        // =============================

        await PagoAplicacionModelo.create({

            CodigoPago: pago.CodigoPago,

            TipoDocumento: 'PEDIDO',

            CodigoDocumento: CodigoPedido,

            MontoAplicado: Pago,

            FechaCreacion: new Date()

        }, { transaction });


        // =============================
        // COMMIT
        // =============================

        await transaction.commit();


        return {

            success: true,
            message: 'Venta creada correctamente',
            data: {
                CodigoPedido
            }

        };

    } catch (error) {

        if (transaction)
            await transaction.rollback();

        console.error(error);

        LanzarError(
            error.message || 'Error al crear venta',
            error.statusCode || 500,
            'Error'
        );

    }

};

// LISTADO PRODUCTOS PARA SELECT
const ListadoProducto = async () => {

    try {

        const productos = await InventarioRelacion.findAll({

            where: {
                Estatus: 1,
                StockActual: {
                    [Op.gt]: 0
                }
            },

            attributes: [
                'CodigoInventario',
                'PrecioVenta'   // ✅ precio que se enviará
            ],

            include: [
                {
                    model: ProductoRelacion,
                    as: 'Producto',
                    attributes: [
                        'CodigoProducto',
                        'NombreProducto',
                        'PrecioBase'   // opcional, solo referencia
                    ]
                }
            ],

            order: [
                [{ model: ProductoRelacion, as: 'Producto' }, 'NombreProducto', 'ASC']
            ]

        });

        return productos.map(p => ({

            CodigoInventario: p.CodigoInventario,
            CodigoProducto: p.Producto?.CodigoProducto,
            NombreProducto: p.Producto?.NombreProducto,

            PrecioVenta: p.PrecioVenta,        // ✅ precio real de venta
            PrecioBase: p.Producto?.PrecioBase // opcional

        }));

    } catch (error) {

        console.error(error);

        LanzarError(
            'Error al obtener productos',
            500,
            'Error'
        );

    }

};

// LISTADO DE VENTAS
const ListadoVentas = async () => {
  try {
    const ventas = await PedidoModelo.findAll({
      where: { Estatus: 1 }, // sigue filtrando solo los activos
      attributes: ['CodigoPedido', 'FechaCreacion', 'Subtotal', 'Descuento', 'Total'],
      include: [
        {
          model: EstadoPedidoModelo,
          as: 'CaEstadoPedido',
          attributes: ['NombreEstadoPedido'],
          where: { NombreEstadoPedido: 'VENDIDO' } // ✅ solo VENDIDO
        },
        {
          model: PagoAplicacionModelo,
          as: 'PagosAplicados',
          attributes: ['CodigoPagoAplicacion', 'MontoAplicado'],
          include: [
            {
              model: PagoModelo,
              as: 'FnPago',
              attributes: ['Monto']
            }
          ]
        },
        {
          model: UsuarioModelo,
          as: 'AdUsuario',
          attributes: ['NombreUsuario']
        },
        {
          model: ClienteModelo,
          as: 'CaCliente',
          attributes: ['NombreCliente']
        }
      ],
      order: [['FechaCreacion', 'DESC']]
    });

    // Transformar datos para el frontend
    return ventas.map(v => ({
      CodigoPedido: v.CodigoPedido,
      Fecha: v.FechaCreacion,
      Total: v.Total,
      Cliente: v.CaCliente?.NombreCliente || 'Sin cliente',
      Usuario: v.AdUsuario?.NombreUsuario || 'Desconocido',
      Pagos: v.PagosAplicados?.map(p => ({
        MontoAplicado: p.MontoAplicado,
        MontoPago: p.FnPago?.Monto || 0
      })) || []
    }));

  } catch (error) {
    console.error(error);
    LanzarError('Error al obtener listado de ventas', 500, 'Error');
  }
};

module.exports = {
    ListadoProducto, CrearVenta,ListadoVentas, EliminarVenta
};