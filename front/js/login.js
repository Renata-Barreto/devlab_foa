// esconder a senha
const togglePassword = document.querySelector("#togglePassword");
const passwordField = document.querySelector("#senha");

togglePassword.addEventListener("click", () => {
  const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);

  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

// alternar entre as páginas de login e cadastro
const togglePage = () => {
  const indicator = document.getElementById("indicator");
  const currentPage = window.location.pathname;

  if (currentPage.includes("login.html")) {
    indicator.style.left = "100px";
    setTimeout(() => {
      window.location.href = "cadastro.html";
    }, 300);
  } else if (currentPage.includes("cadastro.html")) {
    indicator.style.left = "0px";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 300);
  }
};

// menu
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav_links");

  hamburgerMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    navLinks.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (
      !navLinks.contains(event.target) &&
      !hamburgerMenu.contains(event.target)
    ) {
      navLinks.classList.remove("open");
    }
  });
});

async function salvar(token) {
  localStorage.setItem("auth", JSON.stringify(token));
}

// remover mensagens de erro padrão
document.querySelector("form").noValidate = true;

document.addEventListener("DOMContentLoaded", () => {
  const showError = (message) => {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("alertBox").classList.remove("hidden");
  };

  const hideError = () => {
    document.getElementById("alertBox").classList.add("hidden");
  };

  document.getElementById("alertOkButton").addEventListener("click", () => {
    hideError();
  });

  // login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    showError("Por favor, preencha todos os campos corretamente!");
    return;
  }

  try {
    // Usar caminho relativo para funcionar tanto localmente quanto no Render
    const apiUrl = "/auth/"; // Como o frontend é servido pelo mesmo servidor, isso resolve para http://127.0.0.1:3000/auth/ localmente e https://sua-app.onrender.com/auth/ no Render
    console.log(`Enviando requisição para: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: senha }),
        signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
      });
    // const response = await fetch(apiUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ email, password: senha }),
    // });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(`Erro na resposta da API: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || "Erro ao autenticar");
    }

    const { token, userTipo } = await response.json();
    console.log(`Resposta recebida: token=${token}, userTipo=${userTipo}`);

    if (token) {
      localStorage.setItem("auth", JSON.stringify({ token }));
    } else {
      throw new Error("Token não recebido da API.");
    }

    if (userTipo === "adm") {
      window.location.href = "pagina_adm.html";
    } else {
      window.location.href = "pagina_aluno.html";
    }
  } catch (error) {
    console.error(`Erro no login: ${error.message}`);
    if (error.message === "Usuário não encontrado") {
      showError("Este email não está cadastrado. Verifique ou cadastre-se.");
    } else if (error.message === "Senha incorreta") {
      showError("Senha incorreta. Tente novamente.");
    } else {
      showError(`Ocorreu um erro ao autenticar: ${error.message}`);
    }
  }
});

  // login
//   document.getElementById("loginForm").addEventListener("submit", async (e) => {
//     e.preventDefault();
//     hideError();

//     const email = document.getElementById("email").value;
//     const senha = document.getElementById("senha").value;

//     if (!email || !senha) {
//       showError("Por favor, preencha todos os campos corretamente!");
//       return;
//     }

//     try {
//       const response = await fetch("http://127.0.0.1:3000/auth/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password: senha }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Erro ao autenticar");
//       }

//       const { token, userTipo } = await response.json();

//       console.log(token);

//       if (token) {
//         localStorage.setItem("auth", JSON.stringify({ token }));
//       } else {
//         throw new Error("Token não recebido da API.");
//       }

//       if (userTipo === "adm") {
//         window.location.href = "pagina_adm.html";
//       } else {
//         window.location.href = "pagina_aluno.html";
//       }
//     } catch (error) {
//       if (error.message === "Usuário não encontrado") {
//         showError("Este email não está cadastrado. Verifique ou cadastre-se.");
//       } else if (error.message === "Senha incorreta") {
//         showError("Senha incorreta. Tente novamente.");
//       } else {
//         showError("Ocorreu um erro ao autenticar. Tente novamente.");
//       }
//     }
//   });
});

// validar email
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("emailError");

  const validateEmail = () => {
    const email = emailInput.value.trim();
    let errorMessage = "";

    if (email === "") {
      errorMessage = "Preencha o campo.";
    }

    if (errorMessage) {
      emailError.textContent = errorMessage;
      emailError.style.color = "red";
    } else {
      emailError.textContent = "";
    }
  };

  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim() !== "") {
      emailError.textContent = "";
    }
    validateEmail();
  });

  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    if (email !== "" && (!email.includes("@") || !email.includes("."))) {
      emailError.innerHTML =
        'O e-mail deve conter "@" seguido por <br>  um domínio. (Ex: devlab@gmail.com)';
      emailError.style.color = "red";
    }
  });
});

// validar senha
document.addEventListener("DOMContentLoaded", () => {
  const senhaInput = document.getElementById("senha");
  const senhaError = document.getElementById("senhaError");

  const validateSenha = () => {
    const senha = senhaInput.value.trim();

    if (senha === "") {
      senhaError.textContent = "Preencha o campo.";
      senhaError.style.color = "red";
    } else if (senha.length < 8) {
      senhaError.textContent = "A senha tem no mínimo 8 caracteres.";
      senhaError.style.color = "red";
    } else {
      senhaError.textContent = "";
    }
  };

  senhaInput.addEventListener("input", () => {
    validateSenha();
  });

  senhaInput.addEventListener("blur", () => {
    validateSenha();
  });
});
