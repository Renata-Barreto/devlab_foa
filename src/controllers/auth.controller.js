// src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import { loginService, generateToken } from "../services/auth.service.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      console.log("Erro: E-mail ou senha não fornecidos");
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const user = await loginService(email);

    if (!user || !user.ativo) {
      console.log(
        `Erro: Usuário com e-mail ${email} não encontrado ou inativo`
      );
      return res
        .status(404)
        .json({ error: "Usuário não encontrado ou inativo" });
    }

    const senhaCorreta = bcrypt.compareSync(password, user.pwd_usr);

    if (!senhaCorreta) {
      console.log(`Erro: Senha incorreta para o e-mail ${email}`);
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = generateToken(
      user.id_usr,
      user.nome_usr,
      user.email_usr,
      user.img_usr
    );
    const userTipo = user.cat_usr === 1 ? "adm" : "aluno";

    console.log(
      `Login bem-sucedido para o usuário ID ${user.id_usr}, tipo: ${userTipo}`
    );

    return res.status(200).json({ token, userTipo });
  } catch (err) {
    console.error("Erro no login do authController:", err.message);
    return res
      .status(500)
      .json({ error: err.message || "Internal Server Error" });
  }
};

export { login };
