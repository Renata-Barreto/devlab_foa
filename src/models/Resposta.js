import pool from '../database/config.js';

class Resposta {
  static async findByTopicoId(topicoId) {
    const { rows } = await pool.query(`
      SELECT r.*, u.nome_usr AS user_nome
      FROM respostas r
      JOIN dev_lab_usuarios u ON r.user_id = u.id_usr
      WHERE r.topico_id = $1
    `, [topicoId]);
    return rows;
  }

  static async create({ topico_id, user_id, conteudo }) {
    const { rows } = await pool.query(
      'INSERT INTO respostas (topico_id, user_id, conteudo) VALUES ($1, $2, $3) RETURNING *',
      [topico_id, user_id, conteudo]
    );
    await pool.query('UPDATE topicos SET comments = comments + 1 WHERE id = $1', [topico_id]);
    return rows[0];
  }

  static async incrementLikes(id) {
    await pool.query('UPDATE respostas SET likes = likes + 1 WHERE id = $1', [id]);
  }
}

export default Resposta;