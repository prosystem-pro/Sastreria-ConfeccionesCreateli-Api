const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');

const { PedidoModelo, ClienteModelo, EstadoPedidoModelo, UsuarioModelo,
    ProductoModelo, PedidoDetalleModelo, InventarioModelo, PedidoDetalleMedidaModelo,
    TipoProductoModelo, TipoMedidaModelo, PagoModelo, PagoAplicacionModelo, TipoTelaModelo,
    TelaModelo } = require('../Relaciones/Relaciones');

const TipoProducto = require('../Modelos/TipoProducto')(BaseDatos, Sequelize.DataTypes);
const TipoTela = require('../Modelos/TipoTela')(BaseDatos, Sequelize.DataTypes);
const Tela = require('../Modelos/Tela')(BaseDatos, Sequelize.DataTypes);
const Producto = require('../Modelos/Producto')(BaseDatos, Sequelize.DataTypes);
const Cliente = require('../Modelos/Cliente')(BaseDatos, Sequelize.DataTypes);
const TipoCuello = require('../Modelos/TipoCuello')(BaseDatos, Sequelize.DataTypes);
const PedidoDetalle = require('../Modelos/PedidoDetalle')(BaseDatos, Sequelize.DataTypes);
const PedidoDetalleMedida = require('../Modelos/PedidoDetalleMedida')(BaseDatos, Sequelize.DataTypes);
const TipoMedida = require('../Modelos/TipoMedida')(BaseDatos, Sequelize.DataTypes);
const FormaPago = require('../Modelos/FormaPago')(BaseDatos, Sequelize.DataTypes);
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const ListarPagosPorPedido = async (codigoPedido) => {

    try {

        if (!codigoPedido)
            LanzarError('El código de pedido es obligatorio', 400, 'Advertencia');

        // 🔎 Obtener pagos aplicados al pedido
        const pagosAplicados = await PagoAplicacionModelo.findAll({
            where: {
                TipoDocumento: 'PEDIDO',
                CodigoDocumento: codigoPedido
            },
            attributes: [
                'CodigoPago',
                'MontoAplicado'
            ],
            order: [['CodigoPagoAplicacion', 'ASC']]
        });

        if (!pagosAplicados || pagosAplicados.length === 0)
            return [];

        // 🔎 Obtener códigos de pago
        const codigosPago = pagosAplicados.map(p => p.CodigoPago);

        // 🔎 Obtener pagos
        const pagos = await PagoModelo.findAll({
            where: {
                CodigoPago: {
                    [Op.in]: codigosPago
                }
            },
            attributes: [
                'CodigoPago',
                'CodigoFormaPago',
                'FechaPago'
            ]
        });

        // 🔎 Obtener formas de pago
        const formasPago = await FormaPago.findAll({
            attributes: [
                'CodigoFormaPago',
                'NombreFormaPago'
            ]
        });

        // 📦 Convertir a mapas
        const mapaPagos = {};
        pagos.forEach(p => {
            mapaPagos[p.CodigoPago] = p;
        });

        const mapaFormaPago = {};
        formasPago.forEach(f => {
            mapaFormaPago[f.CodigoFormaPago] = f.NombreFormaPago;
        });

        // 📦 Construir resultado
        const resultado = pagosAplicados.map((p, index) => {

            const pago = mapaPagos[p.CodigoPago];

            return {
                Correlativo: index + 1,
                Fecha: pago?.FechaPago || null,
                FormaPago: mapaFormaPago[pago?.CodigoFormaPago] || 'Sin forma',
                Monto: Number(p.MontoAplicado || 0)
            };

        });

        return resultado;

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener pagos del pedido', 500, 'Error');

    }

};

const RegistrarPagoPedido = async (datos, usuario) => {
    const transaccion = await BaseDatos.transaction();

    try {
        if (!datos.CodigoPedido) LanzarError('El pedido es obligatorio', 400, 'Advertencia');
        if (!datos.MontoPago) LanzarError('El monto del pago es obligatorio', 400, 'Advertencia');
        if (!datos.FormaPago) LanzarError('La forma de pago es obligatoria', 400, 'Advertencia');
        if (datos.MontoPago <= 0) LanzarError('El monto debe ser mayor a cero', 400, 'Advertencia');

        // 🔎 Buscar pedido
        const pedido = await PedidoModelo.findOne({
            where: { CodigoPedido: datos.CodigoPedido },
            transaction: transaccion
        });

        if (!pedido) LanzarError('El pedido no existe', 404, 'Advertencia');

        // 💰 Total pagado hasta ahora
        const pagos = await PagoAplicacionModelo.findAll({
            where: { TipoDocumento: 'PEDIDO', CodigoDocumento: datos.CodigoPedido },
            attributes: ['MontoAplicado'],
            transaction: transaccion
        });

        const totalPagado = pagos.reduce((sum, p) => sum + Number(p.MontoAplicado), 0);
        const saldo = Number(pedido.Total) - totalPagado;

        if (saldo <= 0) LanzarError('El pedido ya está pagado', 400, 'Advertencia');
        if (datos.MontoPago > saldo) LanzarError('El monto excede el saldo pendiente', 400, 'Advertencia');

        // 💳 Crear pago
        const pago = await PagoModelo.create({
            CodigoEmpresa: 1,
            CodigoUsuario: usuario,
            CodigoFormaPago: datos.FormaPago,
            Monto: datos.MontoPago,
            FechaPago: new Date()
        }, { transaction: transaccion });

        // 📄 Aplicar pago al pedido
        await PagoAplicacionModelo.create({
            CodigoPago: pago.CodigoPago,
            TipoDocumento: 'PEDIDO',
            CodigoDocumento: datos.CodigoPedido,
            MontoAplicado: datos.MontoPago
        }, { transaction: transaccion });

        // 🔄 Recalcular total pagado y saldo
        const nuevoTotalPagado = totalPagado + Number(datos.MontoPago);
        const nuevoSaldo = Number(pedido.Total) - nuevoTotalPagado;

        // 🟢 Actualizar estado del pedido
        await pedido.update({
            CodigoEstadoPedido: nuevoSaldo === 0 ? 2 : 1
        }, { transaction: transaccion });

        await transaccion.commit();

        return {
            CodigoPedido: datos.CodigoPedido,
            CodigoPago: pago.CodigoPago,
            TotalPedido: pedido.Total,
            TotalPagado: nuevoTotalPagado,
            SaldoRestante: nuevoSaldo
        };

    } catch (error) {
        try { await transaccion.rollback(); } catch (_) { }
        throw error;
    }
};
const ObtenerPedido = async (CodigoPedido) => {
    try {

        if (!CodigoPedido)
            LanzarError('El código de pedido es obligatorio', 400, 'Advertencia');

        // ===================== PEDIDO =====================
        const pedido = await PedidoModelo.findOne({
            where: {
                CodigoPedido,
                Estatus: 1
            },
            include: [
                {
                    model: ClienteModelo,
                    as: 'CaCliente',
                    attributes: ['CodigoCliente', 'NombreCliente']
                },
                {
                    model: EstadoPedidoModelo,
                    as: 'CaEstadoPedido',
                    attributes: ['NombreEstadoPedido']
                },
                {
                    model: PagoAplicacionModelo,
                    as: 'PagosAplicados',
                    attributes: [
                        'CodigoPagoAplicacion',
                        'CodigoPago',
                        'MontoAplicado'
                    ],
                    include: [
                        {
                            model: PagoModelo,
                            as: 'FnPago',
                            attributes: [
                                'CodigoFormaPago',
                                'Monto',
                                'FechaPago'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!pedido)
            LanzarError('Pedido no encontrado', 404, 'Advertencia');


        // ===================== DETALLES =====================
        const detalles = await PedidoDetalleModelo.findAll({
            where: {
                CodigoPedido,
                Estatus: 1
            },
            include: [
                {
                    model: InventarioModelo,
                    as: 'Inventario',
                    attributes: [
                        'CodigoInventario',
                        'CodigoProducto'
                    ],
                    include: [
                        {
                            model: ProductoModelo,
                            as: 'Producto',
                            attributes: [
                                'CodigoProducto',
                                'NombreProducto',
                                'CodigoTipoProducto'
                            ],
                            include: [
                                {
                                    model: TipoProductoModelo,
                                    as: 'TipoProducto',
                                    attributes: [
                                        'CodigoTipoProducto',
                                        'NombreTipoProducto'
                                    ],
                                    required: false
                                }
                            ]
                        }
                    ]
                },
                {
                    model: TipoTelaModelo,
                    as: 'TipoTela',
                    attributes: [
                        'CodigoTipoTela',
                        'NombreTipoTela'
                    ],
                    required: false
                },
                {
                    model: TelaModelo,
                    as: 'Tela',
                    attributes: [
                        'CodigoTela',
                        'NombreTela'
                    ],
                    required: false
                }
            ]
        });


        const productos = [];

        for (const det of detalles) {

            // ===================== MEDIDAS =====================
            const medidasDB = await PedidoDetalleMedidaModelo.findAll({
                where: {
                    CodigoPedidoDetalle: det.CodigoPedidoDetalle
                },
                include: [
                    {
                        model: TipoMedidaModelo,
                        as: 'TipoMedidaDetalle',
                        attributes: ['NombreTipoMedida']
                    }
                ]
            });

            const medidas = {};

            for (const m of medidasDB) {

                const nombre = m.TipoMedidaDetalle?.NombreTipoMedida;

                if (!nombre) continue;

                if (m.Valor !== null && m.Valor !== undefined) {
                    medidas[nombre] = m.Valor;
                }
                else if (m.Descripcion !== null && m.Descripcion !== undefined) {
                    medidas[nombre] = m.Descripcion;
                }
                else {
                    medidas[nombre] = null;
                }
            }


            // ===================== PRODUCTO =====================
            productos.push({

                CodigoProducto:
                    det.Inventario?.Producto?.CodigoProducto || null,

                NombreProducto:
                    det.Inventario?.Producto?.NombreProducto || '',

                CodigoTipoProducto:
                    det.Inventario?.Producto?.TipoProducto?.CodigoTipoProducto || null,

                NombreTipoProducto:
                    det.Inventario?.Producto?.TipoProducto?.NombreTipoProducto || '',


                // 🔥 TELA
                CodigoTipoTela:
                    det.CodigoTipoTela || null,

                NombreTipoTela:
                    det.TipoTela?.NombreTipoTela || '',

                CodigoTela:
                    det.CodigoTela || null,

                NombreTela:
                    det.Tela?.NombreTela || '',


                // 🔥 CAMPOS
                Codigo:
                    det.Codigo || null,

                Color:
                    det.Color || '',

                Referencia:
                    det.Referencia || '',

                Cantidad:
                    det.Cantidad || 0,

                Precio:
                    det.PrecioVenta || 0,

                Subtotal:
                    det.Subtotal || 0,

                Medidas: medidas
            });
        }


        // ===================== PAGOS =====================
        const totalAbonado =
            pedido.PagosAplicados?.reduce(
                (acc, pa) => acc + parseFloat(pa.MontoAplicado || 0),
                0
            ) || 0;

        const saldoPendiente =
            (pedido.Total || 0) - totalAbonado;


        // ===================== RESPUESTA =====================
        const respuesta = {

            CodigoPedido: pedido.CodigoPedido,

            CodigoCliente: pedido.CodigoCliente,
            NombreCliente: pedido.CaCliente?.NombreCliente || '',

            FechaEntrega: pedido.FechaEntrega,
            Estado: pedido.CaEstadoPedido?.NombreEstadoPedido || '',

            Descuento: pedido.Descuento || 0,
            Subtotal: pedido.Subtotal || 0,
            Total: pedido.Total || 0,

            TotalAbonado: totalAbonado,
            SaldoPendiente: saldoPendiente,

            Pagos:
                pedido.PagosAplicados?.map(pa => ({
                    CodigoPagoAplicacion: pa.CodigoPagoAplicacion,
                    CodigoPago: pa.CodigoPago,
                    MontoAplicado: pa.MontoAplicado,
                    FormaPago: pa.FnPago?.CodigoFormaPago,
                    FechaPago: pa.FnPago?.FechaPago
                })) || [],

            Productos: productos
        };


        console.log(
            '📦 RESPUESTA COMPLETA DEL PEDIDO:',
            JSON.stringify(respuesta, null, 2)
        );

        return respuesta;

    } catch (error) {

        console.error(
            'Error original en ObtenerPedido:',
            error
        );

        if (!error.statusCode)
            LanzarError(
                'Error al obtener pedido',
                500,
                'Error'
            );

        throw error;
    }
};

const CrearPedido = async (datos, usuario) => {
    const transaccion = await BaseDatos.transaction();

    try {

        if (!datos.CodigoCliente)
            LanzarError('El cliente es obligatorio', 400, 'Advertencia');

        if (!datos.Productos || datos.Productos.length === 0)
            LanzarError('El pedido debe tener al menos un producto', 400, 'Advertencia');

        const pedido = await PedidoModelo.create({
            CodigoEmpresa: 1,
            CodigoCliente: datos.CodigoCliente,
            CodigoEstadoPedido: 1,
            CodigoUsuario: usuario,

            FechaCreacion: new Date(),
            FechaEntrega: datos.FechaEntrega,

            Subtotal: datos.Subtotal,
            Descuento: datos.Descuento,
            Total: datos.Total,

            Estatus: 1
        }, { transaction: transaccion });

        for (const producto of datos.Productos) {

            const inventario = await InventarioModelo.findOne({
                where: {
                    CodigoProducto: producto.CodigoProducto,
                    Estatus: 1
                },
                transaction: transaccion
            });

            if (!inventario)
                LanzarError(`No hay inventario para el producto ${producto.CodigoProducto}`, 400, 'Advertencia');

            if (inventario.StockActual < producto.Cantidad)
                LanzarError(`Stock insuficiente para el producto ${producto.CodigoProducto}`, 400, 'Advertencia');

            // 🔥 YA NO GUARDAMOS SELECTS COMO FK
            const detalle = await PedidoDetalleModelo.create({
                CodigoPedido: pedido.CodigoPedido,
                CodigoInventario: inventario.CodigoInventario,

                CodigoTipoTela: producto.CodigoTipoTela || null,
                CodigoTela: producto.CodigoTela || null,

                Codigo: producto.Codigo || null,
                Color: producto.Color || null,
                Referencia: producto.Referencia || null,

                Cantidad: producto.Cantidad,
                PrecioVenta: producto.Precio,
                Subtotal: producto.Subtotal,

                Estatus: 1
            }, { transaction: transaccion });

            // 📏 GUARDAR TODAS LAS MEDIDAS (NUM + STRING)
            if (producto.Medidas) {

                const medidas = producto.Medidas;

                for (const key in medidas) {

                    const valor = medidas[key];

                    if (valor === null || valor === undefined || valor === '')
                        continue;

                    const tipoMedida = await TipoMedidaModelo.findOne({
                        where: { NombreTipoMedida: key },
                        transaction: transaccion
                    });

                    if (!tipoMedida) continue;

                    const esNumero = typeof valor === 'number';

                    await PedidoDetalleMedidaModelo.create({
                        CodigoPedidoDetalle: detalle.CodigoPedidoDetalle,
                        CodigoTipoMedida: tipoMedida.CodigoTipoMedida,

                        // 🔥 CLAVE
                        Valor: esNumero ? valor : null,
                        Descripcion: !esNumero ? String(valor) : null

                    }, { transaction: transaccion });
                }
            }

            await inventario.update({
                StockActual: inventario.StockActual - producto.Cantidad
            }, { transaction: transaccion });
        }

        // 💰 PAGO
        if (datos.MontoPago && datos.FormaPago) {

            const pago = await PagoModelo.create({
                CodigoEmpresa: 1,
                CodigoUsuario: usuario,
                CodigoFormaPago: datos.FormaPago,
                Monto: datos.MontoPago,
                FechaPago: new Date(),
                Estatus: 1
            }, { transaction: transaccion });

            await PagoAplicacionModelo.create({
                CodigoPedido: pedido.CodigoPedido,
                CodigoPago: pago.CodigoPago,
                MontoAplicado: datos.MontoPago,
                TipoDocumento: 'PEDIDO',
                CodigoDocumento: pedido.CodigoPedido,
                Estatus: 1
            }, { transaction: transaccion });
        }

        await transaccion.commit();

        return { CodigoPedido: pedido.CodigoPedido };

    } catch (error) {

        try { await transaccion.rollback(); } catch (_) { }

        throw error;
    }
};

const ActualizarPedido = async (datos, usuario) => {

    const transaccion = await BaseDatos.transaction();

    try {

        if (!datos.CodigoPedido)
            LanzarError('El código de pedido es obligatorio', 400, 'Advertencia');

        if (!datos.CodigoCliente)
            LanzarError('El cliente es obligatorio', 400, 'Advertencia');

        if (!datos.Productos || datos.Productos.length === 0)
            LanzarError('El pedido debe tener al menos un producto', 400, 'Advertencia');

        // ===================== VALIDAR PEDIDO =====================
        const pedido = await PedidoModelo.findOne({
            where: {
                CodigoPedido: datos.CodigoPedido,
                Estatus: 1
            },
            transaction: transaccion
        });

        if (!pedido)
            LanzarError('Pedido no encontrado', 404, 'Advertencia');

        // ===================== OBTENER DETALLES ANTERIORES =====================
        const detallesAnteriores = await PedidoDetalleModelo.findAll({
            where: { CodigoPedido: datos.CodigoPedido },
            transaction: transaccion
        });

        // ===================== DEVOLVER STOCK =====================
        for (const det of detallesAnteriores) {

            const inventario = await InventarioModelo.findOne({
                where: { CodigoInventario: det.CodigoInventario },
                transaction: transaccion
            });

            if (inventario) {

                await inventario.update({
                    StockActual: inventario.StockActual + det.Cantidad
                }, { transaction: transaccion });
            }

            await PedidoDetalleMedidaModelo.destroy({
                where: { CodigoPedidoDetalle: det.CodigoPedidoDetalle },
                transaction: transaccion
            });

            await det.destroy({ transaction: transaccion });
        }

        // ===================== ACTUALIZAR ENCABEZADO =====================
        await pedido.update({

            CodigoCliente: datos.CodigoCliente,
            FechaEntrega: datos.FechaEntrega,

            Subtotal: datos.Subtotal,
            Descuento: datos.Descuento,
            Total: datos.Total

        }, { transaction: transaccion });

        // ===================== INSERTAR NUEVOS PRODUCTOS =====================
        for (const producto of datos.Productos) {

            const inventario = await InventarioModelo.findOne({
                where: {
                    CodigoProducto: producto.CodigoProducto,
                    Estatus: 1
                },
                transaction: transaccion
            });

            if (!inventario)
                LanzarError(
                    `No hay inventario para el producto ${producto.CodigoProducto}`,
                    400,
                    'Advertencia'
                );

            if (inventario.StockActual < producto.Cantidad)
                LanzarError(
                    `Stock insuficiente para el producto ${producto.CodigoProducto}`,
                    400,
                    'Advertencia'
                );

            const detalle = await PedidoDetalleModelo.create({

                CodigoPedido: pedido.CodigoPedido,
                CodigoInventario: inventario.CodigoInventario,

                CodigoTipoTela: producto.CodigoTipoTela || null,
                CodigoTela: producto.CodigoTela || null,

                Codigo: producto.Codigo || null,
                Color: producto.Color || null,
                Referencia: producto.Referencia || null,

                Cantidad: producto.Cantidad,
                PrecioVenta: producto.Precio,
                Subtotal: producto.Subtotal,

                Estatus: 1

            }, { transaction: transaccion });

            // ===================== MEDIDAS (MISMA LOGICA QUE CREAR) =====================
            if (producto.Medidas) {

                const medidas = producto.Medidas;

                for (const key in medidas) {

                    const valor = medidas[key];

                    if (valor === null || valor === undefined || valor === '')
                        continue;

                    const tipoMedida = await TipoMedidaModelo.findOne({
                        where: { NombreTipoMedida: key },
                        transaction: transaccion
                    });

                    if (!tipoMedida) continue;

                    const esNumero = typeof valor === 'number';

                    await PedidoDetalleMedidaModelo.create({

                        CodigoPedidoDetalle: detalle.CodigoPedidoDetalle,
                        CodigoTipoMedida: tipoMedida.CodigoTipoMedida,

                        Valor: esNumero ? valor : null,
                        Descripcion: !esNumero ? String(valor) : null

                    }, { transaction: transaccion });
                }
            }

            // ===================== DESCONTAR STOCK =====================
            await inventario.update({
                StockActual: inventario.StockActual - producto.Cantidad
            }, { transaction: transaccion });
        }

        await transaccion.commit();

        return {
            CodigoPedido: pedido.CodigoPedido,
            ok: true
        };

    } catch (error) {

        try {
            await transaccion.rollback();
        } catch (_) { }

        throw error;
    }
};

const Listado = async () => {
    try {
        // 1️⃣ Traer todos los pedidos activos
        const pedidos = await PedidoModelo.findAll({
            where: {
                Estatus: { [Op.in]: [1, 2, 3, 4] } // pedidos activos/validos
            },
            attributes: [
                'CodigoPedido',
                'FechaCreacion',
                'FechaEntrega',
                'Subtotal',
                'Descuento',
                'Total'
            ],
            include: [
                {
                    model: ClienteModelo,
                    as: 'CaCliente',
                    attributes: ['NombreCliente']
                },
                {
                    model: EstadoPedidoModelo,
                    as: 'CaEstadoPedido',
                    attributes: ['CodigoEstadoPedido', 'NombreEstadoPedido']
                },
                {
                    model: UsuarioModelo,
                    as: 'AdUsuario',
                    attributes: ['NombreUsuario']
                }
            ],
            order: [['FechaCreacion', 'DESC']]
        });

        // 2️⃣ Mapear y calcular saldo pendiente real
        const resultado = [];
        for (const p of pedidos) {
            const Total = Number(p.Total || 0);

            // 🔎 Obtener todos los pagos aplicados a este pedido
            const pagos = await PagoAplicacionModelo.findAll({
                where: {
                    TipoDocumento: 'PEDIDO',
                    CodigoDocumento: p.CodigoPedido
                },
                attributes: ['MontoAplicado']
            });

            const TotalPagado = pagos.reduce((sum, pago) => sum + Number(pago.MontoAplicado), 0);
            const SaldoPendiente = Total - TotalPagado;

            resultado.push({
                CodigoPedido: p.CodigoPedido,
                NombreCliente: p.CaCliente?.NombreCliente || 'Sin cliente',
                FechaCreacion: p.FechaCreacion,
                FechaEntrega: p.FechaEntrega,
                Subtotal: p.Subtotal,
                Descuento: p.Descuento,
                Total: Total,
                NombreEstatus: p.CaEstadoPedido?.NombreEstadoPedido || 'Sin estado',
                Estatus: p.CaEstadoPedido?.CodigoEstadoPedido || 0,
                Usuario: p.AdUsuario?.NombreUsuario || 'Sin usuario',
                TotalPagado: TotalPagado,
                SaldoPendiente: SaldoPendiente < 0 ? 0 : SaldoPendiente // nunca negativo
            });
        }

        return resultado;

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener listado de pedidos', 500, 'Error');
    }
};
const Obtener = async (codigoPedido) => {
    try {

        const pedido = await PedidoModelo.findOne({

            where: {
                CodigoPedido: codigoPedido,
                Estatus: { [Op.in]: [1, 2, 3, 4] }
            },

            attributes: [
                'CodigoPedido',
                'FechaCreacion',
                'FechaEntrega',
                'Subtotal',
                'Descuento',
                'Total'
            ],

            include: [
                {
                    model: ClienteModelo,
                    as: 'CaCliente',
                    attributes: ['CodigoCliente', 'NombreCliente']
                },
                {
                    model: EstadoPedidoModelo,
                    as: 'CaEstadoPedido',
                    attributes: ['CodigoEstadoPedido', 'NombreEstadoPedido']
                },
                {
                    model: UsuarioModelo,
                    as: 'AdUsuario',
                    attributes: ['CodigoUsuario', 'NombreUsuario']
                }
            ]
        });

        if (!pedido) {
            LanzarError('Pedido no encontrado', 404, 'Advertencia');
        }

        const Total = Number(pedido.Total || 0);
        const Pagado = 0;
        const SaldoPendiente = Total - Pagado;

        return {

            CodigoPedido: pedido.CodigoPedido,

            Cliente: {
                CodigoCliente: pedido.CaCliente?.CodigoCliente || 0,
                NombreCliente: pedido.CaCliente?.NombreCliente || ''
            },

            FechaCreacion: pedido.FechaCreacion,
            FechaEntrega: pedido.FechaEntrega,

            Subtotal: pedido.Subtotal,
            Descuento: pedido.Descuento,
            Total: Total,

            Estado: {
                CodigoEstadoPedido: pedido.CaEstadoPedido?.CodigoEstadoPedido || 0,
                NombreEstadoPedido: pedido.CaEstadoPedido?.NombreEstadoPedido || ''
            },

            Usuario: {
                CodigoUsuario: pedido.AdUsuario?.CodigoUsuario || 0,
                NombreUsuario: pedido.AdUsuario?.NombreUsuario || ''
            },

            SaldoPendiente: SaldoPendiente

        };

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener pedido', 500, 'Error');

    }
};

const ListadoTipoProducto = async () => {

    try {

        const tipos = await TipoProducto.findAll({

            where: {
                Estatus: 1
            },

            attributes: [
                'CodigoTipoProducto',
                'NombreTipoProducto'
            ],

            order: [['NombreTipoProducto', 'ASC']]

        });

        return tipos.map(t => ({
            CodigoTipoProducto: t.CodigoTipoProducto,
            NombreTipoProducto: t.NombreTipoProducto
        }));

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener tipos de producto', 500, 'Error');

    }

};

const ListadoProducto = async (CodigoTipoProducto = null) => {
    try {

        const whereProducto = {
            Estatus: 1
        };

        if (CodigoTipoProducto) {
            whereProducto.CodigoTipoProducto = CodigoTipoProducto;
        }

        const productos = await ProductoModelo.findAll({

            where: whereProducto,

            include: [
                {
                    model: InventarioModelo,
                    as: 'Inventarios',
                    attributes: [],
                    required: true
                }
            ],

            attributes: [
                'CodigoProducto',
                'NombreProducto',
                'CodigoTipoProducto',
                [Sequelize.fn('SUM', Sequelize.col('Inventarios.StockActual')), 'StockActual']
            ],

            group: [
                'Producto.CodigoProducto',
                'Producto.NombreProducto',
                'Producto.CodigoTipoProducto'
            ],

            order: [
                ['NombreProducto', 'ASC']
            ],

            raw: true
        });

        return productos.map(p => ({
            CodigoProducto: p.CodigoProducto,
            NombreProducto: p.NombreProducto,
            CodigoTipoProducto: p.CodigoTipoProducto,
            StockActual: Number(p.StockActual) || 0
        }));

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener productos', 500, 'Error');
    }
};

const ListadoTipoTela = async () => {

    try {

        const tipos = await TipoTela.findAll({

            where: {
                Estatus: 1
            },

            attributes: [
                'CodigoTipoTela',
                'NombreTipoTela'
            ],

            order: [['NombreTipoTela', 'ASC']]

        });

        return tipos.map(t => ({
            CodigoTipoTela: t.CodigoTipoTela,
            NombreTipoTela: t.NombreTipoTela
        }));

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener tipos de tela', 500, 'Error');

    }

};

const ListadoTela = async () => {

    try {

        const telas = await Tela.findAll({

            where: {
                Estatus: 1
            },

            attributes: [
                'CodigoTela',
                'NombreTela'
            ],

            order: [['NombreTela', 'ASC']]

        });

        return telas.map(t => ({
            CodigoTela: t.CodigoTela,
            NombreTela: t.NombreTela
        }));

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener nombres de tela', 500, 'Error');

    }

};

const ListadoTipoCuello = async () => {

    try {

        const tiposCuello = await TipoCuello.findAll({

            where: {
                Estatus: 1
            },

            attributes: [
                'CodigoTipoCuello',
                'NombreTipoCuello'
            ],

            order: [['NombreTipoCuello', 'ASC']]

        });

        return tiposCuello.map(t => ({
            CodigoTipoCuello: t.CodigoTipoCuello,
            NombreTipoCuello: t.NombreTipoCuello
        }));

    } catch (error) {

        console.error('ERROR ListadoTipoCuello:', error);
        throw error;

    }

};

const ObtenerProducto = async (codigoProducto) => {
    try {
        const producto = await Producto.findOne({
            where: { CodigoProducto: codigoProducto },
            attributes: ['NombreProducto', 'PrecioBase']  // Solo los campos que necesitas
        });

        if (!producto) {
            LanzarError('Producto no encontrado', 404, 'Advertencia');
        }

        return {
            NombreProducto: producto.NombreProducto,
            Precio: producto.PrecioBase
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener producto', 500, 'Error');
    }
};

const ListadoCliente = async () => {

    try {

        const clientes = await Cliente.findAll({

            where: {
                Estatus: 1
            },

            attributes: [
                'CodigoCliente',
                'NombreCliente'
            ],

            order: [['NombreCliente', 'ASC']]

        });

        return clientes.map(c => ({
            CodigoCliente: c.CodigoCliente,
            NombreCliente: c.NombreCliente
        }));

    } catch (error) {

        console.error(error);

        LanzarError('Error al obtener clientes', 500, 'Error');

    }

};

const ListadoFormaPago = async () => {
    try {
        const formas = await FormaPago.findAll({
            where: {
                Estatus: 1
            },
            attributes: [
                'CodigoFormaPago',
                'NombreFormaPago'
            ],
            order: [['NombreFormaPago', 'ASC']]
        });

        return formas.map(f => ({
            CodigoFormaPago: f.CodigoFormaPago,
            NombreFormaPago: f.NombreFormaPago
        }));

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener formas de pago', 500, 'Error');
    }
};

module.exports = {
    Listado, Obtener, ListadoTipoProducto, ListadoTipoTela,
    ListadoTela, ListadoProducto, ObtenerProducto, ListadoCliente, CrearPedido, ListadoTipoCuello,
    ObtenerPedido, ActualizarPedido, ListadoFormaPago, RegistrarPagoPedido, ListarPagosPorPedido
};