const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

let tarefas = []; // banco de dados em memória

app.get('/', (req, res) => {
  res.send('API Crud Tarefas está rodando!');
});

app.get('/tarefas', (req, res) => {
  res.json(tarefas);
});

app.post('/tarefas', (req, res) => {
  const nova = { id: Date.now(), ...req.body };
  tarefas.push(nova);
  res.status(201).json(nova);
});

app.put('/tarefas/:id', (req, res) => {
  tarefas = tarefas.map(t => t.id == req.params.id ? { ...t, ...req.body } : t);
  res.json({ message: 'Atualizado' });
});

app.delete('/tarefas/:id', (req, res) => {
  tarefas = tarefas.filter(t => t.id != req.params.id);
  res.json({ message: 'Deletado' });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
