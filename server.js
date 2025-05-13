// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Registro de usuário
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Usuário já existe." });
      res.json({ id: result.insertId });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'SELECT id FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });
      res.json({ id: results[0].id });
    }
  );
});

// Salvar orçamento
app.post('/api/budget', (req, res) => {
  const { user_id, tipo, paginas, design, integracoes, price } = req.body;
  console.log("Payload recebido:", req.body);
  db.query(
    `INSERT INTO budgets (user_id, tipo, paginas, design, integracoes, price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, tipo, paginas, design, integracoes, price],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao salvar orçamento." });
      }
      res.json({ id: result.insertId });
    }
  );
});



app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginchat.html'));
});
