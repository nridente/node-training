'use strict';

module.exports = {
  up: (queryInterface, DataType) => {
    queryInterface.addColumn('User', 'last_invalidated_sessions_at', {
      type: DataType.DATE,
      allowNull: true,
      defaultValue: DataType.NOW
    });
  },
  down: (queryInterface, DataType) => {
    queryInterface.removeColumn('User', 'last_invalidated_sessions_at');
  }
};
