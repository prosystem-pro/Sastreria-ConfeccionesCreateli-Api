const Express = require('express');
const Router = Express.Router();

const Modelo = 'configuracion';
const Tabla = 'Configuracion';

const { CrearProductoInventario, ObtenerInventarioListado, ObtenerInventarioEliminados,
    EliminarInventario, RestaurarInventario, ActualizarProductoInventario,
    ObtenerInventarioPorCodigo, ListadoTipoTela, ListadoTela, CrearTipoTela, EditarTipoTela,
    ObtenerTipoTelaPorCodigo, CrearTela, EditarTela, ObtenerTelaPorCodigo,EliminarTipoTela, EliminarTela } = require('../Controladores/ConfiguracionControlador');

const VerificarToken = require('../FuncionIntermedia/VerificarToken');
const VerificarPermisos = require('../FuncionIntermedia/VerificarPermisos');



Router.post(`/${Modelo}/crear`, VerificarToken, VerificarPermisos('Crear', Tabla), CrearProductoInventario);
Router.get(`/${Modelo}/listado/:CodigoEmpresa`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerInventarioListado);
Router.get(`/${Modelo}/eliminados/:CodigoEmpresa`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerInventarioEliminados);
Router.delete(`/${Modelo}/eliminar/:CodigoInventario`, VerificarToken, VerificarPermisos('Eliminar', Tabla), EliminarInventario);
Router.post(`/${Modelo}/restaurar`, VerificarToken, VerificarPermisos('Editar', Tabla), RestaurarInventario);
Router.put(`/${Modelo}/actualizar/:CodigoInventario`, VerificarToken, VerificarPermisos('Editar', Tabla), ActualizarProductoInventario);
Router.get(`/${Modelo}/obtener/:CodigoInventario`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerInventarioPorCodigo);
Router.get(`/${Modelo}/listado-tipo-tela`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoTipoTela);
Router.get(`/${Modelo}/listado-tela`, VerificarToken, VerificarPermisos('Ver', Tabla), ListadoTela);

Router.post(`/${Modelo}/crear-tipo-tela`, VerificarToken, VerificarPermisos('Crear', Tabla), CrearTipoTela);
Router.put(`/${Modelo}/editar-tipo-tela/:codigo`, VerificarToken, VerificarPermisos('Editar', Tabla), EditarTipoTela);
Router.get(`/${Modelo}/obtener-tipo-tela/:codigo`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerTipoTelaPorCodigo);
Router.post(`/${Modelo}/crear-tela`, VerificarToken, VerificarPermisos('Crear', Tabla), CrearTela);
Router.put(`/${Modelo}/editar-tela/:codigo`, VerificarToken, VerificarPermisos('Editar', Tabla), EditarTela);
Router.get(`/${Modelo}/obtener-tela/:codigo`, VerificarToken, VerificarPermisos('Ver', Tabla), ObtenerTelaPorCodigo);
Router.delete(`/${Modelo}/eliminar-tipo-tela/:codigo`, VerificarToken, VerificarPermisos('Eliminar', Tabla), EliminarTipoTela);
Router.delete(`/${Modelo}/eliminar-tela/:codigo`, VerificarToken, VerificarPermisos('Eliminar', Tabla), EliminarTela);

module.exports = Router;