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
});

async function fetchUserData(user) {
  const nome = user.nome_usr || user.email_usr.split("@")[0];
  const inicial = nome.charAt(0).toUpperCase();
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.setAttribute("data-inicial", inicial);

  if (user.prf_pfl) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = user.prf_pfl.startsWith("data:image")
      ? user.prf_pfl
      : `http://127.0.0.1:3000${user.prf_pfl}`;
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(60, 60, 60, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, 120, 120);
      ctx.restore();
    };
  } else {
    generateAvatar(inicial);
  }

  if (user.des_pfl) {
    document.getElementById("bio").value = user.des_pfl;
  }

  createColorPicker();
}

function generateAvatar(inicial) {
  const cores = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#FFD733", "#33FFF5", "#FF9133", "#9133FF", "#FF3333"];
  const corAleatoria = cores[Math.floor(Math.random() * cores.length)];
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(60, 60, 60, 0, Math.PI * 2);
  ctx.fillStyle = corAleatoria;
  ctx.fill();

  ctx.font = "40px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(inicial, 60, 60);
}

function createColorPicker() {
  const cores = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#FFD733", "#33FFF5", "#FF9133", "#9133FF", "#FF3333"];
  const colorPicker = document.getElementById("colorPicker");

  cores.forEach(cor => {
    const colorBlock = document.createElement("div");
    colorBlock.classList.add("color-block");
    colorBlock.style.backgroundColor = cor;

    colorBlock.addEventListener("click", () => {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(60, 60, 60, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();

      ctx.font = "40px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(canvas.getAttribute("data-inicial"), 60, 60);
    });

    colorPicker.appendChild(colorBlock);
  });
}

document.getElementById("personalizacaoForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const token = form.getAttribute("data-token");
  const bio = document.getElementById("bio").value.trim();
  const canvasAvatar = document.getElementById("canvas").toDataURL();
  const fotoInput = document.getElementById("foto");

  const formData = new FormData();
  formData.append("bio", bio);
  formData.append("avatar", canvasAvatar);
  if (fotoInput.files.length > 0) {
    formData.append("foto", fotoInput.files[0]);
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
  }
});