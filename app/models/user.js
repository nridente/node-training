'use strict';

module.exports = function(sequelize, DataType) {
	const User = sequelize.define("User", {
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
	  }
	});

	return User;
}