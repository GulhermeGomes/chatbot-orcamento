const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

function enviarEmail(to, subject, text) {
  return new Promise((resolve) => {
    console.log(`Simulando envio de e-mail para ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Texto: ${text}`);
    resolve({ response: 'Simulação de e-mail concluída.' });
  });
}

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      (err, result) => {
        if (err) return res.status(400).json({ error: "Erro ao registrar." });

        const userId = result.insertId;

        // Log automático
        db.query('INSERT INTO user_logs (user_id, action) VALUES (?, ?)', [userId, 'register']);

        res.json({ id: userId });
      }
    );
  } catch {
    res.status(500).json({ error: "Erro interno." });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT id, password FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: "Credenciais inválidas." });

    // Log automático
    db.query('INSERT INTO user_logs (user_id, action) VALUES (?, ?)', [user.id, 'login']);

    res.json({ id: user.id });
  });
});

app.post('/api/budget', (req, res) => {
  const { user_id, tipo, paginas, design, integracoes, price } = req.body;

  db.query('SELECT email FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const userEmail = results[0].email;

    db.query(
      `INSERT INTO budgets (user_id, tipo, paginas, design, integracoes, price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, tipo, paginas, design, integracoes, price],
      async (err, result) => {
        if (err) return res.status(500).json({ error: "Erro ao salvar orçamento." });

        const budgetId = result.insertId;

        // Relacionar status padrão "Pendente" (id = 1)
        db.query('INSERT INTO budget_status_rel (budget_id, status_id) VALUES (?, ?)', [budgetId, 1]);

        // Inserir proposta vazia
        db.query('INSERT INTO proposals (budget_id, content) VALUES (?, ?)', [budgetId, '']);

      try {
  await enviarEmail(
    userEmail,
    'Seu orçamento foi criado!',
    `Olá! Seu orçamento para o tipo: ${tipo} foi criado.\nTotal: R$${price},00.\nObrigado por usar nosso serviço!`
  );

          res.json({ id: result.insertId, message: 'Orçamento salvo e e-mail simulado com sucesso!' });
        } catch (emailErr) {
          console.error('Erro ao simular e-mail:', emailErr);
          res.status(500).json({ error: 'Orçamento salvo, mas erro na simulação de e-mail.' });
        }
      }
    );
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sobre.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sobre.html'));
});

app.get('/test-email', async (req, res) => {
  try {
    const testEmail = 'seuemaildestino@exemplo.com';  // Simulação

    await enviarEmail(
      testEmail,
      'Teste de envio de e-mail',
      'Este é um e-mail de teste simulado pelo servidor.'
    );

    res.send('Simulação de envio de e-mail para ' + testEmail);
  } catch (error) {
    console.error('Erro na simulação de e-mail:', error);
    res.status(500).send('Erro ao simular envio de e-mail.');
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

// Registrar admin
app.post('/api/admin/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      (err, result) => {
        if (err) return res.status(400).json({ error: "Erro ao registrar admin." });
        res.json({ id: result.insertId });
      }
    );
  } catch {
    res.status(500).json({ error: "Erro interno." });
  }
});

//Login para admin
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT id, password FROM admins WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Credenciais inválidas." });

    res.json({ id: admin.id });
  });
});
