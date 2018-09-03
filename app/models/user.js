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
	  name: DataType.STRING,
	  last_name: DataType.STRING,
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