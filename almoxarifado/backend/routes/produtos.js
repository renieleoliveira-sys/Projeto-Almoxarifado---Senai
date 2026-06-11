const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM produtos');
    res.json(result);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ msg: 'Erro ao listar produtos' });
  }
});

router.post('/', auth, async (req, res) => {
  const { nome, quantidade } = req.body;
  const qtd = parseInt(quantidade, 10);

  if (!nome || Number.isNaN(qtd)) {
    return res.status(400).json({ msg: 'Nome e quantidade são obrigatórios' });
  }

  try {
    const [result] = await db.query('INSERT INTO produtos(nome,quantidade) VALUES (?,?)', [nome, qtd]);

    await db.query(
      'INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade) VALUES (?, ?, ?, ?)',
      [result.insertId, req.user.id, 'ENTRADA', qtd]
    );

    res.json({ msg: 'Produto cadastrado' });
  } catch (err) {
    console.error('Erro ao cadastrar produto:', err);
    res.status(500).json({ msg: 'Erro ao cadastrar produto' });
  }
});

router.post('/movimentar', auth, async (req, res) => {
  const { produto_id, tipo, quantidade } = req.body;
  const prodId = parseInt(produto_id, 10);
  const qtd = parseInt(quantidade, 10);

  console.log('Movimentação recebida:', { prodId, tipo, qtd });

  try {
    const [result] = await db.query('SELECT * FROM produtos WHERE id=?', [prodId]);

    if (!result || result.length === 0) {
      return res.status(400).json({ msg: 'Produto não encontrado' });
    }

    const produto = result[0];
    if (tipo === 'SAIDA') {
      if (produto.quantidade < qtd) {
        return res.status(400).json({ msg: 'Estoque insuficiente' });
      }
      const novo = produto.quantidade - qtd;
      await db.query('UPDATE produtos SET quantidade=? WHERE id=?', [novo, prodId]);
    } else if (tipo === 'ENTRADA') {
      const novo = produto.quantidade + qtd;
      await db.query('UPDATE produtos SET quantidade=? WHERE id=?', [novo, prodId]);
    } else {
      return res.status(400).json({ msg: 'Tipo de movimentação inválido' });
    }

    await db.query('INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade) VALUES (?,?,?,?)', [prodId, req.user.id, tipo, qtd]);

    return res.json({ msg: 'Movimentação realizada' });
  } catch (err) {
    console.error('Erro ao movimentar produto:', err);
    return res.status(500).json({ msg: 'Erro ao registrar movimentação' });
  }
});

router.get('/movimentacoes', auth, async (req, res) => {
  try {
    const produto = String(req.query.produto || '').trim();
    const data = String(req.query.data || '').trim();
    const tipo = String(req.query.tipo || '').trim().toUpperCase();

    const filtros = [];
    const valores = [];

    if (produto) {
      filtros.push('LOWER(p.nome) LIKE ?');
      valores.push(`%${produto.toLowerCase()}%`);
    }

    if (data) {
      filtros.push('DATE(m.data_movimentacao) = ?');
      valores.push(data);
    }

    if (tipo) {
      filtros.push('m.tipo = ?');
      valores.push(tipo);
    }

    const whereClause = filtros.length > 0 ? ` WHERE ${filtros.join(' AND ')}` : '';

    const sql = `
      SELECT
        m.id,
        p.nome as produto,
        u.nome as usuario,
        m.tipo,
        m.quantidade,
        m.data_movimentacao
      FROM movimentacoes m
      INNER JOIN produtos p ON p.id = m.produto_id
      INNER JOIN usuarios u ON u.id = m.usuario_id
      ${whereClause}
      ORDER BY m.data_movimentacao DESC
    `;

    const [result] = await db.query(sql, valores);
    res.json(result);
  } catch (err) {
    console.error('Erro ao listar movimentações:', err);
    res.status(500).json({ msg: 'Erro ao listar movimentações' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await db.query('DELETE FROM movimentacoes WHERE produto_id=?', [id]);
    await db.query('DELETE FROM produtos WHERE id=?', [id]);
    res.json({ msg: 'Produto excluído' });
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).json({ msg: 'Erro ao excluir produto' });
  }
});

module.exports = router;
