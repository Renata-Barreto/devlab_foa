// front/js/personalizacao.js
document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  console.log("Autenticação encontrada:", auth);

  if (!token) {
    console.warn("Usuário não autenticado. Token não encontrado no localStorage.");
    alert("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "/login.html";
    return;
  }

  const form = document.getElementById("personalizacaoForm");
  if (!form) {
    console.error("Elemento #personalizacaoForm não encontrado no DOM.");
    alert("Erro ao carregar formulário. Redirecionando para o login.");
    window.location.href = "/login.html";
    return;
  }

  try {
    console.log("Enviando requisição para GET /api/users com token:", token);
    const response = await fetch("/api/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Status da resposta:", response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Detalhes do erro:", errorData);
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText} - ${errorData.message || "Sem mensagem"}`);
    }

    const { user } = await response.json();
    console.log("Dados do usuário recebidos:", user);
    fetchUserData(user);
    form.setAttribute("data-token", token);
  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", err.message);
    localStorage.removeItem("auth");
    alert("Erro ao carregar dados do usuário. Redirecionando para o login.");
    window.location.href = "/login.html";
  }

  const fotoInput = document.getElementById("foto");
  if (fotoInput) {
    fotoInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarPreview = document.getElementById("avatarPreview");
          if (avatarPreview) {
            avatarPreview.src = e.target.result;
            console.log("Pré-visualização da imagem atualizada:", e.target.result);
          } else {
            console.warn("Elemento #avatarPreview não encontrado no DOM.");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    console.warn("Elemento #foto não encontrado no DOM.");
  }
});

function fetchUserData(user) {
  const nome = user.nome_usr || user.email_usr.split("@")[0];
  const inicial = nome.charAt(0).toUpperCase();

  const avatarPreview = document.getElementById("avatarPreview");
  if (avatarPreview) {
    if (user.img_usr) {
      avatarPreview.src = user.img_usr.startsWith("data:image")
        ? user.img_usr
        : `${user.img_usr}`; // Assume que img_usr é /Uploads/...
    } else {
      avatarPreview.src = "/Uploads/avatar-padrao.png";
    }
    console.log("Imagem do perfil carregada:", avatarPreview.src);
  } else {
    console.warn("Elemento #avatarPreview não encontrado no DOM.");
  }

  const bioInput = document.getElementById("bio");
  if (bioInput && user.des_pfl) {
    bioInput.value = user.des_pfl;
    console.log("Bio carregada:", user.des_pfl);
  } else if (!bioInput) {
    console.warn("Elemento #bio não encontrado no DOM.");
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
  if (!avatarPicker) {
    console.warn("Elemento #avatarPicker não encontrado no DOM.");
    return;
  }

  avatarPicker.innerHTML = "";

  avatarOptions.forEach((option) => {
    const avatarBlock = document.createElement("img");
    avatarBlock.classList.add("avatar-option");
    avatarBlock.src = option.path; // Caminho relativo
    avatarBlock.alt = option.color;
    avatarBlock.title = option.color;

    avatarBlock.addEventListener("click", () => {
      document.querySelectorAll(".avatar-option").forEach((block) => {
        block.classList.remove("selected");
      });
      avatarBlock.classList.add("selected");
      const avatarPreview = document.getElementById("avatarPreview");
      if (avatarPreview) {
        avatarPreview.src = avatarBlock.src;
        avatarPicker.setAttribute("data-selected-avatar", option.path);
        console.log("Avatar selecionado:", option.path);
      } else {
        console.warn("Elemento #avatarPreview não encontrado no DOM.");
      }
    });

    avatarPicker.appendChild(avatarBlock);
  });
}

const personalizacaoForm = document.getElementById("personalizacaoForm");
if (personalizacaoForm) {
  personalizacaoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const token = form.getAttribute("data-token");
    const bio = document.getElementById("bio")?.value.trim() || "";
    const fotoInput = document.getElementById("foto");
    const avatarPicker = document.getElementById("avatarPicker");
    const selectedAvatar = avatarPicker?.getAttribute("data-selected-avatar");

    const saveButton = document.querySelector("button.save");
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Salvando...";
    }

    const formData = new FormData();
    formData.append("bio", bio);
    if (fotoInput?.files.length > 0) {
      formData.append("foto", fotoInput.files[0]);
      console.log("Adicionando foto ao FormData:", fotoInput.files[0].name);
    } else if (selectedAvatar) {
      formData.append("avatar_path", selectedAvatar);
      console.log("Adicionando avatar_path ao FormData:", selectedAvatar);
    }

    try {
      console.log("Enviando requisição para PATCH /api/users");
      const response = await fetch("/api/users/", {
        method: "PATCH",
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
        console.error("Erro na atualização:", data.message);
        alert(data.message || "Erro ao atualizar perfil. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error.message);
      alert("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "Salvar";
      }
    }
  });
} else {
  console.error("Elemento #personalizacaoForm não encontrado no DOM.");
}

