const pool = require('./pool');

const createPillar = async (name) => {
  const results = await pool.query('INSERT INTO pillars (name) VALUES($1) RETURNING *', [name]);
  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const getPillars = async () => {
  const results = await pool.query("SELECT * FROM pillars ORDER BY created_at DESC", []);
  if (results.rows)
    return results.rows;
  else
    return [];
}

module.exports = {
  createPillar,
  getPillars,
};