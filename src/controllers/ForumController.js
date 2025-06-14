// src/controllers/ForumController.js
import Topico from '../models/Topico.js';
import Categoria from '../models/Categoria.js';
import Tag from '../models/Tag.js';
import Resposta from '../models/Resposta.js';
import RespostaReply from '../models/RespostaReply.js';
import pool from '../database/config.js';

class ForumController {

  // src/controllers/ForumController.js (trecho relevante)
static async getTopicoById(req, res) {
    const { id } = req.params;
    try {
      console.log('Buscando tópico ID:', id, 'para usuário:', req.user?.id_usr);
      const topico = await Topico.findById(id, req.user?.id_usr);
      if (!topico) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      await pool.query('UPDATE topicos SET views = views + 1 WHERE id = $1', [id]);
      res.json(topico);
    } catch (error) {
      console.error('Erro ao carregar tópico:', error.stack);
      res.status(500).json({ error: 'Erro ao carregar tópico', details: error.message });
    }
  }

  static async avaliarTopico(req, res) {
  const { id } = req.params;
  const { rating } = req.body;
  const user_id = req.user.id_usr; // Alinhado com authMiddleware.js
  console.log(`Avaliando tópico ID: ${id} pelo usuário ID: ${user_id} com rating: ${rating}`);
  try {
    if (!rating || rating < 1 || rating > 5) {
      console.log(`Avaliação inválida: ${rating}`);
      return res.status(400).json({ error: 'Avaliação inválida (1 a 5)' });
    }

    const topico = await Topico.findById(id, user_id);
    if (!topico) {
      console.log(`Tópico ID: ${id} não encontrado`);
      return res.status(404).json({ error: 'Tópico não encontrado' });
    }

    // Inserir ou atualizar a avaliação
    await pool.query(
      'INSERT INTO avaliacoes (topico_id, user_id, rating) VALUES ($1, $2, $3) ' +
      'ON CONFLICT ON CONSTRAINT unique_avaliacao DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP',
      [id, user_id, rating]
    );
    console.log(`Avaliação registrada para tópico ID: ${id}, usuário ID: ${user_id}`);

    // Calcular média e contagem de avaliações
    const { rows } = await pool.query(
      'SELECT AVG(rating)::FLOAT AS avg_rating, COUNT(*)::INTEGER AS count ' +
      'FROM avaliacoes WHERE topico_id = $1',
      [id]
    );
    const avgRating = parseFloat(rows[0].avg_rating) || 0;
    const ratingCount = parseInt(rows[0].count) || 0;
    console.log(`Média calculada: ${avgRating}, Contagem: ${ratingCount}`);

    // Atualizar o rating no tópico
    await pool.query(
      'UPDATE topicos SET rating = $1 WHERE id = $2',
      [avgRating, id]
    );
    console.log(`Tópico ID: ${id} atualizado com rating: ${avgRating}`);

    res.json({
      message: 'Avaliação registrada',
      rating: avgRating,
      rating_count: ratingCount
    });
  } catch (error) {
    console.error(`Erro ao avaliar tópico ID: ${id}:`, error.message, error.stack);
    res.status(500).json({ error: 'Erro ao avaliar tópico', details: error.message });
  }
}
  // static async avaliarTopico(req, res) {
  //   const { id } = req.params;
  //   const { rating } = req.body;
  //   if (!rating || rating < 1 || rating > 5) {
  //     return res.status(400).json({ error: 'Avaliação inválida (1 a 5)' });
  //   }
  //   try {
  //     const topico = await Topico.findById(id, req.user.id);
  //     if (!topico) {
  //       return res.status(404).json({ error: 'Tópico não encontrado' });
  //     }
  //     await pool.query(
  //       'INSERT INTO avaliacoes (topico_id, user_id, rating) VALUES ($1, $2, $3) ON CONFLICT (topico_id, user_id) DO UPDATE SET rating = $3',
  //       [id, req.user.id, rating]
  //     );
  //     const { rows } = await pool.query(
  //       'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM avaliacoes WHERE topico_id = $1',
  //       [id]
  //     );
  //     const avgRating = parseFloat(rows[0].avg_rating) || 0;
  //     const ratingCount = parseInt(rows[0].count) || 0;
  //     await pool.query('UPDATE topicos SET rating = $1 WHERE id = $2', [avgRating, id]);
  //     res.json({ message: 'Avaliação registrada', rating: avgRating, rating_count: ratingCount });
  //   } catch (error) {
  //     console.error('Erro ao avaliar tópico:', error);
  //     res.status(500).json({ error: 'Erro ao avaliar tópico', details: error.message });
  //   }
  // }

  static async getPosts(req, res) {
    const { filtro } = req.query;
    console.log('Requisição recebida em /api/posts com filtro:', filtro);
    try {
      const posts = await Topico.findAll(filtro);
      res.json(posts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      res.status(500).json({ error: 'Erro ao carregar posts', details: error.message });
    }
  }

  static async createTopico(req, res) {
  const { titulo, descricao, categoria_id, tags } = req.body;
  const user_id = req.user.id_usr; // Alinhado com authMiddleware.js
  console.log('Requisição recebida em /api/topicos:', { titulo, descricao, categoria_id, tags, user_id });
  try {
    if (!titulo || !descricao || !categoria_id || !user_id) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    const topico = await Topico.create({ user_id, categoria_id, titulo, descricao, tags });
    res.status(201).json({ id: topico.id });
  } catch (error) {
    console.error('Erro ao criar tópico:', error.message);
    res.status(500).json({ error: 'Erro ao criar tópico', details: error.message });
  }
}
//   static async createTopico(req, res) {
//   const { titulo, descricao, categoria_id, tags } = req.body;
//   const user_id = req.user.id;
//   console.log('Requisição recebida em /api/topicos:', { titulo, descricao, categoria_id, tags, user_id });
//   try {
//     if (!titulo || !descricao || !categoria_id) {
//       return res.status(400).json({ error: 'Campos obrigatórios faltando' });
//     }
//     const topico = await Topico.create({ user_id, categoria_id, titulo, descricao, tags });
//     res.status(201).json({ id: topico.id });
//   } catch (error) {
//     console.error('Erro ao criar tópico:', error.message);
//     res.status(500).json({ error: 'Erro ao criar tópico', details: error.message });
//   }
// }

  // static async createTopico(req, res) {
  //   const { titulo, descricao, categoria_id, tags, user_id } = req.body;
  //   console.log('Requisição recebida em /api/topicos:', { titulo, descricao, categoria_id, tags, user_id });
  //   try {
  //     if (!titulo || !descricao || !categoria_id || !user_id) {
  //       return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  //     }
  //     const topico = await Topico.create({ user_id, categoria_id, titulo, descricao, tags });
  //     res.status(201).json({ id: topico.id });
  //   } catch (error) {
  //     console.error('Erro ao criar tópico:', error);
  //     res.status(500).json({ error: 'Erro ao criar tópico', details: error.message });
  //   }
  // }

  static async getMeusTopicos(req, res) {
    try {
      const topicos = await Topico.findByUserId(req.user.id);
      res.json(topicos);
    } catch (error) {
      console.error('Erro ao carregar tópicos do usuário:', error);
      res.status(500).json({ error: 'Erro ao carregar tópicos', details: error.message });
    }
  }

  static async desativarTopico(req, res) {
    const { id } = req.params;
    try {
      const topico = await Topico.findById(id, req.user.id);
      if (!topico) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      if (topico.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await Topico.update(id, { ativo: false });
      res.json({ message: 'Tópico desativado com sucesso' });
    } catch (error) {
      console.error('Erro ao desativar tópico:', error);
      res.status(500).json({ error: 'Erro ao desativar tópico', details: error.message });
    }
  }

  static async fecharTopico(req, res) {
    const { id } = req.params;
    try {
      const topico = await Topico.findById(id, req.user.id);
      if (!topico) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      if (topico.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await Topico.update(id, { status: 'fechado' });
      res.json({ message: 'Tópico fechado com sucesso' });
    } catch (error) {
      console.error('Erro ao fechar tópico:', error);
      res.status(500).json({ error: 'Erro ao fechar tópico', details: error.message });
    }
  }

  static async editarTopico(req, res) {
    const { id } = req.params;
    const { titulo, descricao, categoria_id, tags } = req.body;
    try {
      const topico = await Topico.findById(id, req.user.id);
      if (!topico) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      if (topico.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await Topico.update(id, { titulo, descricao, categoria_id, tags });
      res.json({ message: 'Tópico editado com sucesso' });
    } catch (error) {
      console.error('Erro ao editar tópico:', error);
      res.status(500).json({ error: 'Erro ao editar tópico', details: error.message });
    }
  }

  static async excluirTopico(req, res) {
    const { id } = req.params;
    try {
      const topico = await Topico.findById(id, req.user.id);
      if (!topico) {
        return res.status(404).json({ error: 'Tópico não encontrado' });
      }
      if (topico.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      await Topico.delete(id);
      res.json({ message: 'Tópico excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir tópico:', error);
      res.status(500).json({ error: 'Erro ao excluir tópico', details: error.message });
    }
  }

  static async getCategorias(req, res) {
    try {
      const categorias = await Categoria.findAll();
      res.json(categorias);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      res.status(500).json({ error: 'Erro ao carregar categorias', details: error.message });
    }
  }

  static async getTags(req, res) {
    try {
      const tags = await Tag.findAll();
      res.json(tags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      res.status(500).json({ error: 'Erro ao carregar tags', details: error.message });
    }
  }

  static async createResposta(req, res) {
    const { topico_id, conteudo } = req.body;
    const user_id = req.user.id;
    try {
      const resposta = await Resposta.create({ topico_id, user_id, conteudo });
      res.status(201).json(resposta);
    } catch (error) {
      console.error('Erro ao criar resposta:', error);
      res.status(500).json({ error: 'Erro ao criar resposta', details: error.message });
    }
  }

  static async createReply(req, res) {
    const { resposta_id, conteudo } = req.body;
    const user_id = req.user.id;
    try {
      const reply = await RespostaReply.create({ resposta_id, user_id, conteudo });
      res.status(201).json(reply);
    } catch (error) {
      console.error('Erro ao criar reply:', error);
      res.status(500).json({ error: 'Erro ao criar reply', details: error.message });
    }
  }

  static async likeTopico(req, res) {
    const { id } = req.params;
    try {
      const user_id = req.user.id;
      await pool.query(
        'INSERT INTO topico_likes (topico_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, user_id]
      );
      const { rows } = await pool.query(
        'SELECT COUNT(*) as count FROM topico_likes WHERE topico_id = $1',
        [id]
      );
      await pool.query('UPDATE topicos SET likes = $1 WHERE id = $2', [rows[0].count, id]);
      res.status(200).json({ message: 'Like adicionado', likes: parseInt(rows[0].count) });
    } catch (error) {
      console.error('Erro ao curtir tópico:', error);
      res.status(500).json({ error: 'Erro ao curtir tópico', details: error.message });
    }
  }

  static async likeResposta(req, res) {
    const { id } = req.params;
    try {
      const user_id = req.user.id;
      await pool.query(
        'INSERT INTO resposta_likes (resposta_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, user_id]
      );
      const { rows } = await pool.query(
        'SELECT COUNT(*) as count FROM resposta_likes WHERE resposta_id = $1',
        [id]
      );
      await pool.query('UPDATE respostas SET likes = $1 WHERE id = $2', [rows[0].count, id]);
      res.status(200).json({ message: 'Like adicionado', likes: parseInt(rows[0].count) });
    } catch (error) {
      console.error('Erro ao curtir resposta:', error);
      res.status(500).json({ error: 'Erro ao curtir resposta', details: error.message });
    }
  }
}

export default ForumController;