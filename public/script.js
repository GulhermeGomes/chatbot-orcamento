const userId = window.userId;
const questions = [
  "🤖 Olá! Vamos fazer um orçamento para seu site. Qual o tipo de site? (institucional, loja, etc.)",
  "Quantas páginas terá?",
  "Deseja design personalizado? (sim/não)",
  "Precisa de integração com redes sociais ou pagamento? (sim/não)"
];
let step = 0;
let answers = [];

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const inputEl = document.getElementById("user-input");
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage("Você", text);
  answers.push(text);
  inputEl.value = "";
  step++;

  if (step < questions.length) {
    setTimeout(() => addMessage("Bot", questions[step]), 500);
    return;
  }

  // Coleta final e cálculo do orçamento
  const [tipo, paginasRaw, designRaw, integracoesRaw] = answers;
  const paginas = parseInt(paginasRaw, 10) || 0;
  const design = designRaw.trim().toLowerCase().startsWith("s");
  const integracoes = integracoesRaw.trim().toLowerCase().startsWith("s");
  const precoBase = 900 + (paginas * 300) + (design ? 600 : 0) + (integracoes ? 1000 : 0);

  // Envia para backend que trata todas as 10 tabelas invisivelmente
fetch("http://localhost:3000/api/budget", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: userId,
    tipo,
    paginas,
    design: design ? "sim" : "não",
    integracoes: integracoes ? "sim" : "não",
    price: precoBase
  })
})
  .then(res => {
    if (!res.ok) {
      throw new Error(`Erro na resposta do servidor (status ${res.status})`);
    }
    return res.json();
  })
 .then(data => {
  if (!data.id) {
    throw new Error("Resposta JSON não contém ID do orçamento.");
  }

  addMessage("Bot", `✅ Orçamento salvo! ID ${data.id}.`);
  addMessage("Bot", `💰 Total: R$ ${precoBase},00.`);
  addMessage("Bot", `📧 Você receberá um e-mail com o orçamento e métodos de pagamento.`);

  if (data.warning) {
    addMessage("Bot", `⚠️ Aviso: ${data.warning}`);
  }

  document.querySelector(".chat-input-area").style.display = "none";
  document.getElementById("new-budget-btn").style.display = "block";
})

  .catch(err => {
    console.error("Erro ao processar orçamento:", err);
    addMessage("Bot", "❌ Desculpe, houve um erro ao salvar seu orçamento.");
  });
}

function startNewBudget() {
  step = 0;
  answers = [];
  document.getElementById("chat-box").innerHTML = "";
  addMessage("Bot", questions[step]);
  document.querySelector(".chat-input-area").style.display = "flex";
  document.getElementById("new-budget-btn").style.display = "none";
}

// Tema claro/escuro
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('dark-mode', isDark ? 'true' : 'false');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

window.addEventListener('DOMContentLoaded', () => {
  const isDark = localStorage.getItem('dark-mode');
  if (isDark === 'true' || (!isDark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
  startNewBudget();
});
