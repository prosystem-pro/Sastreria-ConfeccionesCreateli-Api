const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Pedido', {
    CodigoPedido: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CodigoEmpresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Empresa',
        key: 'CodigoEmpresa'
      }
    },
    CodigoCliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cliente',
        key: 'CodigoCliente'
      }
    },
    CodigoEstadoPedido: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'EstadoPedido',
        key: 'CodigoEstadoPedido'
      }
    },
    CodigoUsuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Usuario',
        key: 'CodigoUsuario'
      }
    },
    FechaCreacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    FechaEntrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Subtotoal: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    Descuento: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    Total: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    Observaciones: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    Estatus: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'Pedido',
    schema: 'Op',
    timestamps: false,
    indexes: [
      {
        name: "Pk_PoPedido_CodigoPedido",
        unique: true,
        fields: [
          { name: "CodigoPedido" },
        ]
      },
    ]
  });
};
