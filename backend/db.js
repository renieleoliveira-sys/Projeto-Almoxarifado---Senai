const mysql = require('mysql2');

const connection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 port: 3307,
 password: '',
 database: 'almoxerifado'
});

connection.connect((err)=>{
 if(err){
   console.log(err);
 }else{
   console.log('MySQL conectado');
 }
});

module.exports = connection;