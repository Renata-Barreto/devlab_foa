// src/models/Topico.js
import pool from '../database/config.js';

class Topico {
   static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM topicos WHERE id = $1', [id]);
    return rows[0];
  }

   static async incrementViews(id) {
    await pool.query('UPDATE topicos SET views = views + 1 WHERE id = $1', [id]);
  }

  static async insertOrUpdateAvaliacao(topicoId, userId, rating) {
    await pool.query(
      `INSERT INTO avaliacoes (topico_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT unique_avaliacao
       DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP`,
      [topicoId, userId, rating]
    );
  }

  static async getRatingStats(topicoId) {
    const { rows } = await pool.query(
      'SELECT AVG(rating)::FLOAT AS avg_rating, COUNT(*)::INTEGER AS count FROM avaliacoes WHERE topico_id = $1',
      [topicoId]
    );
    return { avgRating: parseFloat(rows[0].avg_rating) || 0, count: parseInt(rows[0].count) || 0 };
  }

  static async updateTopicoRating(topicoId, avgRating) {
    await pool.query('UPDATE topicos SET rating = $1 WHERE id = $2', [avgRating, topicoId]);
  }
  
  static async findAll(filtro = 'top') {
    let orderBy;
    switch (filtro) {
      case 'novo':
        orderBy = 'created_at DESC';
        break;
      case 'popular':
        orderBy = 'views DESC';
        break;
      case 'fechado':
        orderBy = 'status = \'fechado\' DESC, created_at DESC';
        break;
      default:
        orderBy = 'likes DESC';
    }

    try {
      const { rows } = await pool.query(`
        SELECT t.*, u.nome_usr AS user_nome, u.img_usr AS user_avatar, c.nome AS categoria_nome
        FROM topicos t
        JOIN dev_lab_usuarios u ON t.user_id = u.id_usr
        JOIN categorias c ON t.categoria_id = c.id
        WHERE t.ativo = true
        ORDER BY ${orderBy}
      `);
      const posts = await Promise.all(
        rows.map(async (row) => {
          const tagsQuery = await pool.query(
            'SELECT t.nome FROM tags t JOIN topico_tags tt ON t.id = tt.tag_id WHERE tt.topico_id = $1',
            [row.id]
          );
          return {
            id: row.id,
            user_id: row.user_id,
            user: { nome: row.user_nome, avatar: row.user_avatar },
            categoria: row.categoria_nome,
            titulo: row.titulo,
            descricao: row.descricao,
            views: row.views || 0,
            likes: row.likes || 0,
            comments: row.comments || 0,
            time: row.created_at,
            tags: tagsQuery.rows.map((tag) => tag.nome),
            ativo: row.ativo,
            status: row.status || 'aberto',
          };
        })
      );
      return posts;
    } catch (error) {
      console.error('Erro em Topico.findAll:', error);
      throw error;
    }
  }


  static async findById(id, userId) {
    try {
      console.log(`Iniciando Topico.findById para id: ${id}, userId: ${userId}`);
      const { rows } = await pool.query(`
        SELECT t.*, u.nome_usr AS user_nome, u.img_usr AS user_avatar, c.nome AS categoria_nome
        FROM topicos t
        JOIN dev_lab_usuarios u ON t.user_id = u.id_usr
        JOIN categorias c ON t.categoria_id = c.id
        WHERE t.id = $1 AND t.ativo = true
      `, [id]);
      console.log('Resultado da query principal:', rows);
      if (rows.length === 0) {
        console.log(`Tópico id ${id} não encontrado ou inativo`);
        return null;
      }
      const row = rows[0];
      console.log('Buscando tags para tópico id:', id);
      const tagsQuery = await pool.query(
        'SELECT t.nome FROM tags t JOIN topico_tags tt ON t.id = tt.tag_id WHERE tt.topico_id = $1',
        [id]
      );
      console.log('Tags encontradas:', tagsQuery.rows);
      console.log('Buscando respostas para tópico id:', id);
      const respostasQuery = await pool.query(
        'SELECT r.*, u.nome_usr AS user_nome, u.img_usr AS user_avatar FROM respostas r JOIN dev_lab_usuarios u ON r.user_id = u.id_usr WHERE r.topico_id = $1',
        [id]
      );
      console.log('Respostas encontradas:', respostasQuery.rows.length);
      const respostas = await Promise.all(
        respostasQuery.rows.map(async (resposta) => {
          console.log(`Buscando replies para resposta id: ${resposta.id}`);
          const repliesQuery = await pool.query(
            'SELECT re.*, u.nome_usr AS user_nome FROM replies re JOIN dev_lab_usuarios u ON re.user_id = u.id_usr WHERE re.resposta_id = $1',
            [resposta.id]
          );
          console.log(`Replies para resposta id ${resposta.id}:`, repliesQuery.rows);
          console.log(`Buscando likes para resposta id: ${resposta.id}`);
          let likes = 0;
          let liked = false;
          try {
            const likesQuery = await pool.query(
              'SELECT COUNT(*) as count FROM resposta_likes WHERE resposta_id = $1',
              [resposta.id]
            );
            likes = parseInt(likesQuery.rows[0].count) || 0;
            if (userId) {
              const userLikeQuery = await pool.query(
                'SELECT 1 FROM resposta_likes WHERE resposta_id = $1 AND user_id = $2',
                [resposta.id, userId]
              );
              liked = userLikeQuery.rows.length > 0;
            }
          } catch (err) {
            console.warn(`Erro ao buscar likes da resposta id ${resposta.id}:`, err.message);
          }
          return {
            ...resposta,
            user_nome: resposta.user_nome,
            user_avatar: resposta.user_avatar,
            likes,
            liked,
            replies: repliesQuery.rows,
          };
        })
      );
      console.log('Buscando likes para tópico id:', id);
      let likes = 0;
      let liked = false;
      try {
        const likesQuery = await pool.query(
          'SELECT COUNT(*) as count FROM topico_likes WHERE topico_id = $1',
          [id]
        );
        likes = parseInt(likesQuery.rows[0].count) || 0;
        if (userId) {
          const userLikeQuery = await pool.query(
            'SELECT 1 FROM topico_likes WHERE topico_id = $1 AND user_id = $2',
            [id, userId]
          );
          liked = userLikeQuery.rows.length > 0;
        }
      } catch (err) {
        console.warn(`Erro ao buscar likes do tópico id ${id}:`, err.message);
      }
      console.log('Buscando avaliações para tópico id:', id);
      let rating = 0;
      let rating_count = 0;
      let user_rating = 0;
      try {
        const ratingQuery = await pool.query(
          'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM avaliacoes WHERE topico_id = $1',
          [id]
        );
        rating = parseFloat(ratingQuery.rows[0].avg_rating) || 0;
        rating_count = parseInt(ratingQuery.rows[0].count) || 0;
        if (userId) {
          const userRatingQuery = await pool.query(
            'SELECT rating FROM avaliacoes WHERE topico_id = $1 AND user_id = $2',
            [id, userId]
          );
          user_rating = userRatingQuery.rows[0]?.rating || 0;
        }
      } catch (err) {
        console.warn(`Erro ao buscar avaliações do tópico id ${id}:`, err.message);
      }
      return {
        id: row.id,
        user_id: row.user_id,
        user: { nome: row.user_nome, avatar: row.user_avatar },
        categoria: row.categoria_nome,
        categoria_id: row.categoria_id,
        titulo: row.titulo,
        descricao: row.descricao,
        views: row.views || 0,
        likes,
        liked,
        comments: row.comments || 0,
        time: row.created_at,
        tags: tagsQuery.rows.map((tag) => tag.nome),
        ativo: row.ativo,
        status: row.status || 'aberto',
        rating,
        rating_count,
        user_rating,
        respostas,
      };
    } catch (error) {
      console.error(`Erro em Topico.findById (id: ${id}, userId: ${userId}):`, error.stack);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const { rows } = await pool.query(`
        SELECT t.*, u.nome_usr AS user_nome, u.img_usr AS user_avatar, c.nome AS categoria_nome
        FROM topicos t
        JOIN dev_lab_usuarios u ON t.user_id = u.id_usr
        JOIN categorias c ON t.categoria_id = c.id
        WHERE t.user_id = $1 AND t.ativo = true
        ORDER BY t.created_at DESC
      `, [userId]);
      const posts = await Promise.all(
        rows.map(async (row) => {
          const tagsQuery = await pool.query(
            'SELECT t.nome FROM tags t JOIN topico_tags tt ON t.id = tt.tag_id WHERE tt.topico_id = $1',
            [row.id]
          );
          return {
            id: row.id,
            user_id: row.user_id,
            user: { nome: row.user_nome, avatar: row.user_avatar },
            categoria: row.categoria_nome,
            titulo: row.titulo,
            descricao: row.descricao,
            views: row.views || 0,
            likes: row.likes || 0,
            comments: row.comments || 0,
            time: row.created_at,
            tags: tagsQuery.rows.map((tag) => tag.nome),
            ativo: row.ativo,
            status: row.status || 'aberto',
          };
        })
      );
      return posts;
    } catch (error) {
      console.error('Erro em Topico.findByUserId:', error);
      throw error;
    }
  }

  static async create({ user_id, categoria_id, titulo, descricao, tags }) {
  try {
    const result = await pool.query(
      'INSERT INTO topicos (user_id, categoria_id, titulo, descricao, ativo, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, categoria_id, titulo, descricao, true, 'aberto']
    );
    const topicoId = result.rows[0].id;

    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Buscar ou criar a tag
        let tagResult = await pool.query('SELECT id FROM tags WHERE nome = $1', [tagName]);
        let tagId;
        if (tagResult.rows.length === 0) {
          tagResult = await pool.query('INSERT INTO tags (nome) VALUES ($1) RETURNING id', [tagName]);
          tagId = tagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        // Associar a tag ao tópico
        await pool.query(
          'INSERT INTO topico_tags (topico_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [topicoId, tagId]
        );
      }
    }

    return { id: topicoId };
  } catch (error) {
    console.error('Erro em Topico.create:', error.message);
    throw error;
  }
}

  static async update(id, { titulo, descricao, categoria_id, tags, ativo, status }) {
    try {
      const updates = [];
      const values = [];
      let index = 1;

      if (titulo) {
        updates.push(`titulo = $${index++}`);
        values.push(titulo);
      }
      if (descricao) {
        updates.push(`descricao = $${index++}`);
        values.push(descricao);
      }
      if (categoria_id) {
        updates.push(`categoria_id = $${index++}`);
        values.push(categoria_id);
      }
      if (ativo !== undefined) {
        updates.push(`ativo = $${index++}`);
        values.push(ativo);
      }
      if (status) {
        updates.push(`status = $${index++}`);
        values.push(status);
      }

      if (updates.length > 0) {
        values.push(id);
        await pool.query(
          `UPDATE topicos SET ${updates.join(', ')} WHERE id = $${index}`,
          values
        );
      }

      if (tags && tags.length > 0) {
        await pool.query('DELETE FROM topico_tags WHERE topico_id = $1', [id]);
        for (const tagId of tags) {
          await pool.query(
            'INSERT INTO topico_tags (topico_id, tag_id) VALUES ($1, $2)',
            [id, tagId]
          );
        }
      }
    } catch (error) {
      console.error('Erro em Topico.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query('UPDATE topicos SET ativo = false WHERE id = $1', [id]);
    } catch (error) {
      console.error('Erro em Topico.delete:', error);
      throw error;
    }
  }
}

export default Topico;
