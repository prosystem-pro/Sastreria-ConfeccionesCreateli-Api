const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname, '..', 'Modelos');

const UsuarioModelo = require(Path.join(RutaModelos, 'Usuario.js'))(BaseDatos, Sequelize.DataTypes);
const RolModelo = require(Path.join(RutaModelos, 'Rol.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoModelo = require(Path.join(RutaModelos, 'Permiso.js'))(BaseDatos, Sequelize.DataTypes);
const RecursoModelo = require(Path.join(RutaModelos, 'Recurso.js'))(BaseDatos, Sequelize.DataTypes);
const PermisoRolRecursoModelo = require(Path.join(RutaModelos, 'PermisoRolRecurso.js'))(BaseDatos, Sequelize.DataTypes);
const EmpresaModelo = require(Path.join(RutaModelos, 'Empresa.js'))(BaseDatos, Sequelize.DataTypes);
const ClienteModelo = require(Path.join(RutaModelos, 'Cliente.js'))(BaseDatos, Sequelize.DataTypes);
const PedidoModelo = require(Path.join(RutaModelos, 'Pedido.js'))(BaseDatos, Sequelize.DataTypes);
const EstadoPedidoModelo = require(Path.join(RutaModelos, 'EstadoPedido.js'))(BaseDatos, Sequelize.DataTypes);
const PagoModelo = require(Path.join(RutaModelos, 'Pago.js'))(BaseDatos, Sequelize.DataTypes);
const PagoAplicacionModelo = require(Path.join(RutaModelos, 'PagoAplicacion.js'))(BaseDatos, Sequelize.DataTypes);

UsuarioModelo.belongsTo(EmpresaModelo, { foreignKey: 'CodigoEmpresa', as: 'Empresa' });
EmpresaModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoEmpresa', as: 'Usuarios' });

UsuarioModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol', as: 'Rol' });
RolModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoRol' });

PermisoRolRecursoModelo.belongsTo(PermisoModelo, { foreignKey: 'CodigoPermiso', as: 'Permiso' });
PermisoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoPermiso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RecursoModelo, { foreignKey: 'CodigoRecurso', as: 'Recurso' });
RecursoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRecurso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol', as: 'Rol' });
RolModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRol', as: 'PermisoRolRecursos' });


// Módulo Historial Pedidos

PedidoModelo.belongsTo(ClienteModelo, { foreignKey: 'CodigoCliente', as: 'CaCliente' });
ClienteModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoCliente', as: 'Pedidos' });

PedidoModelo.belongsTo(EstadoPedidoModelo, { foreignKey: 'CodigoEstadoPedido', as: 'CaEstadoPedido' });
EstadoPedidoModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoEstadoPedido', as: 'Pedidos' });

PedidoModelo.belongsTo(UsuarioModelo, { foreignKey: 'CodigoUsuario', as: 'AdUsuario' });
UsuarioModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoUsuario', as: 'Pedidos' });

PagoAplicacionModelo.belongsTo(PagoModelo, { foreignKey: 'CodigoPago', as: 'FnPago' });
PagoModelo.hasMany(PagoAplicacionModelo, { foreignKey: 'CodigoPago', as: 'Aplicaciones' });

PagoAplicacionModelo.belongsTo(PedidoModelo, { foreignKey: 'CodigoDocumento', as: 'Pedido' });
PedidoModelo.hasMany(PagoAplicacionModelo, { foreignKey: 'CodigoDocumento', as: 'PagosAplicados' });

module.exports = {
  UsuarioModelo,
  EmpresaModelo,
  RolModelo,
  PermisoModelo,
  PermisoRolRecursoModelo,
  RecursoModelo,
  ClienteModelo,
  PedidoModelo,
  EstadoPedidoModelo,
  PagoModelo,
  PagoAplicacionModelo,
};
