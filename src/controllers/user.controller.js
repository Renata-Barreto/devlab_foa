import userService from '../services/user.service.js';
import { generateToken } from '../services/auth.service.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar o multer para salvar arquivos
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
        return res.status(400).send({ message: 'Submit all fields for registration' });
      }

      const existe = await userService.findByEmailService(email);
      if (existe) {
        console.log(`Erro: E-mail ${email} já cadastrado`);
        return res.status(409).json({ mensagem: 'Usuário já cadastrado.' });
      }

      const body = { name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr };
      const user = await userService.createService(body);
      if (!user) {
        console.log('Erro: Falha ao criar usuário');
        return res.status(400).send({ message: 'Error creating user' });
      }

      const token = await generateToken(user.id_usr);
      console.log(`Usuário criado com ID ${user.id_usr}, token gerado`);

      res.status(201).send({
        message: 'User created successfully',
        token,
      });
    } catch (err) {
      console.error('Erro no create do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },

  findAll: async (req, res) => {
    try {
      const users = await userService.findAllService();
      if (users.length === 0) {
        console.log('Nenhum usuário encontrado');
        return res.status(400).send({ message: 'There are no registered users' });
      }

      res.send(users);
    } catch (err) {
      console.error('Erro no findAll do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },

  findById: async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.log('Erro: Usuário não encontrado em req.user');
        return res.status(401).send({ message: 'Unauthorized' });
      }
      res.send({ user });
    } catch (err) {
      console.error('Erro no findById do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },

  update: async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          console.log('Erro no upload:', err.message);
          return res.status(400).send({ message: err.message });
        }

        const { bio, avatar } = req.body;
        const foto = req.file;

        if (!bio && !avatar && !foto) {
          console.log('Erro: Nenhum campo fornecido para atualização');
          return res.status(400).send({ message: 'Submit at least one field for update' });
        }

        if (bio && bio.length > 1000) {
          console.log('Erro: Bio excede 1000 caracteres');
          return res.status(400).send({ message: 'Bio cannot exceed 1000 characters' });
        }
        if (avatar && avatar.length > 500000) {
          console.log('Erro: Imagem de avatar muito grande');
          return res.status(400).send({ message: 'Avatar image is too large (max 500KB)' });
        }

        const userId = req.user?.id_usr;
        if (!userId) {
          console.log('Erro: ID do usuário não encontrado em req.user');
          return res.status(401).send({ message: 'Unauthorized' });
        }

        const fotoPath = foto ? `/Uploads/${foto.filename}` : null;
        console.log(`Atualizando usuário ID ${userId}, fotoPath: ${fotoPath}, bio: ${bio}, avatar: ${avatar}`);

        await userService.updateService(userId, avatar, bio, fotoPath);
        const user = await userService.findByIdService(userId);

        if (!user) {
          console.log(`Erro: Usuário ID ${userId} não encontrado após atualização`);
          return res.status(404).send({ message: 'User not found' });
        }

        res.send({
          message: 'User successfully updated',
          user: {
            id_usr: user.id_usr,
            nome_usr: user.nome_usr,
            email_usr: user.email_usr,
            cat_usr: user.cat_usr,
            img: user.img_usr,
            des_pfl: user.des_pfl,
            prf_pfl: user.prf_pfl,
            tipo: user.cat_usr === 1 ? 'adm' : 'aluno',
          },
        });
      });
    } catch (err) {
      console.error('Erro no update do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },

  delete: async (req, res) => {
    try {
      const userId = req.user?.id_usr;
      if (!userId) {
        console.log('Erro: ID do usuário não encontrado em req.user');
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const user = await userService.deleteService(userId);
      if (!user) {
        console.log(`Erro: Usuário ID ${userId} não encontrado para deleção`);
        return res.status(404).send({ message: 'User not found' });
      }

      res.send({ message: 'User successfully deleted', user });
    } catch (err) {
      console.error('Erro no delete do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },

  delete1: async (req, res) => {
    try {
      const userId = req.user?.id_usr;
      if (!userId) {
        console.log('Erro: ID do usuário não encontrado em req.user');
        return res.status(401).send({ message: 'Unauthorized' });
      }

      const user = await userService.deleteService1(userId);
      if (!user) {
        console.log(`Erro: Usuário ID ${userId} não encontrado para deleção permanente`);
        return res.status(404).send({ message: 'User not found' });
      }

      res.send({ message: 'User successfully deleted' });
    } catch (err) {
      console.error('Erro no delete1 do userController:', err.message);
      res.status(500).send({ message: err.message || 'Internal Server Error' });
    }
  },
};

export default userController; //

// import userService from '../services/user.service.js';
// import { generateToken } from '../services/auth.service.js';
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configurar o multer para salvar arquivos
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../../front/Uploads')); // Ajustado para subir dois níveis até a raiz e entrar em front/Uploads
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = fileTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Apenas imagens JPEG ou PNG são permitidas'));
//     }
//   },
//   limits: { fileSize: 1024 * 1024 }, // 1MB
// }).single('foto');

// const userController = {
//   create: async (req, res) => {
//     try {
//       const { name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr } = req.body;
//       if (!name || !email || !password) {
//         return res.status(400).send({ message: 'Submit all fields for registration' });
//       }

//       const existe = await userService.findByEmailService(email);
//       if (existe) {
//         return res.status(409).json({ mensagem: 'Usuário já cadastrado.' });
//       }

//       const body = { name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr };
//       const user = await userService.createService(body);
//       if (!user) {
//         return res.status(400).send({ message: 'Error creating user' });
//       }
//       const token = await generateToken(user.id_usr);

//       res.status(201).send({
//         message: 'User created successfully',
//         token,
//       });
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
//   findAll: async (req, res) => {
//     try {
//       const users = await userService.findAllService();
//       if (users.length === 0) {
//         return res.status(400).send({ message: 'There are no registered users' });
//       }

//       res.send(users);
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
//   findById: async (req, res) => {
//     try {
//       const user = req.user;
//       res.send({ user });
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
//   update: async (req, res) => {
//     try {
//       upload(req, res, async (err) => {
//         if (err) {
//           return res.status(400).send({ message: err.message });
//         }

//         const { bio, avatar } = req.body;
//         const foto = req.file;

//         if (!bio && !avatar && !foto) {
//           return res.status(400).send({ message: 'Submit at least one field for update' });
//         }

//         if (bio && bio.length > 1000) {
//           return res.status(400).send({ message: 'Bio cannot exceed 1000 characters' });
//         }
//         if (avatar && avatar.length > 500000) {
//           return res.status(400).send({ message: 'Avatar image is too large (max 500KB)' });
//         }

//         const userId = req.user?.id_usr;
//         if (!userId) {
//           return res.status(401).send({ message: 'Unauthorized' });
//         }

//         const fotoPath = foto ? `/Uploads/${foto.filename}` : null; // Ajustado o caminho para /Uploads/<nome_do_arquivo>

//         await userService.updateService(userId, avatar, bio, fotoPath);
//         const user = await userService.findByIdService(userId);

//         res.send({
//           message: 'User successfully updated',
//           user: {
//             id_usr: user.id_usr,
//             nome_usr: user.nome_usr,
//             email_usr: user.email_usr,
//             cat_usr: user.cat_usr,
//             img: user.img_usr,
//             des_pfl: user.des_pfl, // Ajustado para acessar diretamente, sem user.Perfil
//             prf_pfl: user.prf_pfl, // Ajustado para acessar diretamente, sem user.Perfil
//             tipo: user.cat_usr === 1 ? 'adm' : 'aluno',
//           },
//         });
//       });
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
//   delete: async (req, res) => {
//     try {
//       const userId = req.user?.id_usr;
//       if (!userId) {
//         return res.status(401).send({ message: 'Unauthorized' });
//       }
//       await userService.deleteService(userId);
//       const user = await userService.findByIdService(userId);
//       res.send({ message: 'User successfully deleted', user });
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
//   delete1: async (req, res) => {
//     try {
//       const userId = req.user?.id_usr;
//       if (!userId) {
//         return res.status(401).send({ message: 'Unauthorized' });
//       }

//       await userService.deleteService1(userId);
//       res.send({ message: 'User successfully deleted' });
//     } catch (err) {
//       res.status(500).send({ message: err.message });
//     }
//   },
// };

// export default userController;