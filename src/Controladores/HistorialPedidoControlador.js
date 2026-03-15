// Controladores/HistorialPedidoControlador.js

const Servicio = require('../Servicios/HistorialPedidoServicio');
const ManejarError = require('../Utilidades/ErrorControladores');
const ResponderExito = require('../Utilidades/RespuestaExitosaControlador');

const Listado = async (req, res) => {
  try {
    const Objeto = await Servicio.Listado();
    return ResponderExito(res, 'Listado de pedidos obtenido correctamente.', Objeto || []);
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener los pedidos');
  }
};

const Obtener = async (req, res) => {
  try {

    const { codigo } = req.params;

    const Objeto = await Servicio.Obtener(codigo);

    return ResponderExito(
      res,
      'Pedido obtenido correctamente.',
      Objeto || {}
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al obtener el pedido');

  }
};

const ListadoTipoProducto = async (req, res) => {
  try {

    const Objeto = await Servicio.ListadoTipoProducto();

    return ResponderExito(
      res,
      'Tipos de producto obtenidos correctamente.',
      Objeto || []
    );

  } catch (error) {

    return ManejarError(
      error,
      res,
      'Error al obtener tipos de producto'
    );

  }
};

const ListadoTipoTela = async (req, res) => {
  try {

    const Objeto = await Servicio.ListadoTipoTela();

    return ResponderExito(
      res,
      'Tipos de tela obtenidos correctamente.',
      Objeto || []
    );

  } catch (error) {

    return ManejarError(
      error,
      res,
      'Error al obtener tipos de tela'
    );

  }
};

const ListadoTela = async (req, res) => {
  try {

    const Objeto = await Servicio.ListadoTela();

    return ResponderExito(
      res,
      'Telas obtenidas correctamente.',
      Objeto || []
    );

  } catch (error) {

    return ManejarError(
      error,
      res,
      'Error al obtener telas'
    );

  }
};

const ListadoProducto = async (req, res) => {
  try {
    const productos = await Servicio.ListadoProducto();
    return ResponderExito(
      res,
      'Productos obtenidos correctamente.',
      productos || []
    );
  } catch (error) {
    return ManejarError(error, res, 'Error al obtener productos');
  }
};

const ObtenerProducto = async (req, res) => {
  try {
    const { codigo } = req.params;

    // Llamamos al servicio que devuelve solo nombre y precio
    const producto = await Servicio.ObtenerProducto(codigo);

    return ResponderExito(
      res,
      'Producto obtenido correctamente.',
      producto || {}
    );

  } catch (error) {
    return ManejarError(
      error,
      res,
      'Error al obtener el producto'
    );
  }
};

const ListadoCliente = async (req, res) => {
  try {

    const clientes = await Servicio.ListadoCliente();

    return ResponderExito(
      res,
      'Clientes obtenidos correctamente.',
      clientes || []
    );

  } catch (error) {

    return ManejarError(error, res, 'Error al obtener clientes');

  }
};

module.exports = {
  Listado, Obtener, ListadoTipoProducto, ListadoTipoTela, ListadoTela, ListadoProducto, ObtenerProducto, ListadoCliente
};