/* =========================================
   widget.js
   AI Chat Logic & Admin Dashboard Flip
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("eng-chat-toggle");
  const chatWindow = document.getElementById("eng-chat-window");
  const closeBtn = document.getElementById("eng-chat-close");
  const sendBtn = document.getElementById("eng-chat-send");
  const inputField = document.getElementById("eng-chat-input");
  const messagesContainer = document.getElementById("eng-chat-messages");
  
  const chatView = document.getElementById("eng-chat-view");
  const adminView = document.getElementById("eng-admin-view");
  const headerTitle = document.getElementById("eng-header-title");
  const adminCloseBtn = document.getElementById("eng-admin-close");

  // Toggle Window
  toggleBtn.addEventListener("click", () => {
    chatWindow.classList.remove("chat-hidden");
    toggleBtn.style.display = "none";
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.classList.add("chat-hidden");
    toggleBtn.style.display = "block";
  });

  // Close Admin View
  adminCloseBtn.addEventListener("click", () => {
    adminView.classList.add("hidden");
    chatView.classList.remove("hidden");
    adminCloseBtn.classList.add("hidden");
    headerTitle.textContent = "Steel & Eng Assistant";
  });

  // Render Chart
  let myChart = null;
  function renderAdminDashboard() {
    if (myChart != null) return; 
    
    const ctx = document.getElementById('materialsChart').getContext('2d');
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['TMT Bars', 'Mild Steel', 'Pipes', 'Cement'],
        datasets: [{
          label: 'Mentions in Chat',
          data: [18, 12, 9, 8],
          backgroundColor: ['#0056b3', '#28a745', '#ffc107', '#17a2b8']
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Handle Messages
  function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function handleSend() {
    const text = inputField.value.trim();
    if (text === "") return;

    // THE SECRET ADMIN TRIGGER
    if (text === "/admin123") {
      inputField.value = "";
      chatView.classList.add("hidden");
      adminView.classList.remove("hidden");
      adminCloseBtn.classList.remove("hidden");
      headerTitle.textContent = "Manager Dashboard";
      renderAdminDashboard();
      return; 
    }

    addMessage(text, "user");
    inputField.value = "";

    const thinkingId = Date.now();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", "bot-message");
    msgDiv.id = thinkingId;
    msgDiv.textContent = "Thinking...";
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // LIVE REPLIT BACKEND CONNECTION
    fetch('https://9a321a3a-8101-4f0c-9d5f-0b00194ea03b-00-3cdyv54qlvqr7.picard.replit.dev/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById(thinkingId).remove();
      addMessage(data.reply, "bot");
    })
    .catch(error => {
      console.error("Error:", error);
      document.getElementById(thinkingId).remove();
      addMessage("Sorry, I'm having trouble connecting right now.", "bot");
    });
  }

  sendBtn.addEventListener("click", handleSend);
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
});