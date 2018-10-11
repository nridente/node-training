'use strict';

module.exports = {
  up: (queryInterface, DataType) =>
    queryInterface.createTable('Album_User', {
      id: {
        primaryKey: true,
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      user_id: {
        type: DataType.INTEGER,
        allowNull: false
      },
      album_id: {
        type: DataType.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: DataType.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataType.DATE
      }
    }),
  down: (queryInterface, DataType) => queryInterface.dropTable('Album_User')
};
