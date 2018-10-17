'use strict';

module.exports = function(sequelize, DataType) {
  const Token = sequelize.define(
    'Token',
    {
      id: {
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      disable_at: {
        type: DataType.DATE
      },
      time_exp: {
        type: DataType.INTEGER,
        allowNull: false
      },
      type_exp: {
        type: DataType.STRING,
        allowNull: false
      }
    },
    {
      freezeTableName: true
    }
  );

  return Token;
};
