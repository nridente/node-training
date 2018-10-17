'use strict';

module.exports = {
  up: (queryInterface, DataType) => {
    return queryInterface
      .createTable('Token', {
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
        },
        createdAt: {
          allowNull: false,
          type: DataType.DATE
        },
        updatedAt: {
          allowNull: false,
          type: DataType.DATE
        }
      })
      .then(() => {
        return queryInterface.bulkInsert('Token', [
          {
            disable_at: null,
            time_exp: 2,
            type_exp: 'hours',
            updatedAt: new Date(),
            createdAt: new Date()
          }
        ]);
      });
  },
  down: (queryInterface, DataType) => queryInterface.dropTable('Token')
};
