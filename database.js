const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '@21102004PeHGS',     
  database: 'projetos_requeridos'
});

module.exports = db;

