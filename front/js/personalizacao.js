document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token || auth;

  if (!token) {
    alert("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "/login.html";
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token inválido ou usuário não encontrado");
    }

    const { user } = await response.json();
    fetchUserData(user);
    const form = document.getElementById("personalizacaoForm");
    form.setAttribute("data-token", token);
  } catch (err) {
    console.error(err);
    localStorage.removeItem("auth");
    window.location.href = "/login.html";
  }
});

async function fetchUserData(user) {
  const nome = user.nome_usr || user.email_usr.split("@")[0];
  const inicial = nome.charAt(0).toUpperCase();
  document.getElementById("canvas").setAttribute("data-inicial", inicial);
  generateAvatar(inicial);
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
    const response = await fetch(`http://127.0.0.1:3000/user/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.user) {
      if (data.user.tipo === "adm") {
        window.location.href = "/pagina_adm.html";
      } else {
        window.location.href = "/pagina_aluno.html";
      }
    } else {
      alert(data.message || "Erro ao atualizar perfil. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    alert("Erro ao atualizar perfil. Tente novamente.");
  }
});

// document.addEventListener("DOMContentLoaded", async () => {
//     const auth = JSON.parse(localStorage.getItem("auth"));
//     const token = auth?.token || auth;
  
//     if (!token) {
//       alert("Usuário não autenticado. Redirecionando para o login.");
//       window.location.href = "login.html";
//       return;
//     }
  
//     try {
//       const response = await fetch("http://127.0.0.1:3000/user", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
  
//       if (!response.ok) {
//         throw new Error("Token inválido ou usuário não encontrado");
//       }
  
//       const { user } = await response.json();

  
//       fetchUserData(user); 
  
      
//       const form = document.getElementById("personalizacaoForm");
//       form.setAttribute("data-token", token); 
  
//     } catch (err) {
//       console.error(err);
//       localStorage.removeItem("auth");
//       window.location.href = "login.html";
//     }
//   });
  
//   // Busca os dados e renderiza avatar + cores
//   async function fetchUserData(user) {
//     const nome = user.name || user.username || user.email.split("@")[0];
//     const inicial = nome.charAt(0).toUpperCase();
  
//     document.getElementById("canvas").setAttribute("data-inicial", inicial);
//     generateAvatar(inicial);
//     createColorPicker();
//   }
  
//   // Gera avatar no canvas com cor aleatória
//   function generateAvatar(inicial) {
//     const cores = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#FFD733", "#33FFF5", "#FF9133", "#9133FF", "#FF3333"];
//     const corAleatoria = cores[Math.floor(Math.random() * cores.length)];
  
//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
  
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.beginPath();
//     ctx.arc(60, 60, 60, 0, Math.PI * 2);
//     ctx.fillStyle = corAleatoria;
//     ctx.fill();
  
//     ctx.font = "40px Arial";
//     ctx.fillStyle = "white";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.fillText(inicial, 60, 60);
//   }
  
//   // Cria os blocos de cor para personalizar o avatar
//   function createColorPicker() {
//     const cores = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF", "#FFD733", "#33FFF5", "#FF9133", "#9133FF", "#FF3333"];
//     const colorPicker = document.getElementById("colorPicker");
  
//     cores.forEach(cor => {
//       const colorBlock = document.createElement("div");
//       colorBlock.classList.add("color-block");
//       colorBlock.style.backgroundColor = cor;
  
//       colorBlock.addEventListener("click", () => {
//         const canvas = document.getElementById("canvas");
//         const ctx = canvas.getContext("2d");
  
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.beginPath();
//         ctx.arc(60, 60, 60, 0, Math.PI * 2);
//         ctx.fillStyle = cor;
//         ctx.fill();
  
//         ctx.font = "40px Arial";
//         ctx.fillStyle = "white";
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillText(canvas.getAttribute("data-inicial"), 60, 60);
//       });
  
//       colorPicker.appendChild(colorBlock);
//     });
//   }
  
//   // Envia avatar e bio pro backend
//   document.getElementById("personalizacaoForm").addEventListener("submit", async (event) => {
//     event.preventDefault();
  
//     const form = event.target;
//     const token = form.getAttribute("data-token");
  
//     const bio = document.getElementById("bio").value.trim();
//     const fotoUrl = document.getElementById("canvas").toDataURL();
  
//     try {
//       const response = await fetch(`http://127.0.0.1:3000/user/`, {
//         method: 'PATCH',
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           bio,
//           avatar: fotoUrl,
//         }),
//       });
  
//       const data = await response.json();
  
//       if (response.ok && data.user) {
//         if (data.user.tipo === "adm") {
//           window.location.href = "/pagina_adm.html";
//         } else {
//           window.location.href = "/pagina_aluno.html";
//         }
//       } else {
//         alert(data.message || "Erro ao atualizar perfil. Tente novamente.");
//       }
//     } catch (error) {
//       console.error("Erro ao atualizar perfil:", error);
//       alert("Erro ao atualizar perfil. Tente novamente.");
//     }
//   });

  // document.getElementById("personalizacaoForm").addEventListener("submit", async (event) => {
  //   event.preventDefault();
  
  //   const form = event.target;
  //   const token = form.getAttribute("data-token");
  
  //   const bio = document.getElementById("bio").value.trim();
  //   const fotoUrl = document.getElementById("canvas").toDataURL();
  
  //   try {
  //     const response = await fetch(`http://127.0.0.1:3000/user/`, {
  //       method: 'PATCH',
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         bio,
  //         avatar: fotoUrl,
  //       }),
  //     });
  
  //     const data = await response.json();
  
  //     if (response.ok && data.user) {
  //       if (data.user.tipo === "adm") {
  //         window.location.href = "pagina_adm.html";
  //       } else {
  //         window.location.href = "pagina_aluno.html";
  //       }
  //     } else {
  //       alert("Erro ao atualizar perfil. Tente novamente.");
  //     }
  //   } catch (error) {
  //     console.error("Erro ao atualizar perfil:", error);
  //     alert("Erro ao atualizar perfil. Tente novamente.");
  //   }
  // });
  