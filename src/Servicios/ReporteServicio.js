const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const { Op } = require('sequelize');

const {
    PedidoModelo,
    PagoModelo,
    PagoAplicacionModelo
} = require('../Relaciones/Relaciones');

const { LanzarError } = require('../Utilidades/ErrorServicios');
const ReportePedidos = async (FechaInicio, FechaFin) => {

    try {

        let filtroPedido = {
            Estatus: 1,
            TipoDocumento: 'PEDIDO'
        };

        let filtroPago = {
            Estatus: 1
        };

        if (FechaInicio && FechaFin) {

            filtroPedido.FechaCreacion = {
                [Op.between]: [
                    `${FechaInicio} 00:00:00`,
                    `${FechaFin} 23:59:59`
                ]
            };

            filtroPago.FechaPago = {
                [Op.between]: [
                    `${FechaInicio} 00:00:00`,
                    `${FechaFin} 23:59:59`
                ]
            };
        }

        // ================= TOTAL PEDIDOS =================
        const pedidos = await PedidoModelo.findAll({

            attributes: [

                [
                    Sequelize.fn('COUNT', Sequelize.col('CodigoPedido')),
                    'TotalPedidos'
                ],

                [
                    Sequelize.fn('SUM', Sequelize.col('Total')),
                    'MontoPedidos'
                ]

            ],

            where: filtroPedido,
            raw: true
        });

        // ================= TOTAL ABONOS =================
        const abonos = await PagoAplicacionModelo.findAll({

            attributes: [

                [
                    Sequelize.fn('SUM', Sequelize.col('MontoAplicado')),
                    'TotalAbono'
                ]

            ],

            where: {
                TipoDocumento: 'PEDIDO'
            },

            include: [

                {
                    model: PagoModelo,
                    as: 'FnPago',
                    attributes: [],
                    where: filtroPago,
                    required: true
                },

                {
                    model: PedidoModelo,
                    as: 'Pedido',
                    attributes: [],
                    where: filtroPedido,
                    required: true
                }

            ],

            raw: true
        });

        const dataPedidos = pedidos[0] || {};
        const dataAbonos = abonos[0] || {};

        const TotalPedidos = Number(dataPedidos.TotalPedidos || 0);
        const MontoPedidos = Number(dataPedidos.MontoPedidos || 0);
        const TotalAbono = Number(dataAbonos.TotalAbono || 0);

        const SaldoPendiente = MontoPedidos - TotalAbono;

        return {

            TotalPedidos,
            MontoPedidos,
            TotalAbono,
            SaldoPendiente

        };

    } catch (error) {

        console.error('Error en ReportePedidos:', error);

        LanzarError(
            'Error al generar reporte de pedidos',
            500,
            'Error'
        );
    }
};

const ReporteVentas = async (FechaInicio, FechaFin) => {

    try {

        let where = {
            Estatus: 1,
            TipoDocumento: 'VENTA'
        };

        if (FechaInicio && FechaFin) {

            where.FechaCreacion = {
                [Op.between]: [
                    `${FechaInicio} 00:00:00`,
                    `${FechaFin} 23:59:59`
                ]
            };
        }

        const ventas = await PedidoModelo.findAll({

            attributes: [

                [
                    Sequelize.fn('COUNT', Sequelize.col('CodigoPedido')),
                    'TotalVentas'
                ],

                [
                    Sequelize.fn('SUM', Sequelize.col('Total')),
                    'MontoVentas'
                ]

            ],

            where,
            raw: true

        });

        const data = ventas[0] || {};

        return {

            TotalVentas: Number(data.TotalVentas || 0),
            MontoVentas: Number(data.MontoVentas || 0)

        };

    } catch (error) {

        console.error('Error en ReporteVentas:', error);

        LanzarError(
            'Error al generar reporte de ventas',
            500,
            'Error'
        );
    }
};
module.exports = {
    ReporteVentas, ReportePedidos
};