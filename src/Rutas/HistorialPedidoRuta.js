const Express = require('express');
const Router = Express.Router();
const Modelo = 'historialpedido';
const Tabla = 'HistorialPedido';

const { Listado, Obtener, ListadoTipoProducto, ListadoTipoTela, ListadoTela, 
    ListadoProducto,ObtenerProducto,ListadoCliente } = require('../Controladores/HistorialPedidoControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado`, VerificarToken, VerificarPermisos('ListadoPedido', Tabla), Listado);
Router.get(`/${Modelo}/obtener/:codigo`, VerificarToken, VerificarPermisos('UnidadPedido', Tabla), Obtener);
Router.get(`/${Modelo}/tipo-producto`, VerificarToken, VerificarPermisos('ListadoTipoProducto', Tabla), ListadoTipoProducto);
Router.get(`/${Modelo}/tipo-tela`, VerificarToken, VerificarPermisos('ListadoTipoTela', Tabla), ListadoTipoTela);
Router.get(`/${Modelo}/tela`, VerificarToken, VerificarPermisos('ListadoTela', Tabla), ListadoTela);
Router.get(`/${Modelo}/producto`, VerificarToken, VerificarPermisos('ListadoProducto', Tabla), ListadoProducto);
Router.get(`/${Modelo}/producto/:codigo`, VerificarToken, VerificarPermisos('UnidadProducto', Tabla), ObtenerProducto);
Router.get(`/${Modelo}/cliente`, VerificarToken, VerificarPermisos('ListadoCliente', Tabla), ListadoCliente);

module.exports = Router;