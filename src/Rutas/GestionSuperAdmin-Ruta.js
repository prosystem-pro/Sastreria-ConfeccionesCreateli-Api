const Express = require('express');
const Router = Express.Router();
const Modelo = 'gestionsuperadmin';
const Tabla = 'GestionSuperAdmin';

const { LimpiarBaseDatosPruebas } = require('../Controladores/GestionSuperAdmin-Controlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');

Router.post(`/${Modelo}/limpiar-bd-pruebas`, VerificarToken, VerificarPermisos('Eliminar', Tabla), LimpiarBaseDatosPruebas);

module.exports = Router;