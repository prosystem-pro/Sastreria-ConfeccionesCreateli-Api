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

        const camposRequeridos = ['NombreCliente', 'NIT', 'Celular', 'Direccion'];

        for (const campo of camposRequeridos) {
            if (!datos[campo] || String(datos[campo]).trim() === '') {
                LanzarError(`El campo ${campo} es obligatorio`, 400);
            }
        }
        const payload = {
            NombreCliente: datos.NombreCliente.trim(),
            NIT: datos.NIT.trim(),
            Celular: datos.Celular.trim(),
            Direccion: datos.Direccion.trim(),
            Correo: datos.Correo ? datos.Correo.trim() : null,
            Estatus: 1,
            CodigoEmpresa
        };

        const registro = await Modelo.create(payload);

        return registro;

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {

            const campo = error.errors?.[0]?.path;

            if (campo === 'NIT') {
                LanzarError('Ya existe un cliente con ese NIT en esta empresa', 400);
            }

            if (campo === 'NombreCliente') {
                LanzarError('Ya existe un cliente con ese nombre en esta empresa', 400);
            }

            LanzarError('Cliente duplicado', 400);
        }

        if (error.name === 'SequelizeValidationError') {
            const errores = error.errors.map(e => e.message);
            LanzarError(errores.join(', '), 400);
        }


        if (error.name === 'SequelizeDatabaseError') {
            if (error.parent?.message.includes('NULL')) {
                LanzarError('Faltan campos obligatorios', 400);
            }
        }

        throw error;
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

        throw error;
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

        const camposRequeridos = ['NombreCliente', 'NIT', 'Celular', 'Direccion'];

        for (const campo of camposRequeridos) {
            if (!datos[campo] || String(datos[campo]).trim() === '') {
                LanzarError(`El campo ${campo} es obligatorio`, 400);
            }
        }

        const payload = {
            NombreCliente: datos.NombreCliente.trim(),
            NIT: datos.NIT.trim(),
            Celular: datos.Celular.trim(),
            Direccion: datos.Direccion.trim(),
            Correo: datos.Correo ? datos.Correo.trim() : null
        };

        await registro.update(payload);

        return registro;

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {

            const campo = error.errors?.[0]?.path;

            if (campo === 'NIT') {
                LanzarError('Ya existe un cliente con ese NIT en esta empresa', 400);
            }

            if (campo === 'NombreCliente') {
                LanzarError('Ya existe un cliente con ese nombre en esta empresa', 400);
            }

            LanzarError('Cliente duplicado', 400);
        }

        if (error.name === 'SequelizeValidationError') {
            const errores = error.errors.map(e => e.message);
            LanzarError(errores.join(', '), 400);
        }

        if (error.name === 'SequelizeDatabaseError') {
            if (error.parent?.message.includes('NULL')) {
                LanzarError('Faltan campos obligatorios', 400);
            }
        }

        if (error.statusCode) throw error;

        throw error;
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
            LanzarError('No se puede eliminar el cliente porque tiene registros asociados', 400);
        }

        if (error.statusCode) throw error;

        throw error;
    }
};

module.exports = {
    Listado, Crear, Editar, Eliminar, Obtener
};