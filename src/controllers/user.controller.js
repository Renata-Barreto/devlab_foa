// src/controllers/user.controller.js
import userService from '../services/user.service.js';
import { generateToken } from '../services/auth.service.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../front/Uploads');
    console.log(`Salvando arquivo em: ${uploadPath}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      console.log(`Arquivo rejeitado: ${file.originalname} (apenas JPEG/PNG são permitidos)`);
      cb(new Error('Apenas imagens JPEG ou PNG são permitidas'));
    }
  },
  limits: { fileSize: 1024 * 1024 }, // 1MB
}).single('foto');

const userController = {
  create: async (req, res) => {
    try {
      const { name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr } = req.body;
      if (!name || !email || !password) {
        console.log('Erro: Campos obrigatórios (name, email, password) não fornecidos');
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios' });
      }

      const existe = await userService.findByEmailService(email);
      if (existe) {
        console.log(`Erro: E-mail ${email} já cadastrado`);
        return res.status(409).json({ message: 'Usuário já cadastrado.' });
      }

      const body = { name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr };
      const user = await userService.createService(body);
      if (!user) {
        console.log('Erro: Falha ao criar usuário');
        return res.status(400).json({ message: 'Erro ao criar usuário' });
      }

      const token = await generateToken(user.id_usr, user.nome_usr, user.email_usr, user.img_usr);
      console.log(`Usuário criado com ID ${user.id_usr}, token gerado`);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        token,
      });
    } catch (err) {
      console.error('Erro no create do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },

  findAll: async (req, res) => {
    try {
      const users = await userService.findAllService();
      if (users.length === 0) {
        console.log('Nenhum usuário encontrado');
        return res.status(404).json({ message: 'Nenhum usuário cadastrado' });
      }

      res.json(users);
    } catch (err) {
      console.error('Erro no findAll do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },

  findById: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.log('Erro: Usuário não encontrado em req.user');
        return res.status(401).json({ message: 'Não autorizado' });
      }
      console.log(`Retornando usuário ID ${user.id_usr}`);
      res.json({
        user: {
          id_usr: user.id_usr,
          nome_usr: user.nome_usr,
          email_usr: user.email_usr,
          img_usr: user.img_usr,
          des_pfl: user.des_pfl || null,
          prf_pfl: user.prf_pfl || null,
          cat_usr: user.cat_usr,
          end_usr: user.end_usr,
          cid_usr: user.cid_usr,
          est_usr: user.est_usr,
          dtn_usr: user.dtn_usr,
          tipo: user.cat_usr === 1 ? 'adm' : 'aluno',
        },
      });
    } catch (err) {
      console.error('Erro no findById do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },

  update: async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          console.log('Erro no upload:', err.message);
          return res.status(400).json({ message: err.message });
        }

        const { bio, avatar } = req.body;
        const foto = req.file;

        if (!bio && !avatar && !foto) {
          console.log('Erro: Nenhum campo fornecido para atualização');
          return res.status(400).json({ message: 'Forneça pelo menos um campo para atualizar' });
        }

        if (bio && bio.length > 1000) {
          console.log('Erro: Bio excede 1000 caracteres');
          return res.status(400).json({ message: 'Bio não pode exceder 1000 caracteres' });
        }
        if (avatar && avatar.length > 500000) {
          console.log('Erro: Imagem de avatar muito grande');
          return res.status(400).json({ message: 'Imagem de avatar muito grande (máx 500KB)' });
        }

        const userId = req.user?.id_usr;
        if (!userId) {
          console.log('Erro: ID do usuário não encontrado em req.user');
          return res.status(401).json({ message: 'Não autorizado' });
        }

        const fotoPath = foto ? `/Uploads/${foto.filename}` : null;
        console.log(`Atualizando usuário ID ${userId}, fotoPath: ${fotoPath}, bio: ${bio}, avatar: ${avatar}`);

        await userService.updateService(userId, avatar, bio, fotoPath);
        const user = await userService.findByIdService(userId);

        if (!user) {
          console.log(`Erro: Usuário ID ${userId} não encontrado após atualização`);
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({
          message: 'Usuário atualizado com sucesso',
          user: {
            id_usr: user.id_usr,
            nome_usr: user.nome_usr,
            email_usr: user.email_usr,
            img_usr: user.img_usr,
            des_pfl: user.des_pfl,
            cat_usr: user.cat_usr,
            tipo: user.cat_usr === 1 ? 'adm' : 'aluno',
          },
        });
      });
    } catch (err) {
      console.error('Erro no update do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },

  delete: async (req, res) => {
    try {
      const userId = req.user?.id_usr;
      if (!userId) {
        console.log('Erro: ID do usuário não encontrado em req.user');
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const user = await userService.deleteService(userId);
      if (!user) {
        console.log(`Erro: Usuário ID ${userId} não encontrado para deleção`);
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário desativado com sucesso', user });
    } catch (err) {
      console.error('Erro no delete do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },

  delete1: async (req, res) => {
    try {
      const userId = req.user?.id_usr;
      if (!userId) {
        console.log('Erro: ID do usuário não encontrado em req.user');
        return res.status(401).json({ message: 'Não autorizado' });
      }

      const user = await userService.deleteService1(userId);
      if (!user) {
        console.log(`Erro: Usuário ID ${userId} não encontrado para deleção permanente`);
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário deletado permanentemente com sucesso' });
    } catch (err) {
      console.error('Erro no delete1 do userController:', err.message);
      res.status(500).json({ message: err.message || 'Erro interno do servidor' });
    }
  },
};

export default userController;