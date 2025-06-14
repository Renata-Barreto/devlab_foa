// esconder a senha e confirmação de senha
const togglePasswordVisibility = (toggleElementId, passwordFieldId) => {
    const toggleElement = document.querySelector(toggleElementId);
    const passwordField = document.querySelector(passwordFieldId);

    toggleElement.addEventListener("click", () => {
        const type = passwordField.type === "password" ? "text" : "password";
        passwordField.type = type;

        toggleElement.classList.toggle("fa-eye");
        toggleElement.classList.toggle("fa-eye-slash");
    });
};

togglePasswordVisibility("#togglePassword", "#senha");
togglePasswordVisibility("#togglePasswordConfirm", "#senhaConfirm");
// alternar entre as páginas de login e cadastro
const togglePage = () => {
    const indicator = document.getElementById('indicator')
    const currentPage = window.location.pathname

    if (currentPage.includes("cadastro.html")) {
        indicator.style.left = '0px'  
        setTimeout(() => {
            window.location.href = 'login.html' 
        }, 300)  
    } else if (currentPage.includes("login.html")) {
        indicator.style.left = '100px'  
        setTimeout(() => {
            window.location.href = 'cadastro.html'  
        }, 300)  
    }
}

//menu
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu')
    const navLinks = document.querySelector('.nav_links')

    hamburgerMenu.addEventListener('click', (event) => {
        event.stopPropagation()
        navLinks.classList.toggle('open')
    })

    document.addEventListener('click', (event) => {
        if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            navLinks.classList.remove('open')
        }
    })
})


//remover mensagens de erro padrão
document.querySelector("form").noValidate = true;
   

// cadastro
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const senhaConfirmInput = document.getElementById('senhaConfirm');
    const nomeError = document.getElementById('nomeError');
    const emailError = document.getElementById('emailError');
    const senhaError = document.getElementById('senhaError');
    const senhaConfirmError = document.getElementById('senhaConfirmError');
    const passwordRules = document.getElementById('passwordRules');
  
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertOkButton = document.getElementById('alertOkButton');
  
    // Mostrar alertBox
    function mostrarAlerta(msg) {
      alertBox.classList.remove('hidden');
      alertMessage.innerHTML = msg;
      alertOkButton.onclick = () => {
        alertBox.classList.add('hidden');
      };
    }
  
    // Validações específicas
    const validateNome = () => {
      const nome = nomeInput.value.trim();
      if (nome === '') {
        nomeError.textContent = 'Preencha o campo.';
      } else if (nome.length < 3) {
        nomeError.textContent = 'O nome deve ter no mínimo 3 caracteres.';
      } else if (/\d/.test(nome)) {
        nomeError.textContent = 'Números não são permitidos.';
      } else if (/[^a-zA-ZáéíóúãõâêîôûàèìòùäëïöüçÇ\s]/.test(nome)) {
        nomeError.textContent = 'Caracteres especiais não são permitidos.';
      } else {
        nomeError.textContent = '';
      }
    };
  
    const validateEmail = () => {
      const email = emailInput.value.trim();
      let errorMessage = '';
  
      if (email === '') {
        errorMessage = 'Preencha o campo.';
      } else if (!email.includes('@') || !email.includes('.')) {
        errorMessage = 'O e-mail deve conter "@" e domínio. Ex: devlab@gmail.com';
      }
  
      emailError.textContent = errorMessage;
    };
  
    const rules = [
      { id: 'ruleMinLength', text: '* Mínimo de 8 caracteres', regex: /.{8,}/ },
      { id: 'ruleSpecialChar', text: '* Caractere especial', regex: /[!@#$%^&*(),.?":{}|<>]/ },
      { id: 'ruleUpperCase', text: '* Letra maiúscula', regex: /[A-Z]/ },
      { id: 'ruleLowerCase', text: '* Letra minúscula', regex: /[a-z]/ },
      { id: 'ruleNumeric', text: '* Um número', regex: /\d/ }
    ];
  
    passwordRules.innerHTML = rules.map(rule => `<p id="${rule.id}" class="invalid">${rule.text}</p>`).join('');
  
    const validateSenha = () => {
      const senha = senhaInput.value.trim();
  
      if (senha === '') {
        senhaError.textContent = 'Preencha o campo.';
        passwordRules.style.display = 'none';
      } else {
        senhaError.textContent = '';
        passwordRules.style.display = 'block';
      }
  
      rules.forEach((rule) => {
        const el = document.getElementById(rule.id);
        if (rule.regex.test(senha)) {
          el.classList.add('valid');
          el.classList.remove('invalid');
        } else {
          el.classList.add('invalid');
          el.classList.remove('valid');
        }
      });
    };
  
    const validateSenhaConfirm = () => {
      const senha = senhaInput.value.trim();
      const confirm = senhaConfirmInput.value.trim();
  
      if (confirm === '') {
        senhaConfirmError.textContent = 'Preencha o campo.';
      } else if (senha !== confirm) {
        senhaConfirmError.textContent = 'As senhas não coincidem.';
      } else {
        senhaConfirmError.textContent = '';
      }
    };
  
    // Eventos de input
    nomeInput.addEventListener('blur', validateNome);
    emailInput.addEventListener('blur', validateEmail);
    senhaInput.addEventListener('input', validateSenha);
    senhaConfirmInput.addEventListener('input', validateSenhaConfirm);
    senhaInput.addEventListener('focus', () => passwordRules.style.display = 'block');
    senhaInput.addEventListener('blur', () => passwordRules.style.display = 'none');
  
    // Enviar formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();
  const senhaConfirm = senhaConfirmInput.value.trim();

  // Executar as validações novamente
  validateNome();
  validateEmail();
  validateSenha();
  validateSenhaConfirm();

  const hasErrors = nomeError.textContent || emailError.textContent || senhaError.textContent || senhaConfirmError.textContent;

  if (hasErrors) {
    mostrarAlerta('Corrija os erros nos campos antes de continuar.');
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3000/api/users', { // Alterado para /api/users
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nome, email, password: senha })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('auth', JSON.stringify(data.token));
      window.location.href = 'personalizacao.html';
    } else {
      mostrarAlerta(data.mensagem || 'Erro ao cadastrar. Tente novamente.');
    }
  } catch (err) {
    console.error(err);
    mostrarAlerta('Erro na comunicação com o servidor.');
  }
});
    
    // // Enviar formulário
    // form.addEventListener('submit', async (e) => {
    //   e.preventDefault();
  
    //   const nome = nomeInput.value.trim();
    //   const email = emailInput.value.trim();
    //   const senha = senhaInput.value.trim();
    //   const senhaConfirm = senhaConfirmInput.value.trim();
  
    //   // Executar as validações novamente
    //   validateNome();
    //   validateEmail();
    //   validateSenha();
    //   validateSenhaConfirm();
  
    //   const hasErrors = nomeError.textContent || emailError.textContent || senhaError.textContent || senhaConfirmError.textContent;
  
    //   if (hasErrors) {
    //     mostrarAlerta('Corrija os erros nos campos antes de continuar.');
    //     return;
    //   }
  
    //   try {
    //     const response = await fetch('http://127.0.0.1:3000/user/create', {
    //       method: 'POST',
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ name:nome, email,password:senha})
    //     });
  
    //     const data = await response.json();
  
    //     if (response.ok) {
    //       localStorage.setItem('auth', JSON.stringify(data.token));
    //       window.location.href = 'personalizacao.html';
    //     } else {
    //       mostrarAlerta(data.mensagem || 'Erro ao cadastrar. Tente novamente.');
    //     }
    //   } catch (err) {
    //     console.error(err);
    //     mostrarAlerta('Erro na comunicação com o servidor.');
    //   }
    // });
  });
  