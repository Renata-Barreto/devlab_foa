// src/controllers/ForumController.js
import ForumService from '../services/forum.service.js';

class ForumController {
  static async getTopicoById(req, res) {
    try {
      const topico = await ForumService.getTopicoById(req.params.id, req.user?.id_usr);
      res.json(topico);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async avaliarTopico(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      const user_id = req.user.id_usr;
      const result = await ForumService.avaliarTopico(id, user_id, rating);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPosts(req, res) {
    try {
      const posts = await ForumService.getPosts(req.query.filtro);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategorias(req, res) {
    try {
      const categorias = await ForumService.getCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTags(req, res) {
    try {
      const tags = await ForumService.getTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTopico(req, res) {
    try {
      const { titulo, descricao, categoria_id, tags } = req.body;
      const user_id = req.user.id_usr;
      const topico = await ForumService.createTopico({ titulo, descricao, categoria_id, tags, user_id });
      res.status(201).json(topico);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async likeTopico(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id_usr;
      const result = await ForumService.likeTopico(id, user_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createResposta(req, res) {
    try {
      const { topico_id, conteudo } = req.body;
      const user_id = req.user.id_usr;
      const resposta = await ForumService.createResposta({ topico_id, conteudo, user_id });
      res.status(201).json(resposta);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async likeResposta(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id_usr;
      const result = await ForumService.likeResposta(id, user_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createReply(req, res) {
    try {
      const { resposta_id, conteudo } = req.body;
      const user_id = req.user.id_usr;
      const reply = await ForumService.createReply({ resposta_id, conteudo, user_id });
      res.status(201).json(reply);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async likeReply(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id_usr;
      const result = await ForumService.likeReply(id, user_id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ForumController;
