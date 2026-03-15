// Controladores/ClienteControlador.js

const Servicio = require('../Servicios/ClienteServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');


const Listado = async (req, res) => {
  try {
    const Objeto = await Servicio.Listado();
    return ResponderExito(res, 'Listado de clientes obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los clientes');
  }
};

const Crear = async (req, res) => {
  try {

    const Objeto = await Servicio.Crear(req.body);

    return ResponderExito(
      res,
      'Cliente creado correctamente.',
      Objeto
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al crear el cliente');

  }
};

const Obtener = async (req, res) => {
  try {

    const Codigo = req.params.codigo;

    const Objeto = await Servicio.Obtener(Codigo);

    return ResponderExito(
      res,
      'Cliente obtenido correctamente.',
      Objeto
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al obtener el cliente');

  }
};

const Editar = async (req, res) => {
  try {

    const Codigo = req.params.codigo;

    const Objeto = await Servicio.Editar(Codigo, req.body);

    return ResponderExito(
      res,
      'Cliente actualizado correctamente.',
      Objeto
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al actualizar el cliente');

  }
};


const Eliminar = async (req, res) => {
  try {

    const Codigo = req.params.codigo;

    await Servicio.Eliminar(Codigo);

    return ResponderExito(
      res,
      'Cliente eliminado correctamente.',
      true
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al eliminar el cliente');

  }
};

module.exports = { Listado, Crear, Editar, Eliminar, Obtener };