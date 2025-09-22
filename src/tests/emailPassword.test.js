import { test, assert, beforeEach, describe } from 'poku';
import quibble from 'quibble';

let validateEmail;
let validateSenha;

describe('TESTE DE VALIDAÇÃO DE EMAIL E SENHA', {background: 'magenta'})

beforeEach(async () => {
  await quibble.esm('./functions/validateEmail.js', {
    validateEmail: (email) => {
      if (email.trim() === "") {
        return "Preencha o campo.";
      }
      if (!email.includes("@") || !email.includes(".")) {
        return 'O e-mail deve conter "@" seguido por <br> um domínio. (Ex: devlab@gmail.com)';
      }
      return "";
    },

    validateSenha: (senha) => {
        if (!senha || senha.trim() === "") {
            return "Preencha o campo.";
    }
        if (senha.length < 8) {
            return "A senha tem no mínimo 8 caracteres.";
    }
        return "";
    }
});
  validateEmail = (await import('./functions/validateEmail.js')).validateEmail;
  validateSenha = (await import('./functions/validateEmail.js')).validateSenha;
});

test('deve retornar erro se o campo estiver vazio', () => {
  const result = validateEmail('');
  assert.equal(result, "Preencha o campo.");
});

test('deve retornar erro se o email não tiver @ ou .', () => {
  const result = validateEmail('usuarioemailcom');
  assert.equal(result, 'O e-mail deve conter "@" seguido por <br> um domínio. (Ex: devlab@gmail.com)');
});

test('deve retornar erro se o email não tiver domínio', () => {
  const result = validateEmail('usuario@');
  assert.equal(result, 'O e-mail deve conter "@" seguido por <br> um domínio. (Ex: devlab@gmail.com)');
});

test('deve retornar vazio se o email for válido', () => {
  const result = validateEmail('usuario@email.com');
  assert.equal(result, "");
});

test('deve retornar erro se a senha estiver vazia', () => {
    const result = validateSenha();
    assert.equal(result, 'Preencha o campo.');
})

test('deve retornar erro se não houver 8 caracteres', ()=> {
    const result = validateSenha('123');
    assert.equal(result, 'A senha tem no mínimo 8 caracteres.')
})