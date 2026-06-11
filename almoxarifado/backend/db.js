const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '123456',
  database: 'almoxarifado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then((connection) => {
    console.log('MySQL conectado');
    connection.release();
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MySQL:', err);
  });

module.exports = pool;