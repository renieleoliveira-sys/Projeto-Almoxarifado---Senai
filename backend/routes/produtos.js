const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req,res)=>{

 db.query(
   'SELECT * FROM produtos',
   (err,result)=>{
      res.json(result);
   }
 );

});

router.post('/', auth, (req,res)=>{

 const {nome,quantidade} = req.body;

 db.query(
  'INSERT INTO produtos(nome,quantidade) VALUES (?,?)',
  [nome, parseInt(quantidade)],
  (err,result)=>{
    if(err){
      return res.status(500).json({
        msg:'Erro ao cadastrar produto'
      });
    }
    res.json({
      msg:'Produto cadastrado'
    });
  }
 );

});

router.post('/movimentar', auth, (req,res)=>{

 const {
   produto_id,
   tipo,
   quantidade
 } = req.body;

 // Converte para números
 const prodId = parseInt(produto_id);
 const qtd = parseInt(quantidade);

 console.log('Movimentação recebida:', {prodId, tipo, qtd});

 db.query(
  'SELECT * FROM produtos WHERE id=?',
  [prodId],
  (err,result)=>{

   if(err || !result || result.length === 0){
     return res.status(400).json({
       msg:'Produto não encontrado'
     });
   }

   const produto = result[0];

   console.log('Produto atual:', produto);

   if(tipo==='SAIDA'){

      if(produto.quantidade < qtd){

         return res.status(400).json({
            msg:'Estoque insuficiente'
         });

      }

      const novo =
       produto.quantidade - qtd;

      db.query(
       'UPDATE produtos SET quantidade=? WHERE id=?',
       [novo,prodId],
       (err)=>{
         if(err){
           return res.status(500).json({msg:'Erro ao atualizar estoque'});
         }
         inserirMovimentacao();
       }
      );

   } else if(tipo==='ENTRADA'){

      const novo =
       produto.quantidade + qtd;

      db.query(
       'UPDATE produtos SET quantidade=? WHERE id=?',
       [novo,prodId],
       (err)=>{
         if(err){
           return res.status(500).json({msg:'Erro ao atualizar estoque'});
         }
         inserirMovimentacao();
       }
      );

   } else {
     return res.status(400).json({msg:'Tipo de movimentação inválido'});
   }

   function inserirMovimentacao(){
     db.query(
      `INSERT INTO movimentacoes
      (produto_id,usuario_id,tipo,quantidade)
      VALUES (?,?,?,?)`,
      [
        prodId,
        req.user.id,
        tipo,
        qtd
      ],
      (err)=>{
        if(err){
          return res.status(500).json({msg:'Erro ao registrar movimentação'});
        }
        res.json({
          msg:'Movimentação realizada'
        });
      }
     );
   }

 });

});

router.get('/movimentacoes', auth, (req,res)=>{

 db.query(
 `
 SELECT

 m.id,
 p.nome as produto,
 u.nome as usuario,
 m.tipo,
 m.quantidade,
 m.data_movimentacao

 FROM movimentacoes m

 INNER JOIN produtos p
 ON p.id = m.produto_id

 INNER JOIN usuarios u
 ON u.id = m.usuario_id

 ORDER BY m.data_movimentacao DESC
 `,
 (err,result)=>{

   if(err){
     return res.status(500).json(err);
   }

   res.json(result);

 });

});

router.delete('/:id', auth, (req,res)=>{

 const id = parseInt(req.params.id);

 console.log('Deletando produto ID:', id);

 // Primeiro deleta as movimentações relacionadas
 db.query(
   'DELETE FROM movimentacoes WHERE produto_id=?',
   [id],
   (err)=>{
     if(err){
       console.error('Erro ao deletar movimentações:', err);
       return res.status(500).json({msg:'Erro ao deletar movimentações'});
     }

     // Depois deleta o produto
     db.query(
       'DELETE FROM produtos WHERE id=?',
       [id],
       (err)=>{
         if(err){
           console.error('Erro ao deletar produto:', err);
           return res.status(500).json({msg:'Erro ao deletar produto: ' + err.message});
         }

         console.log('Produto deletado com sucesso');
         res.json({
           msg:'Produto excluído'
         });
       }
     );
   }
 );

});

module.exports = router;