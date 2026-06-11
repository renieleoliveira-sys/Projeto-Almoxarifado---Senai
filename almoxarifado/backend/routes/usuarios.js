const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Listar usuários (requer autenticação)
router.get('/', auth, async (req, res) => {

    try {
        const [result] = await db.query('SELECT id,nome,email,perfil FROM usuarios');
        res.json(result);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ msg: 'Erro ao listar usuários' });
    }

});

// Cadastrar usuário (público - sem autenticação)
router.post('/publico/registrar', async (req, res) => {

    const { nome, email, senha, perfil } = req.body;
    const emailNormalizado = String(email || '').trim().toLowerCase();

    console.log('Cadastro solicitado:', {nome, email: emailNormalizado, perfil});

    if(!nome || !emailNormalizado || !senha){
      console.log('Dados incompletos');
      return res.status(400).json({
        msg: 'Nome, email e senha são obrigatórios'
      });
    }

    try {
      const senhaHash = await bcrypt.hash(senha, 10);

      const [result] = await db.query(
        'SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)',
        [emailNormalizado]
      );

      if (result.length > 0) {
        return res.status(409).json({ msg: 'Este email já está cadastrado.' });
      }

      await db.query(
        'INSERT INTO usuarios(nome,email,senha,perfil) VALUES (?,?,?,?)',
        [nome.trim(), emailNormalizado, senhaHash, perfil || 'OPERADOR']
      );

      console.log('Cadastro realizado com sucesso');
      res.json({ msg: 'Usuário cadastrado com sucesso' });
    } catch(err){
      console.error('Erro ao cadastrar usuário:', err);
      res.status(500).json({ msg: 'Erro no cadastro. Verifique os dados informados.' });
    }

});

// Cadastrar usuário (admin - requer autenticação)
router.post('/', auth, async (req, res) => {

    const { nome, email, senha, perfil } = req.body;
    const emailNormalizado = String(email || '').trim().toLowerCase();

    if(!nome || !emailNormalizado || !senha){
      return res.status(400).json({ msg: 'Nome, email e senha são obrigatórios' });
    }

    try {
      const senhaHash = await bcrypt.hash(senha, 10);

      const [result] = await db.query(
        'SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)',
        [emailNormalizado]
      );

      if (result.length > 0) {
        return res.status(409).json({ msg: 'Este email já está cadastrado.' });
      }

      await db.query(
        'INSERT INTO usuarios(nome,email,senha,perfil) VALUES (?,?,?,?)',
        [nome.trim(), emailNormalizado, senhaHash, perfil]
      );

      res.json({ msg: 'Usuário cadastrado com sucesso' });
    } catch(err){
      console.error('Erro ao cadastrar usuário:', err);
      res.status(500).json({ msg: 'Erro no cadastro. Verifique os dados informados.' });
    }

});

module.exports = router;