const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');

const InventarioModelo = require('../Modelos/Inventario')(BaseDatos, Sequelize.DataTypes);
const ProductoModelo = require('../Modelos/Producto')(BaseDatos, Sequelize.DataTypes);
const TipoProductoModelo = require('../Modelos/TipoProducto')(BaseDatos, Sequelize.DataTypes);
const TipoTelaModelo = require('../Modelos/TipoTela')(BaseDatos, Sequelize.DataTypes);
const TelaModelo = require('../Modelos/Tela')(BaseDatos, Sequelize.DataTypes);
const MovimientoInventarioModelo = require('../Modelos/MovimientoInventario')(BaseDatos, Sequelize.DataTypes);

const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');

const {
    InventarioModelo: InventarioRelacion,
    ProductoModelo: ProductoRelacion,
    MarcaModelo: MarcaRelacion,
    EstiloModelo: EstiloRelacion,
    TallaModelo: TallaRelacion,
    ColorModelo: ColorRelacion,
    TipoProductoModelo: TipoProductoRelacion,
    TipoTelaModelo: TipoTelaRelacion,
    TelaModelo: TelaRelacion
} = require('../Relaciones/Relaciones');
// LISTADOS
const ListadoTipoTela = async () => {
    try {
        const tipos = await TipoTelaModelo.findAll({
            where: { Estatus: 1 },
            attributes: ['CodigoTipoTela', 'NombreTipoTela'],
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

const ListadoNombreTela = async () => {
    try {

        // 1. Obtener telas
        const telas = await TelaModelo.findAll({
            where: { Estatus: 1 },
            attributes: [
                'CodigoTela',
                'NombreTela',
                'CodigoTipoTela'
            ],
            order: [['NombreTela', 'ASC']]
        });

        // 2. Obtener tipos de tela
        const tiposTela = await TipoTelaModelo.findAll({
            where: { Estatus: 1 },
            attributes: [
                'CodigoTipoTela',
                'NombreTipoTela'
            ]
        });

        // 3. Crear mapa de tipos
        const mapaTipoTela = {};

        tiposTela.forEach(t => {
            mapaTipoTela[t.CodigoTipoTela] = t.NombreTipoTela;
        });

        // 4. Unir información
        return telas.map(t => ({

            CodigoTela: t.CodigoTela,

            CodigoTipoTela: t.CodigoTipoTela,

            NombreTipoTela: mapaTipoTela[t.CodigoTipoTela] || '',

            NombreTela: t.NombreTela

        }));

    } catch (error) {

        console.error(error);

        LanzarError(
            'Error al obtener nombres de tela',
            500,
            'Error'
        );
    }
};
// CREAR
const CrearTipoTela = async (data) => {
    try {

        const { NombreTipoTela } = data;

        if (!NombreTipoTela) {
            LanzarError('El nombre del tipo de tela es requerido', 400, 'Validacion');
        }

        const existe = await TipoTelaModelo.findOne({
            where: {
                NombreTipoTela,
                Estatus: 1
            }
        });

        if (existe) {
            LanzarError('El tipo de tela ya existe', 400, 'Validacion');
        }

        const nuevo = await TipoTelaModelo.create({
            NombreTipoTela,
            Estatus: 1
        });

        return {
            CodigoTipoTela: nuevo.CodigoTipoTela,
            NombreTipoTela: nuevo.NombreTipoTela
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al crear tipo de tela', 500, 'Error');
    }
};

const CrearTela = async (data) => {
    try {

        const { CodigoTipoTela, NombreTela } = data;

        if (!CodigoTipoTela || !NombreTela) {
            LanzarError('Tipo de tela y nombre de tela son requeridos', 400, 'Validacion');
        }

        const tipoTela = await TipoTelaModelo.findByPk(CodigoTipoTela);

        if (!tipoTela) {
            LanzarError('El tipo de tela no existe', 400, 'Validacion');
        }

        const existe = await TelaModelo.findOne({
            where: {
                NombreTela,
                Estatus: 1
            }
        });

        if (existe) {
            LanzarError('La tela ya existe', 400, 'Validacion');
        }

        const nueva = await TelaModelo.create({
            CodigoTipoTela,
            NombreTela,
            Estatus: 1
        });

        return {
            CodigoTela: nueva.CodigoTela,
            CodigoTipoTela: nueva.CodigoTipoTela,
            NombreTela: nueva.NombreTela
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al crear tela', 500, 'Error');
    }
};
// OBTENER POR CODIGO
const ObtenerTipoTelaPorCodigo = async (codigo) => {
    try {

        const tipo = await TipoTelaModelo.findOne({
            where: {
                CodigoTipoTela: codigo,
                Estatus: 1
            },
            attributes: ['CodigoTipoTela', 'NombreTipoTela']
        });

        if (!tipo) {
            LanzarError('Tipo de tela no encontrado', 404, 'Validacion');
        }

        return tipo;

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener tipo de tela', 500, 'Error');
    }
};
const ObtenerTelaPorCodigo = async (codigo) => {
    try {

        const tela = await TelaModelo.findOne({
            where: {
                CodigoTela: codigo,
                Estatus: 1
            },
            attributes: [
                'CodigoTela',
                'CodigoTipoTela',
                'NombreTela'
            ],
            include: [
                {
                    model: TipoTelaModelo,
                    attributes: ['CodigoTipoTela', 'NombreTipoTela']
                }
            ]
        });

        if (!tela) {
            LanzarError('Tela no encontrada', 404, 'Validacion');
        }

        return tela;

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener tela', 500, 'Error');
    }
};

// EDITAR
const EditarTipoTela = async (codigo, data) => {
    try {

        const { NombreTipoTela } = data;

        const tipo = await TipoTelaModelo.findByPk(codigo);

        if (!tipo) {
            LanzarError('Tipo de tela no encontrado', 404, 'Validacion');
        }

        const existe = await TipoTelaModelo.findOne({
            where: {
                NombreTipoTela,
                CodigoTipoTela: { [Op.ne]: codigo }
            }
        });

        if (existe) {
            LanzarError('Ya existe un tipo de tela con ese nombre', 400, 'Validacion');
        }

        await tipo.update({
            NombreTipoTela
        });

        return {
            CodigoTipoTela: tipo.CodigoTipoTela,
            NombreTipoTela: tipo.NombreTipoTela
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al editar tipo de tela', 500, 'Error');
    }
};

const EditarTela = async (codigo, data) => {
    try {

        const { CodigoTipoTela, NombreTela } = data;

        const tela = await TelaModelo.findByPk(codigo);

        if (!tela) {
            LanzarError('Tela no encontrada', 404, 'Validacion');
        }

        if (CodigoTipoTela) {
            const tipoTela = await TipoTelaModelo.findByPk(CodigoTipoTela);

            if (!tipoTela) {
                LanzarError('El tipo de tela no existe', 400, 'Validacion');
            }
        }

        if (NombreTela) {
            const existe = await TelaModelo.findOne({
                where: {
                    NombreTela,
                    CodigoTela: { [Op.ne]: codigo }
                }
            });

            if (existe) {
                LanzarError('Ya existe una tela con ese nombre', 400, 'Validacion');
            }
        }

        await tela.update({
            CodigoTipoTela,
            NombreTela
        });

        return {
            CodigoTela: tela.CodigoTela,
            CodigoTipoTela: tela.CodigoTipoTela,
            NombreTela: tela.NombreTela
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al editar tela', 500, 'Error');
    }
};
// ELIMINAR
const EliminarTipoTela = async (codigo) => {
    try {

        const tipo = await TipoTelaRelacion.findOne({
            where: {
                CodigoTipoTela: codigo
            }
        });

        if (!tipo) {
            LanzarError('Tipo de tela no encontrado', 404, 'Validacion');
        }

        // eliminación física
        await TipoTelaRelacion.destroy({
            where: {
                CodigoTipoTela: codigo
            }
        });

        return {
            message: 'Tipo de tela eliminado correctamente'
        };

    } catch (error) {
        console.error(error);
        LanzarError('Error al eliminar tipo de tela', 500, 'Error');
    }
};

const EliminarTela = async (codigo) => {
    try {

        const tela = await TelaModelo.findOne({
            where: {
                CodigoTela: codigo,
                Estatus: 1
            }
        });

        if (!tela) {
            LanzarError('Tela no encontrada', 404, 'Validacion');
        }

        await tela.update({
            Estatus: 0
        });

        return {
            message: 'Tela eliminada correctamente'
        };

    } catch (error) {

        console.error(error);

        LanzarError(
            'Error al eliminar tela',
            500,
            'Error'
        );
    }
};

const ObtenerInventarioListado = async (CodigoEmpresa) => {
    try {
        if (!CodigoEmpresa) LanzarError('Empresa es requerida', 400);

        const Inventario = await InventarioRelacion.findAll({
            where: {
                CodigoEmpresa,
                Estatus: { [Op.in]: [1, 2] } // Solo registros activos e inactivos
            },
            attributes: [
                'CodigoInventario',
                'CodigoBarras',
                'PrecioVenta',
                'StockActual',
                'Estatus' // <-- Asegúrate de incluirlo aquí
            ],
            include: [
                {
                    model: ProductoRelacion,
                    as: 'Producto',
                    attributes: ['CodigoProducto', 'NombreProducto'],
                    required: true,
                    include: [
                        {
                            model: TipoProductoRelacion,
                            as: 'TipoProducto',
                            attributes: ['NombreTipoProducto'],
                            required: true,
                            where: { NombreTipoProducto: 'FISICO' }
                        }
                    ]
                },
                { model: MarcaRelacion, as: 'Marca', attributes: ['NombreMarca'] },
                { model: EstiloRelacion, as: 'Estilo', attributes: ['NombreEstilo'] },
                { model: TallaRelacion, as: 'Talla', attributes: ['NombreTalla'] },
                { model: ColorRelacion, as: 'Color', attributes: ['NombreColor'] }
            ],
            order: [['CodigoInventario', 'DESC']]
        });

        return Inventario.map(item => ({
            CodigoInventario: item.CodigoInventario,
            Producto: item.Producto?.NombreProducto || 'Sin producto',
            TipoProducto: item.Producto?.TipoProducto?.NombreTipoProducto || 'Sin tipo',
            CodigoBarra: item.CodigoBarras,
            Marca: item.Marca?.NombreMarca || 'Sin marca',
            Diseno: item.Estilo?.NombreEstilo || 'Sin estilo',
            Talla: item.Talla?.NombreTalla || 'Sin talla',
            Color: item.Color?.NombreColor || 'Sin color',
            PrecioVenta: item.PrecioVenta,
            StockActual: item.StockActual,
            Estatus: item.Estatus // <-- Ahora sí lo tendrás en Angular
        }));

    } catch (error) {
        console.error('Error en ObtenerInventarioListado:', error);
        throw error;
    }
};
const CrearProductoInventario = async (Datos, CodigoUsuario) => {

    const Transaccion = await BaseDatos.transaction();

    try {

        const {
            Producto,
            CodigoTipoProducto,
            CodigoMarca,
            CodigoEstilo,
            CodigoTalla,
            CodigoColor,
            CodigoBarra,
            Precio,
            Stock,
            CodigoEmpresa,
            CodigoCategoria
        } = Datos;

        // =========================
        // VALIDACIONES
        // =========================

        if (!Producto)
            LanzarError('Producto es requerido', 400);

        if (!CodigoTipoProducto)
            LanzarError('Tipo de producto es requerido', 400);

        if (!CodigoMarca)
            LanzarError('Marca es requerida', 400);

        if (!CodigoEstilo)
            LanzarError('Diseño es requerido', 400);

        if (!CodigoTalla)
            LanzarError('Talla es requerida', 400);

        if (!CodigoColor)
            LanzarError('Color es requerido', 400);

        if (Precio === undefined || Precio === null)
            LanzarError('Precio es requerido', 400);

        if (Stock === undefined || Stock === null)
            LanzarError('Stock es requerido', 400);

        if (!CodigoEmpresa)
            LanzarError('Empresa es requerida', 400);

        if (!CodigoUsuario)
            LanzarError('Usuario es requerido', 400);

        // =========================
        // 1. BUSCAR PRODUCTO
        // =========================

        let ProductoDB = await ProductoModelo.findOne({
            where: {
                NombreProducto: Producto,
                CodigoEmpresa: CodigoEmpresa
            },
            transaction: Transaccion
        });

        // =========================
        // 2. CREAR O ACTUALIZAR PRODUCTO
        // =========================

        if (!ProductoDB) {

            ProductoDB = await ProductoModelo.create({
                CodigoEmpresa,
                CodigoTipoProducto,
                CodigoCategoria,
                NombreProducto: Producto,
                PrecioBase: Precio,
                Estatus: 1
            }, { transaction: Transaccion });

        } else {

            await ProductoDB.update({
                CodigoTipoProducto,
                CodigoCategoria,
                PrecioBase: Precio
            }, { transaction: Transaccion });

        }

        // =========================
        // 3. VALIDAR INVENTARIO DUPLICADO
        // =========================

        const ExisteInventario = await InventarioModelo.findOne({
            where: {
                CodigoEmpresa,
                CodigoProducto: ProductoDB.CodigoProducto,
                CodigoMarca,
                CodigoEstilo,
                CodigoTalla,
                CodigoColor
            },
            transaction: Transaccion
        });

        if (ExisteInventario) {
            LanzarError(
                'Este producto ya existe en inventario con la misma combinación',
                400
            );
        }

        // =========================
        // 4. CREAR INVENTARIO
        // =========================

        const InventarioDB = await InventarioModelo.create({
            CodigoEmpresa,
            CodigoProducto: ProductoDB.CodigoProducto,
            CodigoMarca,
            CodigoEstilo,
            CodigoTalla,
            CodigoColor,
            CodigoBarras: CodigoBarra,
            PrecioVenta: Precio,
            StockActual: Stock,
            StockMinimo: 0,
            StockMaximo: 0,
            Estatus: 1
        }, { transaction: Transaccion });

        // =========================
        // 5. MOVIMIENTO INVENTARIO
        // =========================

        await MovimientoInventarioModelo.create({
            CodigoEmpresa,
            CodigoInventario: InventarioDB.CodigoInventario,
            TipoMovimiento: 'ENTRADA',
            OrigenMovimiento: 'CREACION',
            CodigoDocumento: null,
            Cantidad: Stock,
            StockAnterior: 0,
            StockNuevo: Stock,
            Observacion: 'Creación inicial de inventario',
            CodigoUsuario,
            FechaMovimiento: new Date()
        }, { transaction: Transaccion });

        // =========================
        // 6. COMMIT
        // =========================

        await Transaccion.commit();

        return InventarioDB;

    } catch (error) {

        await Transaccion.rollback();
        throw error;

    }
};

const ObtenerInventarioPorCodigo = async (CodigoInventario) => {
    try {
        if (!CodigoInventario) LanzarError('Código de inventario es requerido', 400);

        const Inventario = await InventarioRelacion.findOne({
            where: { CodigoInventario },
            attributes: [
                'CodigoInventario',
                'CodigoBarras',
                'PrecioVenta',
                'StockActual',
                'Estatus',
                'CodigoEmpresa'
            ],
            include: [
                {
                    model: ProductoRelacion,
                    as: 'Producto',
                    attributes: ['CodigoProducto', 'NombreProducto', 'CodigoTipoProducto'], // Añadimos Código de TipoProducto
                    include: [
                        {
                            model: TipoProductoModelo,
                            as: 'TipoProducto',
                            attributes: ['CodigoTipoProducto', 'NombreTipoProducto']
                        }
                    ]
                },
                {
                    model: MarcaRelacion,
                    as: 'Marca',
                    attributes: ['CodigoMarca', 'NombreMarca']
                },
                {
                    model: EstiloRelacion,
                    as: 'Estilo',
                    attributes: ['CodigoEstilo', 'NombreEstilo']
                },
                {
                    model: TallaRelacion,
                    as: 'Talla',
                    attributes: ['CodigoTalla', 'NombreTalla']
                },
                {
                    model: ColorRelacion,
                    as: 'Color',
                    attributes: ['CodigoColor', 'NombreColor']
                }
            ]
        });

        if (!Inventario) LanzarError('Inventario no encontrado', 404);

        return {
            CodigoInventario: Inventario.CodigoInventario,
            CodigoProducto: Inventario.Producto?.CodigoProducto,
            Producto: Inventario.Producto?.NombreProducto,
            CodigoTipoProducto: Inventario.Producto?.TipoProducto?.CodigoTipoProducto,
            TipoProducto: Inventario.Producto?.TipoProducto?.NombreTipoProducto,
            CodigoMarca: Inventario.Marca?.CodigoMarca,
            Marca: Inventario.Marca?.NombreMarca,
            CodigoEstilo: Inventario.Estilo?.CodigoEstilo,
            Diseno: Inventario.Estilo?.NombreEstilo,
            CodigoTalla: Inventario.Talla?.CodigoTalla,
            Talla: Inventario.Talla?.NombreTalla,
            CodigoColor: Inventario.Color?.CodigoColor,
            Color: Inventario.Color?.NombreColor,
            CodigoBarra: Inventario.CodigoBarras,
            PrecioVenta: Inventario.PrecioVenta,
            StockActual: Inventario.StockActual,
            Estatus: Inventario.Estatus,
            CodigoEmpresa: Inventario.CodigoEmpresa
        };

    } catch (error) {
        throw error;
    }
};

const RestaurarInventario = async (CodigosInventario, CodigoUsuario) => {
    const Transaccion = await BaseDatos.transaction();

    try {
        // =========================
        // 1. Validaciones
        // =========================
        if (!CodigosInventario || (Array.isArray(CodigosInventario) && CodigosInventario.length === 0)) {
            LanzarError('Se requiere al menos un código de inventario', 400);
        }
        if (!CodigoUsuario) LanzarError('Usuario es requerido', 400);

        // Asegurarse de que sea un array
        const CodigosArray = Array.isArray(CodigosInventario) ? CodigosInventario : [CodigosInventario];

        // =========================
        // 2. Buscar inventarios existentes
        // =========================
        const InventariosDB = await InventarioModelo.findAll({
            where: { CodigoInventario: { [Op.in]: CodigosArray } },
            transaction: Transaccion
        });

        if (!InventariosDB || InventariosDB.length === 0) {
            LanzarError('No se encontraron inventarios para restaurar', 404);
        }

        // =========================
        // 3. Actualizar estatus a 1
        // =========================
        for (const inventario of InventariosDB) {
            await inventario.update({ Estatus: 1 }, { transaction: Transaccion });

            // =========================
            // 4. Registrar movimiento
            // =========================
            await MovimientoInventarioModelo.create({
                CodigoEmpresa: inventario.CodigoEmpresa,
                CodigoInventario: inventario.CodigoInventario,
                TipoMovimiento: 'ENTRADA',
                OrigenMovimiento: 'RESTAURACION',
                CodigoDocumento: null,
                Cantidad: inventario.StockActual,
                StockAnterior: 0,
                StockNuevo: inventario.StockActual,
                Observacion: 'Inventario restaurado (estatus 1)',
                CodigoUsuario,
                FechaMovimiento: new Date()
            }, { transaction: Transaccion });
        }

        await Transaccion.commit();

        return { mensaje: 'Inventario(s) restaurado(s) correctamente', CodigosInventario: CodigosArray };

    } catch (error) {
        await Transaccion.rollback();
        throw error;
    }
};

const EliminarInventario = async (CodigoInventario, CodigoUsuario) => {
    const Transaccion = await BaseDatos.transaction();

    try {
        if (!CodigoInventario) LanzarError('Código de inventario es requerido', 400);
        if (!CodigoUsuario) LanzarError('Usuario es requerido', 400);

        // =========================
        // 1. Buscar inventario
        // =========================
        const InventarioDB = await InventarioModelo.findOne({
            where: { CodigoInventario },
            transaction: Transaccion
        });

        if (!InventarioDB) LanzarError('Inventario no encontrado', 404);

        // =========================
        // 2. Actualizar estatus a 3
        // =========================
        await InventarioDB.update(
            { Estatus: 3 },
            { transaction: Transaccion }
        );

        // =========================
        // 3. Registrar movimiento de inventario (opcional)
        // =========================
        await MovimientoInventarioModelo.create({
            CodigoEmpresa: InventarioDB.CodigoEmpresa,
            CodigoInventario: InventarioDB.CodigoInventario,
            TipoMovimiento: 'SALIDA',
            OrigenMovimiento: 'ELIMINACION',
            CodigoDocumento: null,
            Cantidad: InventarioDB.StockActual,
            StockAnterior: InventarioDB.StockActual,
            StockNuevo: 0,
            Observacion: 'Inventario eliminado (estatus 3)',
            CodigoUsuario,
            FechaMovimiento: new Date()
        }, { transaction: Transaccion });

        await Transaccion.commit();

        return { mensaje: 'Inventario eliminado correctamente', CodigoInventario };

    } catch (error) {
        await Transaccion.rollback();
        throw error;
    }
};

const ObtenerInventarioEliminados = async (CodigoEmpresa) => {
    try {
        if (!CodigoEmpresa) LanzarError('Empresa es requerida', 400);

        const Inventario = await InventarioRelacion.findAll({
            where: {
                CodigoEmpresa,
                Estatus: 3  // 🔹 Solo eliminados
            },
            attributes: [
                'CodigoInventario',
                'CodigoBarras',
                'PrecioVenta',
                'StockActual'
            ],
            include: [
                {
                    model: ProductoRelacion,
                    as: 'Producto',
                    attributes: ['NombreProducto']
                },
                {
                    model: MarcaRelacion,
                    as: 'Marca',
                    attributes: ['NombreMarca']
                },
                {
                    model: EstiloRelacion,
                    as: 'Estilo',
                    attributes: ['NombreEstilo']
                },
                {
                    model: TallaRelacion,
                    as: 'Talla',
                    attributes: ['NombreTalla']
                },
                {
                    model: ColorRelacion,
                    as: 'Color',
                    attributes: ['NombreColor']
                }
            ],
            order: [['CodigoInventario', 'DESC']]
        });

        return Inventario.map(item => ({
            CodigoInventario: item.CodigoInventario,
            Producto: item.Producto?.NombreProducto,
            CodigoBarra: item.CodigoBarras,
            Marca: item.Marca?.NombreMarca,
            Diseno: item.Estilo?.NombreEstilo,
            Talla: item.Talla?.NombreTalla,
            Color: item.Color?.NombreColor,
            PrecioVenta: item.PrecioVenta,
            StockActual: item.StockActual
        }));

    } catch (error) {
        throw error;
    }
};

const ActualizarProductoInventario = async (CodigoInventario, Datos, CodigoUsuario) => {

    const Transaccion = await BaseDatos.transaction();

    try {

        const {
            Producto,
            CodigoTipoProducto,
            CodigoMarca,
            CodigoEstilo,
            CodigoTalla,
            CodigoColor,
            CodigoBarra,
            Precio,
            Stock,
            CodigoEmpresa,
            CodigoCategoria,
            Estatus
        } = Datos;

        // =========================
        // VALIDACIONES
        // =========================

        if (!CodigoInventario)
            LanzarError('Código de inventario es requerido', 400);

        if (!Producto)
            LanzarError('Producto es requerido', 400);

        if (!CodigoTipoProducto)
            LanzarError('Tipo de producto es requerido', 400);

        if (!CodigoMarca)
            LanzarError('Marca es requerida', 400);

        if (!CodigoEstilo)
            LanzarError('Diseño es requerido', 400);

        if (!CodigoTalla)
            LanzarError('Talla es requerida', 400);

        if (!CodigoColor)
            LanzarError('Color es requerido', 400);

        if (Precio === undefined || Precio === null)
            LanzarError('Precio es requerido', 400);

        if (Stock === undefined || Stock === null)
            LanzarError('Stock es requerido', 400);

        if (!CodigoEmpresa)
            LanzarError('Empresa es requerida', 400);

        if (!CodigoUsuario)
            LanzarError('Usuario es requerido', 400);

        if (Estatus === undefined || Estatus === null)
            LanzarError('Estatus es requerido', 400);

        // =========================
        // 1. BUSCAR PRODUCTO
        // =========================

        let ProductoDB = await ProductoModelo.findOne({
            where: {
                NombreProducto: Producto,
                CodigoEmpresa: CodigoEmpresa
            },
            transaction: Transaccion
        });

        // =========================
        // 2. CREAR O ACTUALIZAR PRODUCTO
        // =========================

        if (!ProductoDB) {

            ProductoDB = await ProductoModelo.create({
                CodigoEmpresa,
                CodigoTipoProducto,
                CodigoCategoria,
                NombreProducto: Producto,
                PrecioBase: Precio,
                Estatus: 1 // crear siempre activo
            }, { transaction: Transaccion });

        } else {

            await ProductoDB.update({
                CodigoTipoProducto,
                CodigoCategoria,
                PrecioBase: Precio,
                Estatus: Estatus
            }, { transaction: Transaccion });

        }

        // =========================
        // 3. BUSCAR INVENTARIO
        // =========================

        const InventarioDB = await InventarioModelo.findOne({
            where: { CodigoInventario },
            transaction: Transaccion
        });

        if (!InventarioDB)
            LanzarError('Inventario no encontrado', 404);

        // =========================
        // 4. VALIDAR DUPLICADO
        // =========================

        const ExisteOtroInventario = await InventarioModelo.findOne({
            where: {
                CodigoEmpresa,
                CodigoProducto: ProductoDB.CodigoProducto,
                CodigoMarca,
                CodigoEstilo,
                CodigoTalla,
                CodigoColor,
                CodigoInventario: { [Op.ne]: CodigoInventario }
            },
            transaction: Transaccion
        });

        if (ExisteOtroInventario) {
            LanzarError(
                'Otro inventario ya existe con la misma combinación',
                400
            );
        }

        // =========================
        // 5. ACTUALIZAR INVENTARIO
        // =========================

        const StockAnterior = InventarioDB.StockActual;

        await InventarioDB.update({
            CodigoProducto: ProductoDB.CodigoProducto,
            CodigoMarca,
            CodigoEstilo,
            CodigoTalla,
            CodigoColor,
            CodigoBarras: CodigoBarra,
            PrecioVenta: Precio,
            StockActual: Stock,
            Estatus: Estatus
        }, { transaction: Transaccion });

        // =========================
        // 6. MOVIMIENTO INVENTARIO
        // =========================

        if (StockAnterior !== Stock) {

            await MovimientoInventarioModelo.create({
                CodigoEmpresa,
                CodigoInventario: InventarioDB.CodigoInventario,
                TipoMovimiento: 'AJUSTE',
                OrigenMovimiento: 'ACTUALIZACION',
                CodigoDocumento: null,
                Cantidad: Stock,
                StockAnterior,
                StockNuevo: Stock,
                Observacion: 'Actualización de inventario',
                CodigoUsuario,
                FechaMovimiento: new Date()
            }, { transaction: Transaccion });

        }

        // =========================
        // 7. COMMIT
        // =========================

        await Transaccion.commit();

        return InventarioDB;

    } catch (error) {

        await Transaccion.rollback();
        throw error;

    }
};

module.exports = {
    EliminarTipoTela,EliminarTela,
    CrearProductoInventario,
    ObtenerInventarioListado,
    ObtenerInventarioPorCodigo,
    RestaurarInventario,
    EliminarInventario,
    ObtenerInventarioEliminados,
    ActualizarProductoInventario, ListadoTipoTela, ListadoNombreTela,
    CrearTipoTela,
    EditarTipoTela,
    ObtenerTipoTelaPorCodigo,
    CrearTela,
    EditarTela,
    ObtenerTelaPorCodigo

};