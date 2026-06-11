const db = require('./db');

db.query("ALTER TABLE produtos MODIFY COLUMN quantidade INT DEFAULT 0", (err) => {
  if (err) {
    console.error('Erro ao alterar tabela:', err);
    process.exit(1);
  }
  console.log('Tabela alterada com sucesso!');
  process.exit(0);
});
