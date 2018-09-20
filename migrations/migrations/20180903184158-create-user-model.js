'use strict';

module.exports = {
  up: (queryInterface, DataType) =>
   queryInterface.createTable("User", {
      id: {
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataType.STRING,
        allowNull: false
      },
      last_name: {
        type: DataType.STRING,
        allowNull: false
      },
      email: {
        type: DataType.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataType.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: DataType.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataType.DATE
      }
    }),
  down: (queryInterface, DataType) => queryInterface.dropTable("User")
};
