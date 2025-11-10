import pool from "../database/config.js";
const Curso = {
  findAll: async () => {
    const { rows } = await pool.query(`
    SELECT curso_id, nome, descricao
    FROM cursos
    ORDER BY criado_em DESC;
  `);
    return rows[0];
  },
  findById: async (id, userId) => {
    const { rows } = await pool.query(
      `SELECT 
            c.curso_id,
            c.nome AS nome_curso,
            m.modulo_id,
            m.nome AS nome_modulo,
            a.aula_id,
            a.nome AS nome_aula,
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
    return rows;
  },
};
export default Curso;