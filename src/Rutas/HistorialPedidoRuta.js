const Express = require('express');
const Router = Express.Router();
const Modelo = 'historialpedido';
const Tabla = 'HistorialPedido';

const { Listado, Obtener, ListadoTipoProducto, ListadoTipoTela, ListadoTela, 
    ListadoProducto,ObtenerProducto,ListadoCliente, CrearPedido, ListadoTipoCuello, 
    ObtenerPedido,ActualizarPedido, ListadoFormaPago, RegistrarPagoPedido, ListarPagosPorPedido } = require('../Controladores/HistorialPedidoControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('ListadoPedido', Tabla), Listado);
Router.get(`/${Modelo}/obtener/:codigo`, VerificarToken, VerificarPermisos('UnidadPedido', Tabla), Obtener);
Router.get(`/${Modelo}/tipo-producto`, VerificarToken, VerificarPermisos('ListadoTipoProducto', Tabla), ListadoTipoProducto);
Router.get(`/${Modelo}/tipo-tela`, VerificarToken, VerificarPermisos('ListadoTipoTela', Tabla), ListadoTipoTela);
Router.get(`/${Modelo}/tela`, VerificarToken, VerificarPermisos('ListadoTela', Tabla), ListadoTela);
Router.get(`/${Modelo}/forma-pago`, VerificarToken, VerificarPermisos('ListadoFormaPago', Tabla), ListadoFormaPago);
Router.get(`/${Modelo}/tipo-cuello`, VerificarToken, VerificarPermisos('ListadoTipoCuello', Tabla), ListadoTipoCuello);
Router.get(`/${Modelo}/producto`, VerificarToken, VerificarPermisos('ListadoProducto', Tabla), ListadoProducto);
Router.get(`/${Modelo}/producto/:codigo`, VerificarToken, VerificarPermisos('UnidadProducto', Tabla), ObtenerProducto);
Router.get(`/${Modelo}/cliente`, VerificarToken, VerificarPermisos('ListadoCliente', Tabla), ListadoCliente);
Router.post(`/${Modelo}/crear`,VerificarToken,VerificarPermisos('CrearPedido', Tabla),CrearPedido);
Router.get(`/${Modelo}/obtener-pedido/:CodigoPedido`, VerificarToken, VerificarPermisos('UnidadPedido', Tabla), ObtenerPedido);
Router.put(`/${Modelo}/actualizar`, VerificarToken, VerificarPermisos('EditarPedido', Tabla), ActualizarPedido);
Router.post(`/${Modelo}/pagar`, VerificarToken, VerificarPermisos('PagarPedido', Tabla), RegistrarPagoPedido);
Router.get(`/${Modelo}/pagos/:CodigoPedido`, VerificarToken, VerificarPermisos('ListadoPagoPedido', Tabla), ListarPagosPorPedido);

module.exports = Router;