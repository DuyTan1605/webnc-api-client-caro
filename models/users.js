'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  users.init({
    id: {
      type:DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    account_type: {
      type:DataTypes.INTEGER,
      references: {
        model: "accounttype",
        key: "id"
      }
    },
    point: DataTypes.INTEGER,
    refresh_token: DataTypes.STRING,
    created_at: DataTypes.STRING,
    expired_token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};