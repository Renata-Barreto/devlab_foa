// src/services/ForumService.js
import Topico from '../models/Topico.js';
import Categoria from '../models/Categoria.js';
import Tag from '../models/Tag.js';
import Resposta from '../models/Resposta.js';
import RespostaReply from '../models/RespostaReply.js';

class ForumService {
  static async getTopicoById(id) {
    const topico = await Topico.findById(id);
    if (!topico) throw new Error('Tópico não encontrado');

    await Topico.incrementViews(id);

    return topico;
  }

 static async avaliarTopico(id, userId, rating) {
    if (!rating || rating < 1 || rating > 5) throw new Error('Avaliação inválida (1 a 5)');

    const topico = await TopicoRepository.findById(id, userId);
    if (!topico) throw new Error('Tópico não encontrado');

    await TopicoRepository.insertOrUpdateAvaliacao(id, userId, rating);

    const { avgRating, count } = await TopicoRepository.getRatingStats(id);

    await TopicoRepository.updateTopicoRating(id, avgRating);

    return { message: 'Avaliação registrada com sucesso', rating: avgRating, rating_count: count };
  }

  static async getPosts(filtro, page = 1, limit = 10, categoriaId = null) {
  return Topico.findAll(filtro, page, limit,categoriaId);
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
  static async deleteTopico(id) {
    const topico = await Topico.findById(id);
    if (!topico) throw new Error('Tópico não encontrado');
  }
}

export default ForumService;
