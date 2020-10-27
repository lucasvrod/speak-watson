const Sequelize = require('sequelize');

const connection = new Sequelize('comentarios','root','root',{
    host:'localhost',
    dialect:'mysql'
});

module.exports = connection;