const pool = require('./pool');
const format = require('pg-format');

const createEmailLinkContacts = async (rows) => {
  console.log("hello:", rows)
  if (rows.length > 0) {
    const results =
      await pool.query(format(`
      INSERT INTO emaillinks_contacts(link_id, email_address, first_name, last_name) VALUES %L RETURNING *
    `, rows), []);

    if (results.rows && results.rows.length > 0)
      return results.rows;
    else
      return [];
  }
  else return [];
}

const getEmailLinkContactsByLinkId = async (link_id) => {
  const results =
    await pool.query(`
      SELECT 
        *,
        (SELECT is_completed FROM results WHERE results.id=emaillinks_contacts.result_id) AS is_completed
      FROM 
        emaillinks_contacts 
      WHERE
        link_id=$1 
      ORDER BY
        id ASC
    `, [link_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows;
  else
    return [];
}

const getEmailLinkContactByLinkIdAndEmail = async (link_id, email) => {
  console.log("contact_data->>", link_id, email)
  const results =
    await pool.query(`
      SELECT
        *,
        (SELECT is_completed FROM results WHERE results.id=emaillinks_contacts.result_id) AS is_completed 
      FROM
        emaillinks_contacts
      WHERE
        link_id=$1 AND email_address=$2
    `, [link_id, email]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setContactStatus = async (id, status) => {
  const results =
    await pool.query(`
      UPDATE emaillinks_contacts SET status=$2 WHERE id=$1 RETURNING *
    `, [id, status ? 'sent' : 'failed']);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setResponded = async (id, is_responded) => {
  const results =
    await pool.query(`
      UPDATE emaillinks_contacts SET is_responded=$2 WHERE id=$1 RETURNING *
    `, [id, is_responded]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setEmailOpenById = async (id) => {
  const results =
    await pool.query(`
      UPDATE emaillinks_contacts SET is_open=true WHERE id=$1 RETURNING *
    `, [id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const checkIfContactExist = async (link_id, email_address) => {
  const results =
    await pool.query(`
      SELECT 
        *,
        (SELECT is_completed FROM results WHERE results.id=emaillinks_contacts.result_id) AS is_completed
      FROM 
        emaillinks_contacts 
      WHERE 
        link_id=$1 AND email_address=$2
    `, [link_id, email_address]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setResultOnEmailContact = async (id, result_id) => {
  const results =
    await pool.query(`
      UPDATE emaillinks_contacts SET result_id=$2, is_responded=true WHERE id=$1 RETURNING *
    `, [id, result_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const getEmailLinksCompletedResponses = async (survey_id) => {
  const results =
    await pool.query(`
        SELECT COUNT(id) as count,max(emaillink_link_id) as emailLink
        FROM 
          results 
        WHERE 
          survey_id=$1 AND is_completed=TRUE
        GROUP BY 
          emaillink_link_id
    `, [survey_id]);
  if (results.rows && results.rows.length > 0) {
    let resultsTemp = {}
    for (let row of results.rows) {
      if (row.emailLink) {
        resultsTemp[row.emailLink] = row.count
      }
    }
    return resultsTemp;
  }
  else {
    return [];
  }
}

const getEmailLinksTotalResponses = async (survey_id) => {
  const results =
    await pool.query(`
      SELECT COUNT(id) as count,max(emaillink_link_id) as emaillink
      FROM 
        results 
      WHERE 
        survey_id=$1
      GROUP BY 
        emaillink_link_id
  `, [survey_id]);
  if (results.rows && results.rows.length > 0) {
    let resultsTemp = {}
    for (let row of results.rows) {
      if (row.emaillink) {
        resultsTemp[row.emaillink] = row.count
      }
    }
    return resultsTemp;
  }
  else {
    return [];
  }
}

const addContactByLink_id = async (link_id, email, firstname, lastname) => {
  const results = await pool.query(`
      INSERT INTO emaillinks_contacts(link_id, email_address, first_name, last_name) VALUES ($1,$2,$3,$4) RETURNING *
  `, [link_id, email, firstname, lastname])
  if (results.rows && results.rows.length > 0) {

    return results.rows;
  }
  else {
    return [];
  }
}

const deleteConactByLink_idAndEmail = async (link_id, email) => {
  const results = await pool.query(`
      DELETE FROM emaillinks_contacts WHERE link_id=$1 AND email_address=$2
  `, [link_id, email])
  if (results.rows && results.rows.length > 0) {
    return results.rows
  } else {
    return []
  }
}

const updateContactByIdAndLink_id = async (id, link_id, email, firstname, lastname) => {
  const results = await pool.query(`
      UPDATE emaillinks_contacts 
      SET email_address=$1,first_name=$2, last_name=$3 WHERE id=$4 AND link_id=$5
  `, [email, firstname, lastname, id, link_id])
  if (results.rows && results.rows.length > 0) {
    return results.rows
  } else {
    return []
  }
}
module.exports = {
  createEmailLinkContacts,
  getEmailLinkContactsByLinkId,
  getEmailLinkContactByLinkIdAndEmail,
  setContactStatus,
  setResponded,
  setEmailOpenById,
  checkIfContactExist,
  setResultOnEmailContact,
  getEmailLinksCompletedResponses,
  getEmailLinksTotalResponses,
  addContactByLink_id,
  deleteConactByLink_idAndEmail,
  updateContactByIdAndLink_id
};