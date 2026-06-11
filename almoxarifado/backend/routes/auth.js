const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

const router = express.Router();

router.post('/login', async (req, res) => {

 const {email, senha} = req.body;
 const emailNormalizado = String(email || '').trim().toLowerCase();

 if(!emailNormalizado || !senha){
   return res.status(400).json({ msg: 'Email e senha são obrigatórios' });
 }

 try {
   const [result] = await db.query(
     'SELECT * FROM usuarios WHERE LOWER(email)=LOWER(?)',
     [emailNormalizado]
   );

   if(result.length === 0){
     return res.status(400).json({
       msg:'Usuário não encontrado'
     });
   }

   const user = result[0];
   const ok = await bcrypt.compare(senha, user.senha);

   if(!ok){
     return res.status(400).json({
       msg:'Senha incorreta'
     });
   }

   const token = jwt.sign({
     id:user.id,
     perfil:user.perfil
   }, JWT_SECRET, { expiresIn: '8h' });

   return res.json({
     token,
     id: user.id,
     nome: user.nome,
     email: user.email,
     perfil: user.perfil
   });

 } catch (err) {
   console.error('Erro ao fazer login:', err);
   return res.status(500).json({ msg: 'Erro ao fazer login' });
 }

});

module.exports = router;
router.get('/criar-admin', async (req,res)=>{

 const bcrypt = require('bcrypt');

 const senhaHash =
 await bcrypt.hash('123456',10);

 db.query(
  `INSERT INTO usuarios
  (nome,email,senha,perfil)
  VALUES (?,?,?,?)`,
  [
    'Administrador',
    'admin@admin.com',
    senhaHash,
    'ADMIN'
  ],
  (err)=>{

    if(err){
      return res.json(err);
    }

    res.json({
      msg:'Admin criado'
    });

  }
 );

});