import bcrypt from 'bcrypt';
import { loginService, generateToken } from '../services/auth.service.js';

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      console.log('Erro: E-mail ou senha não fornecidos');
      return res.status(400).send({ message: 'E-mail e senha são obrigatórios' });
    }

    const user = await loginService(email);
    if (!user || !user.ativo) {
      console.log(`Erro: Usuário com e-mail ${email} não encontrado ou inativo`);
      return res.status(404).send({ message: 'Usuário não encontrado ou inativo' });
    }

    const senhaCorreta = bcrypt.compareSync(password, user.pwd_usr);
    if (!senhaCorreta) {
      console.log(`Erro: Senha incorreta para o e-mail ${email}`);
      return res.status(401).send({ message: 'Senha incorreta' });
    }

    const token = generateToken(user.id_usr);
    const userTipo = user.cat_usr === 1 ? 'adm' : 'aluno';
    console.log(`Login bem-sucedido para o usuário ID ${user.id_usr}, tipo: ${userTipo}`);

    res.send({ token, userTipo });
  } catch (err) {
    console.error('Erro no login do authController:', err.message);
    res.status(500).send({ message: err.message || 'Internal Server Error' });
  }
};

export { login }; //

// // não precisa mudar
// import bcrypt from 'bcrypt';
// import { loginService, generateToken } from '../services/auth.service.js';

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await loginService(email);

//     if (!user || !user.ativo) {
//       return res.status(404).send({ message: 'Usuário não encontrado' });
//     }

//     const senhaCorreta = bcrypt.compareSync(password, user.pwd_usr);
//     if (!senhaCorreta) {
//       return res.status(401).send({ message: 'Senha incorreta' });
//     }

//     const token = generateToken(user.id_usr);
//     const userTipo = user.cat_usr === 1 ? 'adm' : 'aluno';

//     res.send({ token, userTipo });
//   } catch (err) {
//     res.status(500).send({ message: err.message });
//   }
// };

// export { login };