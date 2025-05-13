let userId = null;
const questions = [
  "Olá! Vamos fazer um orçamento para seu site. Qual o tipo de site? (institucional, loja, etc.)",
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

  // Pegamos respostas finais
  const [tipo, paginasRaw, designRaw, integracoesRaw] = answers;

  // 1) Forçar páginas como inteiro
  const paginas = parseInt(paginasRaw, 10) || 0;

  // 2) Tratar “sim/não” independentemente de maiúsculas
  const design       = designRaw.trim().toLowerCase().startsWith("s");
  const integracoes  = integracoesRaw.trim().toLowerCase().startsWith("s");

  // 3) Calcular preço
  const precoBase = 900
    + (paginas * 300)
    + (design      ? 600 : 0)
    + (integracoes ? 1000 : 0);

  // 4) Enviar para o backend
  fetch("http://localhost:3000/api/budget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id:    userId,
      tipo,
      paginas,
      design:       design ? "sim" : "não",
      integracoes:  integracoes ? "sim" : "não",
      price:     precoBase
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Erro na resposta do servidor");
    return response.json();
  })
  .then(data => {
    console.log("Resposta do servidor:", data);
    addMessage("Bot", `Orçamento salvo! ID ${data.id}. Total: R$ ${precoBase},00.`);
    addMessage("Bot", "Você receberá um e-mail em instantes com o detalhamento do orçamento e os métodos de pagamento disponíveis. 📧");
    // 5) Resetar conversa para novo orçamento
    step = 0;
    answers = [];
    setTimeout(() => addMessage("Bot", questions[step]), 1000);
  })
  .catch(err => {
    console.error(err);
    addMessage("Bot", "Desculpe, houve um erro ao salvar seu orçamento.");
  });
}


function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => {
    if (!res.ok) throw new Error("Login inválido");
    return res.json();
  })
  .then(data => {
    userId = data.id;
    showChat();
  })
  .catch(err => {
    document.getElementById("login-message").innerText = "Erro: " + err.message;
  });
}
function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => {
    if (!res.ok) throw new Error("Erro ao registrar");
    return res.json();
  })
  .then(data => {
    userId = data.id;
    showChat();
  })
  .catch(err => {
    document.getElementById("login-message").innerText = "Erro: " + err.message;
  });
}
function showChat() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";
  step = 0;
  answers = [];
  addMessage("Bot", questions[0]);
}
