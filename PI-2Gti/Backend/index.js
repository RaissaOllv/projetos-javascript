import express from 'express';
import cors from 'cors';
import conexao from './db.js'; // importa conexão com promise

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- ROTA LOGIN ---
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
  }

  try {
    const [rows] = await conexao.query(
      'SELECT id, usuario FROM usuario WHERE usuario = ? AND senha = ?',
      [usuario, senha]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretos' });
    }

    res.json({
      mensagem: 'Login realizado com sucesso',
      usuario: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});


// --- Rotas Fornecedores ---
app.get('/fornecedores', async (req, res) => {
  try {
    const [rows] = await conexao.query('SELECT * FROM fornecedor');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/fornecedores', async (req, res) => {
  try {
    const { nome, telefone, endereco, email, cnpj } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
    const [result] = await conexao.query(
      'INSERT INTO fornecedor (nome, telefone, endereco, email, cnpj) VALUES (?, ?, ?, ?, ?)',
      [nome, telefone, endereco, email, cnpj]
    );
    res.status(201).json({ id: result.insertId, nome, telefone, endereco, email, cnpj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.put('/fornecedores/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, telefone, endereco, email, cnpj } = req.body;
    const [result] = await conexao.query(
      'UPDATE fornecedor SET nome = ?, telefone = ?, endereco = ?, email = ?, cnpj = ? WHERE id = ?',
      [nome, telefone, endereco, email, cnpj, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    res.json({ id, nome, telefone, endereco, email, cnpj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/fornecedores/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await conexao.query('DELETE FROM fornecedor WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});



// --- Rotas Categorias ---
app.get('/categorias', async (req, res) => {
  try {
    const [rows] = await conexao.query('SELECT * FROM categoria');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/categorias', async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
    const [result] = await conexao.query('INSERT INTO categoria (nome) VALUES (?)', [nome]);
    res.status(201).json({ id: result.insertId, nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.put('/categorias/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome } = req.body;
    const [result] = await conexao.query('UPDATE categoria SET nome = ? WHERE id = ?', [nome, id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json({ id, nome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/categorias/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await conexao.query('DELETE FROM categoria WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

// --- Rotas Produtos ---
app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await conexao.query(`
      SELECT 
        id,
        nome,
        descricao,
        id_categoria,
        icms,
        ncm,
        id_fornecedor,
        codigo_interno,
        codigo_barras,
        unidade_venda,
        custoLiquido,
        custoBruto,
        precoVenda,
        lucro
      FROM produto
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/produtos', async (req, res) => {
  try {
    const {
      nome, descricao, id_categoria, icms, ncm,
      id_fornecedor, codigo_interno, codigo_barras, unidade_venda,
      custoLiquido, custoBruto, precoVenda, lucro
    } = req.body;

    if (!nome || !id_categoria || !id_fornecedor) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const [result] = await conexao.query(
      `INSERT INTO produto 
      (nome, descricao, id_categoria, icms, ncm, id_fornecedor, codigo_interno, codigo_barras, unidade_venda, custoLiquido, custoBruto, precoVenda, lucro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, id_categoria, icms, ncm, id_fornecedor, codigo_interno, codigo_barras, unidade_venda, custoLiquido, custoBruto, precoVenda, lucro]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      descricao,
      id_categoria,
      icms,
      ncm,
      id_fornecedor,
      codigo_interno,
      codigo_barras,
      unidade_venda,
      custoLiquido,
      custoBruto,
      precoVenda,
      lucro
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.put('/produtos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      nome, descricao, id_categoria, icms, ncm,
      id_fornecedor, codigo_interno, codigo_barras, unidade_venda,
      custoLiquido, custoBruto, precoVenda, lucro
    } = req.body;

    const [result] = await conexao.query(
      `UPDATE produto SET 
        nome = ?, descricao = ?, id_categoria = ?, icms = ?, ncm = ?, id_fornecedor = ?, 
        codigo_interno = ?, codigo_barras = ?, unidade_venda = ?, custoLiquido = ?, 
        custoBruto = ?, precoVenda = ?, lucro = ?
       WHERE id = ?`,
      [nome, descricao, id_categoria, icms, ncm, id_fornecedor, codigo_interno, codigo_barras, unidade_venda, custoLiquido, custoBruto, precoVenda, lucro, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });

    res.json({
      id,
      nome,
      descricao,
      id_categoria,
      icms,
      ncm,
      id_fornecedor,
      codigo_interno,
      codigo_barras,
      unidade_venda,
      custoLiquido,
      custoBruto,
      precoVenda,
      lucro
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/produtos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await conexao.query('DELETE FROM produto WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});


// Inicia servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});