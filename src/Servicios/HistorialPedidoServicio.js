const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');

const { PedidoModelo, ClienteModelo, EstadoPedidoModelo, UsuarioModelo } = require('../Relaciones/Relaciones');
const TipoProducto = require('../Modelos/TipoProducto')(BaseDatos, Sequelize.DataTypes);
const TipoTela = require('../Modelos/TipoTela')(BaseDatos, Sequelize.DataTypes);
const Tela = require('../Modelos/Tela')(BaseDatos, Sequelize.DataTypes);
const Producto = require('../Modelos/Producto')(BaseDatos, Sequelize.DataTypes);
const Cliente = require('../Modelos/Cliente')(BaseDatos, Sequelize.DataTypes);
const { LanzarError } = require('../Utilidades/ErrorServicios');
const { Op } = require('sequelize');


const Listado = async () => {
    try {

        const pedidos = await PedidoModelo.findAll({
            where: {
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

        return pedidos.map(p => {

            const Total = Number(p.Total || 0);
            const Pagado = 0;
            const SaldoPendiente = Total - Pagado;

            return {
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

                SaldoPendiente: SaldoPendiente
            };

        });

    } catch (error) {

        // Registrar error real en consola
        console.error(error);

        // Lanzar error controlado
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

const ListadoProducto = async () => {
    try {
        const productos = await Producto.findAll({
            where: { Estatus: 1 },
            attributes: ['CodigoProducto', 'NombreProducto'],
            order: [['NombreProducto', 'ASC']]
        });

        return productos.map(p => ({
            CodigoProducto: p.CodigoProducto,
            NombreProducto: p.NombreProducto
        }));

    } catch (error) {
        console.error(error);
        LanzarError('Error al obtener productos', 500, 'Error');
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

module.exports = { Listado, Obtener, ListadoTipoProducto, ListadoTipoTela, ListadoTela, ListadoProducto, ObtenerProducto, ListadoCliente };