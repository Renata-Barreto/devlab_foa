document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token || auth;

  if (!token) {
    console.log("Usuário não autenticado. Redirecionando para o login.");
    alert("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "/login.html";
    return;
  }

  try {
    console.log("Enviando requisição para GET /api/users com token:", token);
    const response = await fetch("http://127.0.0.1:3000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Status da resposta:", response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json();
      console.log("Detalhes do erro:", errorData);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText} - ${errorData.message || 'Sem mensagem'}`);
    }

    const { user } = await response.json();
    console.log("Dados do usuário recebidos:", user);
    fetchUserData(user);
    const form = document.getElementById("personalizacaoForm");
    form.setAttribute("data-token", token);
  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", err);
    localStorage.removeItem("auth");
    window.location.href = "/login.html";
  }

  // Adicionar listener para pré-visualização da imagem selecionada
  document.getElementById("foto").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById("avatarPreview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});

async function fetchUserData(user) {
  const nome = user.nome_usr || user.email_usr.split("@")[0];
  const inicial = nome.charAt(0).toUpperCase();
  const avatarPreview = document.getElementById("avatarPreview");

  if (user.prf_pfl) {
    avatarPreview.src = user.prf_pfl.startsWith("data:image")
      ? user.prf_pfl
      : `http://127.0.0.1:3000${user.prf_pfl}`;
  } else {
    avatarPreview.src = "/Uploads/avatar-padrao.png";
  }

  if (user.des_pfl) {
    document.getElementById("bio").value = user.des_pfl;
  }

  createAvatarPicker(inicial);
}

function createAvatarPicker(inicial) {
  const avatarOptions = [
    { color: "vermelho", path: "/Uploads/avatar-vermelho.png" },
    { color: "verde", path: "/Uploads/avatar-verde.png" },
    { color: "azul", path: "/Uploads/avatar-azul.png" },
    { color: "amarelo", path: "/Uploads/avatar-amarelo.png" },
    { color: "roxo", path: "/Uploads/avatar-roxo.png" },
  ];

  const avatarPicker = document.getElementById("avatarPicker");
  avatarPicker.innerHTML = "";

  avatarOptions.forEach(option => {
    const avatarBlock = document.createElement("img");
    avatarBlock.classList.add("avatar-option");
    avatarBlock.src = `http://127.0.0.1:3000${option.path}`;
    avatarBlock.alt = option.color;
    avatarBlock.title = option.color;

    avatarBlock.addEventListener("click", () => {
      document.querySelectorAll(".avatar-option").forEach(block => {
        block.classList.remove("selected");
      });
      avatarBlock.classList.add("selected");
      const avatarPreview = document.getElementById("avatarPreview");
      avatarPreview.src = avatarBlock.src;
      avatarPicker.setAttribute("data-selected-avatar", option.path);
    });

    avatarPicker.appendChild(avatarBlock);
  });
}

document.getElementById("personalizacaoForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const token = form.getAttribute("data-token");
  const bio = document.getElementById("bio").value.trim();
  const fotoInput = document.getElementById("foto");
  const selectedAvatar = document.getElementById("avatarPicker").getAttribute("data-selected-avatar");

  const saveButton = document.querySelector("button.save");
  saveButton.disabled = true;
  saveButton.textContent = "Salvando...";

  const formData = new FormData();
  formData.append("bio", bio);
  if (fotoInput.files.length > 0) {
    formData.append("foto", fotoInput.files[0]);
  } else if (selectedAvatar) {
    formData.append("avatar_path", selectedAvatar);
  }

  try {
    console.log("Enviando requisição para PATCH /api/users");
    const response = await fetch("http://127.0.0.1:3000/api/users", {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Status da resposta:", response.status, response.statusText);
    const data = await response.json();
    console.log("Dados recebidos:", data);

    if (response.ok && data.user) {
      console.log("Atualização bem-sucedida, redirecionando...");
      if (data.user.tipo === "adm") {
        window.location.href = "/pagina_adm.html";
      } else {
        window.location.href = "/pagina_aluno.html";
      }
    } else {
      console.log("Erro na atualização:", data.message);
      alert(data.message || "Erro ao atualizar perfil. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    alert("Erro ao atualizar perfil. Tente novamente.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Salvar";
  }
});