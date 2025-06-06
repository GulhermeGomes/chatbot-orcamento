const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '983272631@Bc',     
  database: 'projetos_requeridos'
});

module.exports = db;

