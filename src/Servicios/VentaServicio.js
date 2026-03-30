const { InventarioModelo: InventarioRelacion, ProductoModelo: ProductoRelacion } = require('../Relaciones/Relaciones');
const { Op } = require('sequelize');
const { LanzarError } = require('../Utilidades/ErrorServicios');

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

module.exports = {
 ListadoProducto
};