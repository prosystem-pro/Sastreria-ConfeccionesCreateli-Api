const Express = require('express');
const Router = Express.Router();

const Modelo = 'venta';
const Tabla = 'Venta';

const { ListadoProducto, CrearVenta, ListadoVentas, EliminarVenta } = require('../Controladores/VentaControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado-producto`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoProducto);
Router.get(`/${Modelo}/listado-ventas`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoVentas); 
Router.post(`/${Modelo}/crear-venta`, VerificarToken, VerificarPermisos('Crear', Tabla), CrearVenta);
Router.delete(`/${Modelo}/eliminar-venta/:CodigoPedido`, VerificarToken, VerificarPermisos('Eliminar', Tabla), EliminarVenta);


module.exports = Router;