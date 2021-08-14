const pool = require('./pool');

const getEmailLinksBySurvey = async (survey_id) => {
  const results = 
    await pool.query(`
      SELECT 
        *
      FROM
        emaillinks 
      WHERE 
        survey_id=$1 AND is_deleted=false
      ORDER BY
        created_at ASC
    `, [survey_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows;
    else
      return [];
}

const getEmailLinkById = async (id) => {
  const results = 
    await pool.query(`
      SELECT 
        *
      FROM
        emaillinks 
      WHERE 
        id=$1 AND is_deleted=false
    `, [id]);

    if (results.rows && results.rows.length > 0)
      return results.rows[0];
    else
      return null;
}

const getEmailLinkByLinkId = async (link_id) => {
  const results = 
    await pool.query(`SELECT * FROM emaillinks WHERE link_id=$1 AND is_deleted=false`, [link_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows[0];
    else
      return null;
}

const createEmailLink = async (name, survey_id, user_id, link_id, email_content, sender_name, sender_email, close_quota, close_date, contacts_file) => {
  const results = 
    await pool.query(`
      INSERT INTO 
        emaillinks
        (name, survey_id, user_id, link_id, email_content, sender_name, sender_email, close_quota, close_date, contacts_file)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`, [name, survey_id, user_id, link_id, email_content, sender_name, sender_email, close_quota, close_date, contacts_file]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const deleteEmailLink = async (emaillink_id) => {
  const results = 
    await pool.query(`UPDATE emaillinks SET is_deleted=true WHERE id = $1`, [emaillink_id]);

  if (results.rowCount > 0)
    return emaillink_id;
  else
    return null;
}

const updateEmailLink = async (emaillink_id, name, email_content, sender_name, sender_email, close_quota, close_date) => {
  const results = 
    await pool.query(`
    UPDATE 
      emaillinks 
    SET 
      name=$2, email_content=$3, sender_name=$4, sender_email=$5, close_quota=$6, close_date=$7
    WHERE 
      id=$1 
    RETURNING *`, [emaillink_id, name, email_content, sender_name, sender_email, close_quota, close_date]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setSendingFlag = async (emaillink_id, is_sent) => {
  const results = 
    await pool.query(`UPDATE emaillinks SET is_sent=$2 WHERE id=$1 RETURNING *`, [emaillink_id, is_sent]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

module.exports = {
  getEmailLinksBySurvey,
  getEmailLinkById,
  getEmailLinkByLinkId,
  createEmailLink,
  deleteEmailLink,
  updateEmailLink,
  setSendingFlag
};