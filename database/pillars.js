const pool = require('./pool');

const createPillar = async (name) => {
  const results = await pool.query('INSERT INTO pillars (name) VALUES($1) RETURNING *', [name]);
  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const getPillars = async () => {
  const results = await pool.query("SELECT * FROM pillars WHERE is_deleted=false ORDER BY created_at DESC", []);
  if (results.rows)
    return results.rows;
  else
    return [];
}
const updatePillarById = async (pillar_id, name) => {
	let	results = await pool.query(`UPDATE pillars SET name=$2 WHERE id=$1 RETURNING *`,
			[pillar_id, name]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const deletePillars = async (ids) => {
	const results = await pool.query('UPDATE pillars SET is_deleted=true WHERE id = ANY($1::uuid[]) RETURNING id', [ids]);

	return (results.rows && results.rows.length > 0) ? results.rows : [];
}
module.exports = {
  createPillar,
  getPillars,
  updatePillarById,
  deletePillars,
};