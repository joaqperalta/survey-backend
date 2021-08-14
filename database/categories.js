const pool = require('./pool');

const createCategory = async (name, user_id) => {
  const results = await pool.query('INSERT INTO categories (name, user_id) VALUES($1, $2) RETURNING *', [name, user_id]);
  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const getMyCategories = async (user_id) => {
  const results = await pool.query("\
      SELECT \
        * \
      FROM \
        categories \
      WHERE \
        user_id=$1 \
      ORDER BY \
        created_at ASC \
    ", [user_id]);
  if (results.rows)
    return results.rows;
  else
    return [];
}

const deleteCategory = async (id, user_id) => {
  const results = await pool.query("UPDATE categories SET is_deleted='t' WHERE id=$1 RETURNING *", [id]);
  if(results.rows && results.rows.length > 0)
    return results.rows[0]
  else 
    return null;
}

const updateCategory = async (id, name) => {
  const results = await pool.query("UPDATE categories SET name=$1 WHERE id=$2 RETURNING *", [name,id]);
  if(results.rows && results.rows.length >0)
    return results.rows[0]
  else 
    return null
}

module.exports = {
  createCategory,
  getMyCategories,
  deleteCategory,
  updateCategory
};