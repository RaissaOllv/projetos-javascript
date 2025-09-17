import mysql from 'mysql2';

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456', // sua senha do MySQL
  database: 'sistema_mercado',
});

conexao.connect((erro) => {
  if (erro) {
    console.error('❌ Erro ao conectar no banco:', erro.message);
    process.exit(1);
  } else {
    console.log('✅ Conectado ao MySQL');
  }
});

export default conexao.promise();
