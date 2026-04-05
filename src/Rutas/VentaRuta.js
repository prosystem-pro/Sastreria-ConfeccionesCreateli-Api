const Express = require('express');
const Router = Express.Router();

const Modelo = 'venta';
const Tabla = 'Venta';

const { ListadoProducto, CrearVenta, ListadoVentas, EliminarVenta, GenerarPDFVenta, ObtenerDatosImpresionVenta } = require('../Controladores/VentaControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.get(`/${Modelo}/listado-producto`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoProducto);
Router.get(`/${Modelo}/listado-ventas`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoVentas); 
Router.post(`/${Modelo}/crear-venta`, VerificarToken, VerificarPermisos('Crear', Tabla), CrearVenta);
Router.delete(`/${Modelo}/eliminar-venta/:CodigoPedido`, VerificarToken, VerificarPermisos('Eliminar', Tabla), EliminarVenta);
Router.get(`/${Modelo}/pdf-venta/:CodigoPedido`, VerificarToken, VerificarPermisos('Ver', Tabla), GenerarPDFVenta);
Router.get(`/${Modelo}/imprimir-venta/:CodigoPedido`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerDatosImpresionVenta);

module.exports = Router;