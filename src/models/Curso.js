import pool from "../database/config.js";

const Curso = {
  findAll: async () => {
    const { rows } = await pool.query(`
      SELECT curso_id, nome, descricao
      FROM cursos
      ORDER BY criado_em DESC;
    `);
    return rows;
  },

  findById: async (id, userId) => {
    const result = await pool.query(
      `SELECT 
          c.curso_id,
          c.nome AS nome_curso,
          c.descricao,


          m.modulo_id,
          m.nome AS nome_modulo,
          m.ordem AS ordem_modulo,

          a.aula_id,
          a.titulo AS nome_aula,
          a.ordem AS ordem_aula,

          COALESCE(pa.status = 'concluida', FALSE) AS aula_concluida,
          COALESCE(pc.progresso, 0) AS progresso

       FROM cursos c
       JOIN modulos m ON m.curso_id = c.curso_id
       JOIN aulas a ON a.modulo_id = m.modulo_id

       LEFT JOIN progresso_aluno pa 
            ON pa.aula_id = a.aula_id 
            AND pa.id_usr = $2

       LEFT JOIN progresso_curso pc 
            ON pc.curso_id = c.curso_id 
            AND pc.id_usr = $2

       WHERE c.curso_id = $1
       ORDER BY m.ordem, a.ordem;`,
      [id, userId]
    );

    return result;
  },

  concluirAula: async (aulaId, userId) => {
 // 1. Verifica se a aula existe
const aulaCheck = await pool.query('SELECT * FROM aula WHERE id = $1', [aulaId]);
if (!aulaCheck.rowCount) throw new Error('Aula não encontrada');

// 2. Insere ou atualiza o progresso do aluno
const result = await pool.query(`
  INSERT INTO progresso_aluno (id_usr, aula_id, status, atualizado_em)
  VALUES ($1, $2, 'concluida', NOW())
  ON CONFLICT (id_usr, aula_id)
  DO UPDATE SET status = 'concluida', atualizado_em = NOW()
  RETURNING *;
`, [userId, aulaId]);

console.log(result.rows); // <-- Confirma que a linha foi criada ou atualizada

if (!result.rowCount) throw new Error('Não foi possível concluir a aula');
return { message: 'Aula concluída com sucesso' };

    return { message: "Aula concluída com sucesso" };;
  },

  getAulaById: async (aulaId) => {
    const query = `
      SELECT 
        a.aula_id,
        a.titulo,
        a.descricao,
        a.conteudo,
        a.modulo_id,
        m.nome AS nome_modulo,
        c.curso_id,
        c.nome AS nome_curso
      FROM aulas a
      JOIN modulos m ON a.modulo_id = m.modulo_id
      JOIN cursos c ON m.curso_id = c.curso_id
      WHERE a.aula_id = $1
    `;
    const { rows } = await pool.query(query, [aulaId]);
    return rows[0];
  },
};

export default Curso;
