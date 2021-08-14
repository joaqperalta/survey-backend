const pool = require('./pool');


const getUserProfileById = async (user_id) => {
	const results = await pool.query(`
		SELECT * FROM users_profiles WHERE user_id=$1
	`, [user_id]);

	return (results.rows && results.rows.length > 0) ? results.rows[0] : {};
}

const updateUserProfileById = async (user_id, {location, birthday, gender, short_description, long_description}) => {
	const results = await pool.query(`
		INSERT INTO users_profiles (user_id, location, birthday, gender, short_description, long_description) 
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) DO UPDATE 
			SET location = $2, 
					birthday = $3,
					gender = $4,
					short_description = $5,
					long_description = $6
		RETURNING *
	`, [user_id, location, birthday, gender, short_description, long_description]);

	return (results.rows && results.rows.length > 0) ? results.rows[0] : null;
}

module.exports = {
	getUserProfileById,
	updateUserProfileById,
};