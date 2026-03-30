const Path = require('path');
const BaseDatos = require('../BaseDatos/ConexionBaseDatos');
const Sequelize = require('sequelize');

const RutaModelos = Path.join(__dirname, '..', 'Modelos');

// Modelos principales
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
const PedidoDetalleMedidaModelo = require(Path.join(RutaModelos, 'PedidoDetalleMedida.js'))(BaseDatos, Sequelize.DataTypes);
const TipoMedidaModelo = require(Path.join(RutaModelos, 'TipoMedida.js'))(BaseDatos, Sequelize.DataTypes);
const MarcaModelo = require(Path.join(RutaModelos, 'Marca.js'))(BaseDatos, Sequelize.DataTypes);
const EstiloModelo = require(Path.join(RutaModelos, 'Estilo.js'))(BaseDatos, Sequelize.DataTypes);
const TallaModelo = require(Path.join(RutaModelos, 'Talla.js'))(BaseDatos, Sequelize.DataTypes);
const ColorModelo = require(Path.join(RutaModelos, 'Color.js'))(BaseDatos, Sequelize.DataTypes);

// Modelos que fallaban
const ProductoModelo = require(Path.join(RutaModelos, 'Producto.js'))(BaseDatos, Sequelize.DataTypes);
const InventarioModelo = require(Path.join(RutaModelos, 'Inventario.js'))(BaseDatos, Sequelize.DataTypes);
const PedidoDetalleModelo = require(Path.join(RutaModelos, 'PedidoDetalle.js'))(BaseDatos, Sequelize.DataTypes);
const TipoProductoModelo = require(Path.join(RutaModelos, 'TipoProducto.js'))(BaseDatos, Sequelize.DataTypes);
const TipoTelaModelo = require(Path.join(RutaModelos, 'TipoTela.js'))(BaseDatos, Sequelize.DataTypes);
const TelaModelo = require(Path.join(RutaModelos, 'Tela.js'))(BaseDatos, Sequelize.DataTypes);

// ===================== USUARIO - EMPRESA =====================
UsuarioModelo.belongsTo(EmpresaModelo, { foreignKey: 'CodigoEmpresa', as: 'Empresa' });
EmpresaModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoEmpresa', as: 'Usuarios' });

// ===================== USUARIO - ROL =====================
UsuarioModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol', as: 'Rol' });
RolModelo.hasMany(UsuarioModelo, { foreignKey: 'CodigoRol' });

// ===================== ROL - PERMISOS - RECURSOS =====================
PermisoRolRecursoModelo.belongsTo(PermisoModelo, { foreignKey: 'CodigoPermiso', as: 'Permiso' });
PermisoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoPermiso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RecursoModelo, { foreignKey: 'CodigoRecurso', as: 'Recurso' });
RecursoModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRecurso', as: 'PermisoRolRecursos' });

PermisoRolRecursoModelo.belongsTo(RolModelo, { foreignKey: 'CodigoRol', as: 'Rol' });
RolModelo.hasMany(PermisoRolRecursoModelo, { foreignKey: 'CodigoRol', as: 'PermisoRolRecursos' });

// ===================== PEDIDO - CLIENTE =====================
PedidoModelo.belongsTo(ClienteModelo, { foreignKey: 'CodigoCliente', as: 'CaCliente' });
ClienteModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoCliente', as: 'Pedidos' });

// ===================== PEDIDO - ESTADO =====================
PedidoModelo.belongsTo(EstadoPedidoModelo, { foreignKey: 'CodigoEstadoPedido', as: 'CaEstadoPedido' });
EstadoPedidoModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoEstadoPedido', as: 'Pedidos' });

// ===================== PEDIDO - USUARIO =====================
PedidoModelo.belongsTo(UsuarioModelo, { foreignKey: 'CodigoUsuario', as: 'AdUsuario' });
UsuarioModelo.hasMany(PedidoModelo, { foreignKey: 'CodigoUsuario', as: 'Pedidos' });

// ===================== PAGOS =====================
PagoAplicacionModelo.belongsTo(PagoModelo, { foreignKey: 'CodigoPago', as: 'FnPago' });
PagoModelo.hasMany(PagoAplicacionModelo, { foreignKey: 'CodigoPago', as: 'Aplicaciones' });

PagoAplicacionModelo.belongsTo(PedidoModelo, { foreignKey: 'CodigoDocumento', as: 'Pedido' });
PedidoModelo.hasMany(PagoAplicacionModelo, { foreignKey: 'CodigoDocumento', as: 'PagosAplicados' });

// ===================== MEDIDAS =====================
PedidoDetalleMedidaModelo.belongsTo(TipoMedidaModelo, { foreignKey: 'CodigoTipoMedida', as: 'TipoMedidaDetalle' });
TipoMedidaModelo.hasMany(PedidoDetalleMedidaModelo, { foreignKey: 'CodigoTipoMedida', as: 'MedidasPedidoDetalle' });

// ===================== PRODUCTO - INVENTARIO =====================
ProductoModelo.hasMany(InventarioModelo, { foreignKey: 'CodigoProducto', as: 'Inventarios' });
InventarioModelo.belongsTo(ProductoModelo, { foreignKey: 'CodigoProducto', as: 'Producto' });
// ===================== INVENTARIO - MARCA =====================
InventarioModelo.belongsTo(MarcaModelo, {
  foreignKey: 'CodigoMarca',
  as: 'Marca'
});

MarcaModelo.hasMany(InventarioModelo, {
  foreignKey: 'CodigoMarca',
  as: 'Inventarios'
});


// ===================== INVENTARIO - ESTILO =====================
InventarioModelo.belongsTo(EstiloModelo, {
  foreignKey: 'CodigoEstilo',
  as: 'Estilo'
});

EstiloModelo.hasMany(InventarioModelo, {
  foreignKey: 'CodigoEstilo',
  as: 'Inventarios'
});


// ===================== INVENTARIO - TALLA =====================
InventarioModelo.belongsTo(TallaModelo, {
  foreignKey: 'CodigoTalla',
  as: 'Talla'
});

TallaModelo.hasMany(InventarioModelo, {
  foreignKey: 'CodigoTalla',
  as: 'Inventarios'
});


// ===================== INVENTARIO - COLOR =====================
InventarioModelo.belongsTo(ColorModelo, {
  foreignKey: 'CodigoColor',
  as: 'Color'
});

ColorModelo.hasMany(InventarioModelo, {
  foreignKey: 'CodigoColor',
  as: 'Inventarios'
});

// ===================== PEDIDO DETALLE - TELA =====================

PedidoDetalleModelo.belongsTo(TipoTelaModelo, {
  foreignKey: 'CodigoTipoTela',
  as: 'TipoTela'
});

TipoTelaModelo.hasMany(PedidoDetalleModelo, {
  foreignKey: 'CodigoTipoTela',
  as: 'PedidoDetalles'
});

PedidoDetalleModelo.belongsTo(TelaModelo, {
  foreignKey: 'CodigoTela',
  as: 'Tela'
});

TelaModelo.hasMany(PedidoDetalleModelo, {
  foreignKey: 'CodigoTela',
  as: 'PedidoDetalles'
});

// ===================== INVENTARIO - PEDIDO DETALLE =====================
InventarioModelo.hasMany(PedidoDetalleModelo, { foreignKey: 'CodigoInventario', as: 'PedidoDetalles' });
PedidoDetalleModelo.belongsTo(InventarioModelo, { foreignKey: 'CodigoInventario', as: 'Inventario' });

ProductoModelo.belongsTo(TipoProductoModelo, { foreignKey: 'CodigoTipoProducto', as: 'TipoProducto' });
TipoProductoModelo.hasMany(ProductoModelo, { foreignKey: 'CodigoTipoProducto', as: 'Productos' });

// ******** Exportar todos los modelos ********
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
  ProductoModelo,
  InventarioModelo,
  PedidoDetalleMedidaModelo,
  TipoMedidaModelo,
  PedidoDetalleModelo,
  TipoProductoModelo,
  TipoTelaModelo,
  TelaModelo,
  MarcaModelo,
  EstiloModelo,
  TallaModelo,
  ColorModelo,
};