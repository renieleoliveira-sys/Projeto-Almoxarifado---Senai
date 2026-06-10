const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

router.post('/login',(req,res)=>{

 const {email,senha} = req.body;

 db.query(
  'SELECT * FROM usuarios WHERE email=?',
  [email],
  async(err,result)=>{

   if(result.length===0){
    return res.status(400).json({
      msg:'Usuário não encontrado'
    });
   }

   const user = result[0];

   const ok = await bcrypt.compare(
      senha,
      user.senha
   );

   if(!ok){
    return res.status(400).json({
      msg:'Senha incorreta'
    });
   }

   const token = jwt.sign({
      id:user.id,
      perfil:user.perfil
   },'segredo');

   res.json({
      token,
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: user.perfil
   });

 });

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