'use strict';

module.exports = {
  up: (queryInterface, DataType) => {
    queryInterface.addColumn('User', 'admin', {
      type: DataType.BOOLEAN,
      defaultValue: false
    });
  },
  down: (queryInterface, DataType) => {
    queryInterface.removeColumn('User', 'admin');
  }
};
