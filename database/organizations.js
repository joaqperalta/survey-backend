const pool = require('./pool');

const getOrganizations = async () => {
	const results = await pool.query(`
        SELECT 
            * 
            , (SELECT count(users.id) FROM users WHERE users.organization_id = organizations.id) AS users
        FROM organizations 
        WHERE is_deleted=false
        ORDER BY created_at DESC 
    `, []);

	return results.rows;
}

const createOrganization = async (name) => {
	var results = await pool.query('SELECT * FROM organizations WHERE name=$1', [name]);
	if (results.rows.length > 0) {
		return { success: false };
	} else {
		const results = await pool.query(`INSERT INTO organizations(name) VALUES ($1) RETURNING *`, [name]);
		return { success: true, organization: results.rows[0] };
	}
}

const deleteOrganizations = async (ids) => {
	const results = await pool.query('UPDATE organizations SET is_deleted=true WHERE id = ANY($1::int[]) RETURNING id', [ids]);

	if (results.rows && results.rows.length > 0)
		return results.rows;
	else
		return [];
}


module.exports = {
	getOrganizations,
	createOrganization,
	deleteOrganizations,
};