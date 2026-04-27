const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const { LanzarError } = require('../Utilidades/ErrorServicios');

const LimpiarBaseDatosPruebas = async (SuperAdmin) => {

    const transaction = await BaseDatos.transaction();

    try {

        // 🔒 Seguridad
        if (!SuperAdmin) {
            LanzarError('No autorizado para ejecutar limpieza de base de datos', 403);
        }

        // 🧹 DELETE (orden hijo → padre)
        const deletes = [

            'DELETE FROM Op.PedidoDetalleMedida',
            'DELETE FROM Op.PedidoDetalle',
            'DELETE FROM Op.Pedido',

            'DELETE FROM Inv.MovimientoInventario',
            'DELETE FROM Inv.Inventario',

            'DELETE FROM Fn.PagoAplicacion',
            'DELETE FROM Fn.Pago',

            'DELETE FROM Ca.Cliente',
            'DELETE FROM Ca.Producto',
            'DELETE FROM Ca.Tela',
            'DELETE FROM Ca.TipoTela',

            'DELETE FROM Ca.Estilo',
            'DELETE FROM Ca.Marca',
            'DELETE FROM Ca.Color',
            'DELETE FROM Ca.Talla',

            'DELETE FROM Ca.TipoSolapa',
            'DELETE FROM Ca.Tamano',
            'DELETE FROM Ca.TipoCorte',
            'DELETE FROM Ca.TipoCuello',
            'DELETE FROM Ca.Abertura',
            'DELETE FROM Ca.Boton',
            'DELETE FROM Ca.Categoria'
        ];

        // 🔁 RESEED (reinicio de identity)
        const reseeds = [

            'DBCC CHECKIDENT (\'Op.PedidoDetalleMedida\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Op.PedidoDetalle\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Op.Pedido\', RESEED, 0)',

            'DBCC CHECKIDENT (\'Inv.MovimientoInventario\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Inv.Inventario\', RESEED, 0)',

            'DBCC CHECKIDENT (\'Fn.PagoAplicacion\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Fn.Pago\', RESEED, 0)',

            'DBCC CHECKIDENT (\'Ca.Cliente\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Producto\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Tela\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.TipoTela\', RESEED, 0)',

            'DBCC CHECKIDENT (\'Ca.Estilo\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Marca\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Color\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Talla\', RESEED, 0)',

            'DBCC CHECKIDENT (\'Ca.TipoSolapa\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Tamano\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.TipoCorte\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.TipoCuello\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Abertura\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Boton\', RESEED, 0)',
            'DBCC CHECKIDENT (\'Ca.Categoria\', RESEED, 0)'
        ];

        // 🧹 1. DELETE
        for (const query of deletes) {
            await BaseDatos.query(query, { transaction });
        }

        // 🔁 2. RESEED (SIN SILENCIAR ERRORES)
        for (const query of reseeds) {
            await BaseDatos.query(query, { transaction });
        }

        await transaction.commit();

        return {
            mensaje: 'Base de datos limpiada y contadores reiniciados correctamente'
        };

    } catch (error) {

        // ❗ rollback siempre
        await transaction.rollback();

        // 🔥 ERROR REAL (NO SE OCULTA)
        throw error;
    }
};

module.exports = {
    LimpiarBaseDatosPruebas
};