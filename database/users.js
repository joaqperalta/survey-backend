const pool = require('./pool');

const signInWithEmailAndPassword = async (email, password) => {
	const results = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, password]);
	return results.rows;
}

const createUserWithEmailAndPassword = async (name, email, password, role = 1,) => {
	var results = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
	if (results.rows.length > 0) {
		return { success: false };
	} else {
		results = await pool.query('INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, password, role]);
		return { success: true, rows: results.rows };
	}
}

const getUserByEmail = async (email) => {
	const res = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
	if (res.rows && res.rows.length > 0)
		return res.rows[0];
	else
		return null;
}

const getUserById = async (user_id) => {
	const res = await pool.query('SELECT * FROM users WHERE id=$1', [user_id]);
	if (res.rows && res.rows.length > 0)
		return res.rows[0];
	else
		return null;
}

const getUsersWithFilter = async (pageSize, currentPage, orderBy, search) => {
	const results = await pool.query(`
				SELECT 
					* 
					, (SELECT name FROM organizations WHERE organizations.id=users.organization_id) as organization_name
        FROM users 
        WHERE POSITION($1 in LOWER(name)) > 0 AND is_deleted=false
        ORDER BY ${orderBy} ASC 
        LIMIT $2 OFFSET $3
    `, [search, pageSize, pageSize * (currentPage - 1)]);
	return results.rows;
}

const getResearcher = async () => {
	const results = await pool.query(`
			SELECT * FROM users WHERE is_deleted=false AND role=3
	`);
	let result = []
	let index = 0
	results.rows.forEach(user => {

		result.push({ label: user.name, value: user.name })
		index++
	})
	return result;
}

const getCountOfUsers = async (search) => {
	const results = await pool.query(`
        SELECT count(id) as count FROM users WHERE POSITION($1 in LOWER(name)) > 0 AND is_deleted=false
    `, [search]);
	if (results.rows && results.rows.length > 0)
		return results.rows[0].count;
	else
		return 0;
}

const resetPassword = async (email, newPassword) => {
	const results = await pool.query(`
		UPDATE users SET password=$2 WHERE email=$1 RETURNING *
	`, [email, newPassword]);

	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const updateUserNameById = async (user_id, name) => {
	const results = await pool.query(`UPDATE users SET name=$2 WHERE id=$1 RETURNING *`, [user_id, name]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const updateUserById = async (user_id, name, email, role, organization_id) => {
	let results = [];
	if (organization_id)
		results = await pool.query(`UPDATE users SET name=$2, email=$3, role=$4, organization_id=$5 WHERE id=$1 RETURNING *`,
			[user_id, name, email, role, 0]);
	else
		results = await pool.query(`UPDATE users SET name=$2, email=$3, role=$4 WHERE id=$1 RETURNING *`,
			[user_id, name, email, role]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const updateUserPasswordById = async (user_id, password) => {
	const results = await pool.query(`UPDATE users SET password=$2 WHERE id=$1 RETURNING *`, [user_id, password]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const updateUserPermission = async (user_id, method) => {
	const results = await pool.query(`UPDATE users SET ${method} = NOT ${method} WHERE id=$1 RETURNING *`, [user_id]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const updateUserOrganization = async (user_id, organization_id) => {
	const results = await pool.query(`
		UPDATE
			users
		SET
			organization_id = 
				case (SELECT count(id) FROM organizations WHERE organizations.id=$2)
					WHEN 1 then $2
				END
		WHERE
			id=$1
		RETURNING
			id, organization_id, (SELECT name FROM organizations WHERE id=$2) as organization_name
		`, [user_id, organization_id]);

	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const activateUser = async (user_id, is_active) => {
	const results = await pool.query(`UPDATE users SET is_active = NOT is_active WHERE id=$1 RETURNING *`, [user_id]);
	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

const deleteUsers = async (ids) => {
	const results = await pool.query('UPDATE users SET is_deleted=true WHERE id = ANY($1::uuid[]) RETURNING id', [ids]);

	return (results.rows && results.rows.length > 0) ? results.rows : [];
}

module.exports = {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	getUserByEmail,
	getUserById,
	getUsersWithFilter,
	getCountOfUsers,
	resetPassword,
	updateUserNameById,
	updateUserPasswordById,
	updateUserPermission,
	updateUserOrganization,
	activateUser,
	deleteUsers,
	getResearcher,
	updateUserById
};