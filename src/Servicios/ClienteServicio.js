// Servicios/ClienteServicio.js

const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Modelo = require('../Modelos/Cliente')(BaseDatos, Sequelize.DataTypes);
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombreCliente';
const CodigoModelo = 'CodigoCliente';

const Listado = async (CodigoEmpresa, SuperAdmin) => {

    let where = {
        Estatus: [1, 2]
    };

    if (!SuperAdmin) {
        where.CodigoEmpresa = CodigoEmpresa;
    }

    return await Modelo.findAll({
        where,
        order: [[NombreModelo, 'ASC']]
    });
};

const Crear = async (datos, CodigoEmpresa) => {
    try {

        const registro = await Modelo.create({
            NombreCliente: datos.NombreCliente,
            NIT: datos.NIT,
            Celular: datos.Celular,
            Direccion: datos.Direccion,
            Estatus: 1,
            CodigoEmpresa: CodigoEmpresa // 🔥 viene del token
        });

        return registro;

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            LanzarError('El cliente ya existe (NIT duplicado)', 400);
        }

        LanzarError('Error al crear cliente', 500);
    }
};

const Obtener = async (codigo, CodigoEmpresa, SuperAdmin) => {
    try {

        let where = {
            [CodigoModelo]: codigo,
            Estatus: [1, 2]
        };

        if (!SuperAdmin) {
            where.CodigoEmpresa = CodigoEmpresa;
        }

        const registro = await Modelo.findOne({ where });

        if (!registro) {
            LanzarError('Cliente no encontrado', 404, 'Alerta');
        }

        return registro;

    } catch (error) {
        if (error.statusCode) throw error;
        LanzarError('Error al obtener cliente', 500);
    }
};

const Editar = async (codigo, datos, CodigoEmpresa) => {
    try {

        const registro = await Modelo.findOne({
            where: {
                [CodigoModelo]: codigo,
                CodigoEmpresa
            }
        });

        if (!registro) {
            LanzarError('Cliente no encontrado o no pertenece a la empresa', 404);
        }

        await registro.update({
            NombreCliente: datos.NombreCliente,
            NIT: datos.NIT,
            Celular: datos.Celular,
            Direccion: datos.Direccion
        });

        return registro;

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            LanzarError('Ya existe un cliente con ese NIT', 400);
        }

        if (error.statusCode) throw error;

        LanzarError('Error al editar cliente', 500);
    }
};

const Eliminar = async (codigo, CodigoEmpresa, SuperAdmin) => {
    try {

        let where = {
            [CodigoModelo]: codigo
        };

        if (!SuperAdmin) {
            where.CodigoEmpresa = CodigoEmpresa;
        }

        const registro = await Modelo.findOne({ where });

        if (!registro) {
            LanzarError('Cliente no encontrado o no autorizado', 404);
        }

        await registro.destroy();

        return true;

    } catch (error) {

        if (error.name === 'SequelizeForeignKeyConstraintError') {
            LanzarError('No se puede eliminar el cliente porque tiene pedidos asociados', 400);
        }

        if (error.statusCode) throw error;

        LanzarError('Error al eliminar cliente', 500);
    }
};


module.exports = {
    Listado, Crear, Editar, Eliminar, Obtener
};