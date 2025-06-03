const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database'); // seu módulo DB deve estar funcionando
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mateuslourencodev@gmail.com',   // seu email aqui
    pass: 'kcyuywedvwcrmauc'                // senha de app gerada no Google, sem espaços
  }
});

// Função que envia o e-mail retornando uma Promise
function enviarEmail(to, subject, text) {
  const mailOptions = {
    from: 'mateuslourencodev@gmail.com',  // deve ser igual ao user do transporter
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

// Endpoint para registrar usuário
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

// Endpoint para login
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

// Endpoint para criar orçamento e enviar e-mail
app.post('/api/budget', (req, res) => {
  const { user_id, tipo, paginas, design, integracoes, price } = req.body;
  console.log("Payload recebido:", req.body);

  db.query('SELECT email FROM users WHERE id = ?', [user_id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar email:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userEmail = results[0].email;
    console.log('Email encontrado:', userEmail);

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
          console.log(`📤 Enviando e-mail para: ${userEmail}...`);

          await enviarEmail(
            userEmail,
            'Seu orçamento foi criado!',
            `Olá! Seu orçamento para o tipo: ${tipo} foi criado.\nTotal: R$${price},00.\nObrigado por usar nosso serviço!`
          );

          console.log(`✅ E-mail enviado com sucesso para: ${userEmail}`);

          res.json({ id: result.insertId, message: 'Orçamento salvo e e-mail enviado!' });
        } catch (emailErr) {
          console.error('❌ Erro ao enviar e-mail:', emailErr);
          res.status(500).json({ error: 'Orçamento salvo, mas houve erro ao enviar o e-mail.' });
        }
      }
    );
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginchat.html'));
});
app.get('/test-email', async (req, res) => {
  try {
    const testEmail = 'seuemaildestino@exemplo.com';  // coloque o e-mail para teste aqui

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
