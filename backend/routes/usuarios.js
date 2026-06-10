const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar usuários (requer autenticação)
router.get('/', auth, (req, res) => {

    db.query(
        'SELECT id,nome,email,perfil FROM usuarios',
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

// Cadastrar usuário (público - sem autenticação)
router.post('/publico/registrar', async (req, res) => {

    const { nome, email, senha, perfil } = req.body;

    console.log('Cadastro solicitado:', {nome, email, perfil});

    if(!nome || !email || !senha){
      console.log('Dados incompletos');
      return res.status(400).json({
        msg: 'Nome, email e senha são obrigatórios'
      });
    }

    try {
      const senhaHash = await bcrypt.hash(senha, 10);

      db.query(
          'INSERT INTO usuarios(nome,email,senha,perfil) VALUES (?,?,?,?)',
          [nome, email, senhaHash, perfil || 'OPERADOR'],
          (err) => {

              if (err) {
                console.error('Erro ao cadastrar:', err);
                return res.status(500).json({
                  msg: 'Email já cadastrado ou erro no cadastro'
                });
              }

              console.log('Cadastro realizado com sucesso');
              res.json({
                  msg: 'Usuário cadastrado com sucesso'
              });

          }
      );
    } catch(err){
      console.error('Erro ao criptografar:', err);
      res.status(500).json({msg: 'Erro ao criptografar senha'});
    }

});

// Cadastrar usuário (admin - requer autenticação)
router.post('/', auth, async (req, res) => {

    const { nome, email, senha, perfil } = req.body;

    try {
      const senhaHash = await bcrypt.hash(senha, 10);

      db.query(
          'INSERT INTO usuarios(nome,email,senha,perfil) VALUES (?,?,?,?)',
          [nome, email, senhaHash, perfil],
          (err) => {

              if (err) {
                console.error('Erro ao cadastrar:', err);
                return res.status(500).json({
                  msg: 'Email já cadastrado ou erro no cadastro'
                });
              }

              res.json({
                  msg: 'Usuário cadastrado com sucesso'
              });

          }
      );
    } catch(err){
      console.error('Erro:', err);
      res.status(500).json({msg: 'Erro ao criptografar senha'});
    }

});

module.exports = router;