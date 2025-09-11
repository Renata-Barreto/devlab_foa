// src/services/ForumService.js
import Topico from '../models/Topico.js';
import Categoria from '../models/Categoria.js';
import Tag from '../models/Tag.js';
import Resposta from '../models/Resposta.js';
import RespostaReply from '../models/RespostaReply.js';
import pool from '../database/config.js';

class ForumService {
  static async getTopicoById(id, userId) {
    const topico = await Topico.findById(id, userId);
    if (!topico) throw new Error('Tópico não encontrado');
    await pool.query('UPDATE topicos SET views = views + 1 WHERE id = $1', [id]);
    return topico;
  }

  static async avaliarTopico(id, userId, rating) {
    if (!rating || rating < 1 || rating > 5) throw new Error('Avaliação inválida (1 a 5)');

    const topico = await Topico.findById(id, userId);
    if (!topico) throw new Error('Tópico não encontrado');

    await pool.query(
      `INSERT INTO avaliacoes (topico_id, user_id, rating) 
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT unique_avaliacao 
       DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP`,
      [id, userId, rating]
    );

    const { rows } = await pool.query(
      'SELECT AVG(rating)::FLOAT AS avg_rating, COUNT(*)::INTEGER AS count FROM avaliacoes WHERE topico_id = $1',
      [id]
    );

    const avgRating = parseFloat(rows[0].avg_rating) || 0;
    const ratingCount = parseInt(rows[0].count) || 0;

    await pool.query('UPDATE topicos SET rating = $1 WHERE id = $2', [avgRating, id]);

    return { message: 'Avaliação registrada com sucesso', rating: avgRating, rating_count: ratingCount };
  }

  static async getPosts(filtro) {
    return Topico.findAll(filtro);
  }

  static async getCategorias() {
    return Categoria.findAll();
  }

  static async getTags() {
    return Tag.findAll();
  }

  static async createTopico({ titulo, descricao, categoria_id, tags, user_id }) {
    if (!titulo || !descricao || !categoria_id || !user_id) {
      throw new Error('Campos obrigatórios faltando');
    }
    return Topico.create({ titulo, descricao, categoria_id, tags, user_id });
  }

  static async likeTopico(topico_id, user_id) {
    return Topico.like(topico_id, user_id);
  }

  static async createResposta({ topico_id, conteudo, user_id }) {
    return Resposta.create({ topico_id, conteudo, user_id });
  }

  static async likeResposta(resposta_id, user_id) {
    return Resposta.like(resposta_id, user_id);
  }

  static async createReply({ resposta_id, conteudo, user_id }) {
    return RespostaReply.create({ resposta_id, conteudo, user_id });
  }

  static async likeReply(reply_id, user_id) {
    return RespostaReply.like(reply_id, user_id);
  }
}

export default ForumService;
