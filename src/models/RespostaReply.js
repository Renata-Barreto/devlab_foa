import pool from '../database/config.js';

class RespostaReply {
  static async findByRespostaId(respostaId) {
    const { rows } = await pool.query(`
      SELECT rr.*, u.nome_usr AS user_nome
      FROM respostas_replies rr
      JOIN dev_lab_usuarios u ON rr.user_id = u.id_usr
      WHERE rr.resposta_id = $1
    `, [respostaId]);
    return rows;
  }

  static async create({ resposta_id, user_id, conteudo }) {
    const { rows } = await pool.query(
      'INSERT INTO respostas_replies (resposta_id, user_id, conteudo) VALUES ($1, $2, $3) RETURNING *',
      [resposta_id, user_id, conteudo]
    );
    return rows[0];
  }
}

export default RespostaReply;