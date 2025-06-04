const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mateuslourencodev@gmail.com',     // Seu email
    pass: 'kcyuywedvwcrmauc'                 // Senha de app
  }
});

function enviarEmail(to, subject, text) {
  const mailOptions = {
    from: 'mateuslourencodev@gmail.com',
    to,
    subject,
    text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Erro ao enviar email:', err);
        reject(err);
      } else {
        console.log('Email enviado:', info.response);
        resolve(info);
      }
    });
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
        if (err) {
          console.error(err);
          return res.status(400).json({ error: "Usuário já existe ou erro no banco de dados." });
        }
        res.json({ id: result.insertId });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao registrar." });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT id, password FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(401).json({ error: "Credenciais inválidas." });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(401).json({ error: "Credenciais inválidas." });

      res.json({ id: user.id });
    }
  );
});

app.post('/api/budget', (req, res) => {
  const { user_id, tipo, paginas, design, integracoes, price } = req.body;

  db.query('SELECT email FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userEmail = results[0].email;

    db.query(
      `INSERT INTO budgets (user_id, tipo, paginas, design, integracoes, price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, tipo, paginas, design, integracoes, price],
      async (err, result) => {
        if (err) {
          console.error('Erro ao salvar orçamento:', err);
          return res.status(500).json({ error: "Erro ao salvar orçamento." });
        }

        try {
          await enviarEmail(
            userEmail,
            'Seu orçamento foi criado!',
            `Olá! Seu orçamento para o tipo: ${tipo} foi criado.\nTotal: R$${price},00.\nObrigado por usar nosso serviço!`
          );

          res.json({ id: result.insertId, message: 'Orçamento salvo e e-mail enviado!' });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail:', emailErr);
          res.status(500).json({ error: 'Orçamento salvo, mas erro ao enviar o e-mail.' });
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
    const testEmail = 'seuemaildestino@exemplo.com';  // Altere aqui

    await enviarEmail(
      testEmail,
      'Teste de envio de e-mail',
      'Este é um e-mail de teste enviado pelo servidor Node.js usando Nodemailer.'
    );

    res.send('E-mail de teste enviado com sucesso para ' + testEmail);
  } catch (error) {
    console.error('Erro ao enviar e-mail de teste:', error);
    res.status(500).send('Erro ao enviar e-mail de teste.');
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
