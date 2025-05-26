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
    displayUserData(user);
  } catch (err) {
    console.error("Erro ao carregar dados do usuário:", err);
    localStorage.removeItem("auth");
    window.location.href = "/login.html";
  }
});

function displayUserData(user) {
  // Atualizar o nome do usuário
  const usuarioElements = document.querySelectorAll("#usuario");
  usuarioElements.forEach((el) => {
    el.textContent = user.nome_usr || user.email_usr.split("@")[0];
  });

  // Atualizar o e-mail
  const emailElement = document.getElementById("email_usuario");
  if (emailElement) {
    emailElement.textContent = user.email_usr;
    emailElement.href = `mailto:${user.email_usr}`;
  }

  // Atualizar a imagem de perfil
  const profileImg = document.querySelector(".profile-img2");
  if (user.Perfil?.prf_pfl) {
    profileImg.src = user.Perfil.prf_pfl.startsWith("data:image")
      ? user.Perfil.prf_pfl
      : `http://127.0.0.1:3000${user.Perfil.prf_pfl}`;
  } else {
    // Imagem padrão se não houver imagem salva
    profileImg.src = "/imagens/default-profile.png"; // Substitua pelo caminho de uma imagem padrão, se existir
  }

  // Atualizar a bio, se disponível
  const descriptionElement = document.querySelector(".description");
  if (user.Perfil?.des_pfl) {
    descriptionElement.textContent = user.Perfil.des_pfl;
  }

  // Configurar o botão de editar perfil
  const editButton = document.querySelector(".edit-button");
  editButton.addEventListener("click", () => {
    window.location.href = "/personalizacao.html";
  });
}

function excluirConta() {
  document.getElementById("confirmModal").style.display = "block";
}

async function confirmarExclusao() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token || auth;

  try {
    const response = await fetch("http://127.0.0.1:3000/user", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.removeItem("auth");
      showAlert("Conta excluída com sucesso!", () => {
        window.location.href = "/login.html";
      });
    } else {
      showAlert(data.message || "Erro ao excluir conta.");
    }
  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    showAlert("Erro ao excluir conta. Tente novamente.");
  }
}

function fecharModal() {
  document.getElementById("confirmModal").style.display = "none";
}

function showAlert(message, callback) {
  const alertBox = document.getElementById("alertBox");
  const alertMessage = document.getElementById("alertMessage");
  const alertOkButton = document.getElementById("alertOkButton");

  alertMessage.textContent = message;
  alertBox.classList.remove("hidden");

  alertOkButton.onclick = () => {
    alertBox.classList.add("hidden");
    if (callback) callback();
  };
}

// document.addEventListener("DOMContentLoaded", async function () {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   const token = auth?.token || auth;
//   const response = await fetch("http://localhost:3000/user", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     localStorage.removeItem("auth");
//     window.location.href = "login.html";
//     return;
//   }

//   const { user } = await response.json();
//   if (!user) {
//     localStorage.removeItem("auth");
//     window.location.href = "login.html";
//     return;
//   } else {
//     const userName = user.name || "Usuário DevLab";
//     const userEmail = user.email;
//     const bio = user.bio;
//     console.log(bio);
//     document.querySelector(".edit-button").addEventListener("click", () => {
//       window.location.href = "personalizacao.html";
//     });

//     // Exibir nome
//     const usuarioElements = document.querySelectorAll("#usuario");
//     usuarioElements.forEach((element) => {
//       element.innerText = `${userName}`;
//     });

//     // Exibir email
//     const emailElement = document.getElementById("email_usuario");
//     if (emailElement) {
//       emailElement.innerText = userEmail;
//       emailElement.href = `mailto:${userEmail}`;
//     }

//     // exibir bio
//     const bioElement = document.querySelector(".description");
//     if (bioElement) {
//       bioElement.innerHTML = bio;
//     }

//     // Foto de perfil
//     const userPhotoURL = user.avatar;
//     const profileImg = document.querySelector(".profile-img2");
// if (userPhotoURL && profileImg) {
//   if (!userPhotoURL.startsWith("data:image")) {
//     profileImg.src = `data:image/png;base64,${userPhotoURL}`;
//   } else {
//     profileImg.src = userPhotoURL;
//   }
// } else {
//   profileImg.src = "imagens/entrar.png"; 

//     }
//   }
// });

// // Funções de exclusão
// const excluirConta = () => {
//   const confirmModal = document.getElementById("confirmModal");
//   confirmModal.style.display = "flex";
// };

// const fecharModal = () => {
//   const confirmModal = document.getElementById("confirmModal");
//   confirmModal.style.display = "none";
// };

// const confirmarExclusao = async () => {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   const token = auth?.token || auth;

//   const response = await fetch("http://localhost:3000/user/delete", {
//     method: "PATCH",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     localStorage.removeItem("auth");
//     window.location.href = "login.html";
//     return;
//   }

//   const { user } = await response.json();

//   if (user.status === "inativo") {
//     showAlert("Sua conta foi excluída com sucesso!");
//     localStorage.removeItem("auth");
//     fecharModal();
//   } else {
//     showAlert("Erro: Usuário não encontrado.");
//     fecharModal();
//   }
// };


// const showAlert = (message) => {
//   const alertBox = document.getElementById("alertBox");
//   const alertMessage = document.getElementById("alertMessage");
//   alertMessage.textContent = message;
//   alertBox.style.display = "flex";
// };

// document.getElementById("alertOkButton").addEventListener("click", () => {
//   document.getElementById("alertBox").style.display = "none";
//   window.location.href = "cadastro.html";
// });

// //           // menu
// //           document.addEventListener('DOMContentLoaded', function () {
// //               const hamburgerMenu = document.querySelector('.hamburger-menu');
// //               const navLinks = document.querySelector('.nav_links');

// //               hamburgerMenu.addEventListener('click', function (event) {
// //                   event.stopPropagation();
// //                   navLinks.classList.toggle('open');
// //               });

// //               document.addEventListener('click', function (event) {
// //                   if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
// //                       navLinks.classList.remove('open')
// //                   }
// //               });
// //           });
// //           function entrar() {
// //           document.getElementById('linkIndex').click();
// //         }
