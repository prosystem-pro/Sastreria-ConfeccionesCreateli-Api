// Servicios/ClienteServicio.js

const Sequelize = require('sequelize');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Modelo = require('../Modelos/Cliente')(BaseDatos, Sequelize.DataTypes);
const { LanzarError } = require('../Utilidades/ErrorServicios');

const NombreModelo = 'NombreCliente';
const CodigoModelo = 'CodigoCliente';

const Listado = async () => {
    return await Modelo.findAll({
        where: { Estatus: [1, 2] },
        order: [[NombreModelo, 'ASC']]
    });
};

const Crear = async (datos) => {

    try {

        const registro = await Modelo.create({
            NombreCliente: datos.NombreCliente,
            NIT: datos.NIT,
            Celular: datos.Celular,
            Estatus: 1,
            Direccion: datos.Direccion,
            CodigoEmpresa: datos.CodigoEmpresa
        });

        return registro;

    } catch (error) {

        LanzarError('Error al crear cliente', error);
    }

};

const Obtener = async (codigo) => {
    try {
        const registro = await Modelo.findOne({
            where: {
                [CodigoModelo]: codigo,
                Estatus: [1, 2]
            }
        });

        if (!registro) {
            // Cliente no encontrado → 404
            LanzarError('Cliente no encontrado', 404, 'Alerta');
        }

        return registro;

    } catch (error) {
        // Si ya es un error lanzado con LanzarError, relánzalo tal cual
        if (error.statusCode && typeof error.statusCode === 'number') {
            throw error;
        }
        // Cualquier otro error inesperado → 500
        LanzarError('Error al obtener cliente', 500, 'Error');
    }
};

const Editar = async (codigo, datos) => {

    try {

        const registro = await Modelo.findByPk(codigo);

        if (!registro) {
            LanzarError('Cliente no encontrado');
        }

        await registro.update({
            NombreCliente: datos.NombreCliente,
            NIT: datos.NIT,
            Celular: datos.Celular
        });

        return registro;

    } catch (error) {

        LanzarError('Error al editar cliente', error);
    }

};

const Eliminar = async (codigo) => {
  try {
    const registro = await Modelo.findByPk(codigo);

    if (!registro) {
      LanzarError('Cliente no encontrado');
    }

    // DELETE real
    await registro.destroy();

    return true;

  } catch (error) {
    LanzarError('Error al eliminar cliente', error);
  }
};

module.exports = {
    Listado, Crear, Editar, Eliminar, Obtener
};