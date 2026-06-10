const db = require('./db');

// Script para limpar a coluna quantidade e colocá-la como INT
db.query("UPDATE produtos SET quantidade = 0", (err) => {
  if (err) {
    console.error('Erro ao atualizar:', err);
    process.exit(1);
  }
  console.log('Produtos resetados para quantidade 0');
  process.exit(0);
});
