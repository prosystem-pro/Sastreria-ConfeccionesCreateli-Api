const Express = require('express');
const Router = Express.Router();

const Modelo = 'venta';
const Tabla = 'Venta';

const { ListadoProducto } = require('../Controladores/VentaControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');


Router.get(`/${Modelo}/listado-producto`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoProducto);

module.exports = Router;