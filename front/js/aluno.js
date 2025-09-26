// front/js/aluno.js
document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  console.log('Autenticação encontrada:', auth);

  if (!token) {
    console.warn("Usuário não autenticado. Token não encontrado no localStorage.");
    window.location.href = "/login.html";
    return;
  }

  // Adicionar atraso para mitigar latência no banco (opcional, pode remover se não necessário)
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    console.log('Enviando requisição para /api/users com token:', token);
    const response = await fetch("https://devlab-foa.onrender.com/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Resposta recebida:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta:', { status: response.status, message: errorData.message });
      showAlert(errorData.message || `Erro ao carregar dados: ${response.statusText}`, () => {
        localStorage.removeItem("auth");
        window.location.href = "/login.html";
      });
      return;
    }

    const { user } = await response.json();
    console.log('Dados do usuário recebidos:', user);
    displayUserData(user);
  } catch (err) {
    console.error("Erro ao carregar dados do usuário:", err.message);
    showAlert("Erro ao carregar dados do usuário. Tente novamente.", () => {
      localStorage.removeItem("auth");
      window.location.href = "/login.html";
    });
  }
});

function displayUserData(user) {
  console.log('Exibindo dados do usuário:', user);
  const usuarioElements = document.querySelectorAll("#usuario");
  usuarioElements.forEach((el) => {
    el.textContent = user.nome_usr || user.email_usr.split("@")[0];
  });

  const emailElement = document.getElementById("email_usuario");
  if (emailElement) {
    emailElement.textContent = user.email_usr;
    emailElement.href = `mailto:${user.email_usr}`;
  } else {
    console.warn("Elemento #email_usuario não encontrado no DOM.");
  }

  const profileImg = document.querySelector(".profile-img2");
  if (profileImg) {
    if (user.img_usr) {
      profileImg.src = user.img_usr.startsWith("data:image")
        ? user.img_usr
        : `${user.img_usr}`; 
    } else {
      profileImg.src = "https://devlab-foa.onrender.com/imagens/entrar.png";
    }
  } else {
    console.warn("Elemento .profile-img2 não encontrado no DOM.");
  }

  const descriptionElement = document.querySelector(".description");
  if (descriptionElement) {
    descriptionElement.textContent = user.des_pfl || "Nenhuma descrição fornecida.";
  } else {
    console.warn("Elemento .description não encontrado no DOM.");
  }

  const editButton = document.querySelector(".edit-button");
  if (editButton) {
    editButton.addEventListener("click", () => {
      console.log('Redirecionando para personalizacao.html');
      window.location.href = "/personalizacao.html";
    });
  } else {
    console.warn("Elemento .edit-button não encontrado no DOM.");
  }
}

function excluirConta() {
  console.log('Abrindo modal de confirmação de exclusão');
  const confirmModal = document.getElementById("confirmModal");
  if (confirmModal) {
    confirmModal.style.display = "block";
  } else {
    console.warn("Elemento #confirmModal não encontrado no DOM.");
  }
}

async function confirmarExclusao() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  console.log('Confirmando exclusão de conta');
  try {
    const response = await fetch("/api/users", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Resposta da exclusão:', response.status);
    const data = await response.json();
    if (response.ok) {
      console.log('Conta excluída com sucesso');
      localStorage.removeItem("auth");
      showAlert("Conta excluída com sucesso!", () => {
        window.location.href = "/login.html";
      });
    } else {
      console.error('Erro ao excluir:', data.message);
      showAlert(data.message || "Erro ao excluir conta.");
    }
  } catch (err) {
    console.error("Erro ao excluir conta:", err.message);
    showAlert("Erro ao excluir conta. Tente novamente.");
  }
}

function fecharModal() {
  console.log('Fechando modal de exclusão');
  const confirmModal = document.getElementById("confirmModal");
  if (confirmModal) {
    confirmModal.style.display = "none";
  } else {
    console.warn("Elemento #confirmModal não encontrado no DOM.");
  }
}

function showAlert(message, callback) {
  console.log('Exibindo alerta:', message);
  const alertBox = document.getElementById("alertBox");
  const alertMessage = document.getElementById("alertMessage");
  const alertOkButton = document.getElementById("alertOkButton");

  if (alertBox && alertMessage && alertOkButton) {
    alertMessage.textContent = message;
    alertBox.classList.remove("hidden");

    alertOkButton.onclick = () => {
      alertBox.classList.add("hidden");
      if (callback) {
        console.log('Executando callback do alerta');
        callback();
      }
    };
  } else {
    console.warn("Elementos de alerta (#alertBox, #alertMessage, #alertOkButton) não encontrados no DOM.");
    alert(message); // Fallback para alert nativo
    if (callback) callback();
  }
}

