export function validateEmail(email) {
  if (email.trim() === "") {
    return "Preencha o campo.";
  }
  if (!email.includes("@") || !email.includes(".")) {
    return 'O e-mail deve conter "@" seguido por <br> um domínio. (Ex: devlab@gmail.com)';
  }
  return "";
}

export function validateSenha(senha) {
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
}