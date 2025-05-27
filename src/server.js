// mudar tudo para mysql com pg
import express from 'express';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import config from './config.js';
import cors from 'cors';
import syncDatabase from './database/sync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../front')));
app.use('/uploads', express.static(path.join(__dirname, '../front/Uploads')));

// Rotas da API
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Sincronizar o banco de dados
syncDatabase().then(() => {
  const port = process.env.PORT || config.port;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em 0.0.0.0:${port}`);
  });
});