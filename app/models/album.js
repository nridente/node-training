'use strict';

module.exports = function(sequelize, DataType) {
  const AlbumPerUser = sequelize.define(
    'Album_User',
    {
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
      }
    },
    {
      freezeTableName: true
    }
  );

  return AlbumPerUser;
};
