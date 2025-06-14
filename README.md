# Chatbot de Geração de Orçamentos

Este projeto é um chatbot desenvolvido para automatizar a geração de orçamentos comerciais, com foco em precisão, desempenho e melhoria no tempo de resposta ao cliente.

## Próximas Melhorias Recomendadas

- Integração de análise preditiva para estimar custos futuros com base em dados históricos.
- Exportação de orçamentos em PDF personalizado, com logotipo da empresa.

## Tecnologias Utilizadas

- Linguagens: HTML, CSS, Node.js
- Banco de Dados: MySQL
- Formato de Troca de Dados: JSON

## Como Executar o Projeto

``bash
# Clonar o repositório
git clone https://github.com/seuusuario/chatbot-orcamentos.git

# Acessar o diretório
cd chatbot-orcamentos

# Instalar as dependências
npm install

# Rodar o servidor
npm start


## Configuração do Banco de Dados

Antes de rodar o projeto, siga os passos abaixo para configurar o banco de dados no MySQL.

### Criar o Banco de Dados e as Tabelas

Abra seu cliente MySQL (Workbench, DBeaver, etc) e execute:


CREATE DATABASE projetos_requeridos;

USE projetos_requeridos;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  tipo VARCHAR(100),
  paginas INT,
  design VARCHAR(10),
  integracoes VARCHAR(10),
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Enviado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

CREATE TABLE budget_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE budget_status_rel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT,
  status_id INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id),
  FOREIGN KEY (status_id) REFERENCES budget_status(id)
);

CREATE TABLE integration_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE design_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE extra_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT,
  service_name VARCHAR(255),
  cost DECIMAL(10,2),
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT,
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'Simulado',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id)
);

INSERT INTO budget_status (name) VALUES ('Pendente'), ('Em Análise'), ('Aprovado'), ('Rejeitado'), ('Concluído');

SELECT * FROM budgets;

SELECT * FROM admins;


## Status do Projeto

Projeto em funcionamento (versão de testes concluída)  
Próxima fase: Implementação das melhorias recomendadas.


