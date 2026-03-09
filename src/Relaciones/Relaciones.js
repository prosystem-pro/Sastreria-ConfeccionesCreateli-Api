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



UsuarioModelo.belongsTo(EmpresaModelo, { foreignKey: 'CodigoEmpresa', as: 'Empresa' });
EmpresaModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoEmpresa', as: 'Usuarios' });

UsuarioModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol',as: 'Rol' });
RolModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoRol' });

PermisoRolRecursoModelo.belongsTo(PermisoModelo, { foreignKey: 'CodigoPermiso', as: 'Permiso' });
PermisoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoPermiso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RecursoModelo, { foreignKey: 'CodigoRecurso', as: 'Recurso' });
RecursoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRecurso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol', as: 'Rol' });
RolModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRol', as: 'PermisoRolRecursos' });

module.exports = {
  UsuarioModelo,
  EmpresaModelo,
  RolModelo,
  PermisoModelo,
  PermisoRolRecursoModelo,
  RecursoModelo
};
