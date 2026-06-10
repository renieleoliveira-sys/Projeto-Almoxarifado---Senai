const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const produtoRoutes = require('./routes/produtos');
const usuarioRoutes = require('./routes/usuarios');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/usuarios', usuarioRoutes);

app.listen(3000, ()=>{
 console.log('Servidor rodando');
});