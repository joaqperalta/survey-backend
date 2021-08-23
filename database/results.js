const pool = require('./pool');

const getResultsBySurvey = async (survey_id) => {
  const results =
    await pool.query(`
      SELECT 
        *,
        CASE
          WHEN is_manual IS true THEN respondent_name
          WHEN (emaillink_link_id IS NOT null) THEN (SELECT CONCAT(first_name, ' ', last_name) FROM emaillinks_contacts WHERE emaillinks_contacts.id=results.emaillink_contact_id)
          WHEN (weblink_link_id IS NOT null) THEN respondent_name
          ELSE (SELECT name FROM users WHERE results.user_id=users.id) 
        END AS respondent_name
      FROM
        results 
      WHERE 
        survey_id=$1
      ORDER BY
        id DESC
    `, [survey_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows;
  else
    return [];
}

const getResultDatesBySurvey = async (survey_id) => {
  const results =
    await pool.query(`
      SELECT 
        created_at
      FROM
        results 
      WHERE 
        survey_id=$1
      ORDER BY
        id DESC
    `, [survey_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows.map(row =>row.created_at.toString());
  else
    return [];
}

const getResultDatesBySurveyCreator = async (creator_id) => {
  const results =
    await pool.query(`
    SELECT
       results.created_at
    FROM 
      results
      LEFT JOIN surveys
      ON results.survey_id = surveys.id
    WHERE 
      surveys.user_id=$1
    ORDER BY
      results.id DESC
    `, [creator_id]);
  console.log("myTotalResponses->>", results.rows)
  if (results.rows && results.rows.length > 0)
    return results.rows.map(row =>row.created_at.toString());
  else
    return [];
}

const getResultDates = async () => {
  const results =
    await pool.query(`
    SELECT
       results.created_at
    FROM 
      results
      LEFT JOIN surveys
      ON results.survey_id = surveys.id
    ORDER BY
      results.id DESC
    `);
  console.log("totalResponses->>", results.rows.length)
  if (results.rows && results.rows.length > 0)
    return results.rows.map(row =>row.created_at.toString());
  else
    return [];
}

const getCompletedResponsesBySurveyCreator = async (creator_id) => {
  const results =
    await pool.query(`
    SELECT
      count(results.id) as count
    FROM 
      results
      LEFT JOIN surveys
      ON results.survey_id = surveys.id
    WHERE 
      surveys.user_id=$1 AND is_completed=true
    `, [creator_id]);
    console.log("count->>", results.rows[0].count)
  if (results.rows && results.rows.length > 0)
    return results.rows[0].count;
  else
    return 0;
}

const getCompletedResponses = async () => {
  const results =
    await pool.query(`
    SELECT
      count(results.id) as count
    FROM 
      results
      LEFT JOIN surveys
      ON results.survey_id = surveys.id
    WHERE 
      is_completed=true
    `);
    console.log("completed responses->>", results.rows[0].count)
  if (results.rows && results.rows.length > 0)
    return results.rows[0].count;
  else
    return 0;
}

const getResultById = async (result_id) => {
  const results =
    await pool.query(`
    SELECT * FROM results WHERE id=$1
    `, [result_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else {
    return null;
  }
}

const getUncompletedResultBySurveyAndUser = async (survey_id, user_id) => {
  const results =
    await pool.query(`
      SELECT
        *
      FROM
        results
      WHERE
        survey_id=$1 AND user_id=$2 AND is_completed=false
    `, [survey_id, user_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else {
    return null;
  }
}

const getResultItemByWebLinkAndName = async (weblink_link_id, respondent_name, ip_address) => {
  const results =
    await pool.query(`
      SELECT
        *
      FROM
        results
      WHERE
        weblink_link_id=$1 AND respondent_name=$2 AND ip_address=$3 ORDER BY created_at DESC LIMIT(1)
    `, [weblink_link_id, respondent_name, ip_address]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else {
    return null;
  }
}

const postResult = async (
  survey_id,
  user_id,
  ip_address,
  json = {},
  time_spent = 0,
  is_completed = false,
  weblink_link_id = null,
  emaillink_link_id = null,
  emaillink_contact_id = null,
  respondent_name = null,
) => {
  const results =
    await pool.query(`
      INSERT INTO 
        results
        (json, survey_id, user_id, time_spent, ip_address, is_completed, weblink_link_id, emaillink_link_id, emaillink_contact_id, respondent_name)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`, [
        json, 
        survey_id, 
        user_id, 
        time_spent, 
        ip_address, 
        is_completed, 
        weblink_link_id, 
        emaillink_link_id,
        emaillink_contact_id,
        respondent_name
      ]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const postManualResult = async (result, survey_id, time_spent, ip_address, respondent_name) => {
  const results =
    await pool.query(`
      INSERT INTO 
        results
        (json, survey_id, time_spent, ip_address, respondent_name, is_completed, is_manual)
      VALUES
        ($1, $2, $3, $4, $5, true, true)
      RETURNING *
    `, [result, survey_id, time_spent, ip_address, respondent_name]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const updateResult = async (id, json, time_spent, ip_address, is_completed) => {
  const results =
    await pool.query(`
      UPDATE 
        results
      SET
        json=$2, time_spent=$3, ip_address=$4, is_completed=$5, updated_at=now()
      WHERE
        id=$1
      RETURNING *`, [id, json, time_spent, ip_address, is_completed]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const copyResultsBySurvey = async (old_survey_id, new_survey_id) => {
  const results = await pool.query(`
    INSERT INTO results (json, survey_id, user_id, time_spent, ip_address, is_completed, created_at, updated_at)
      SELECT json, $1, user_id, time_spent, ip_address, is_completed, created_at, updated_at
      FROM results AS old
      WHERE old.survey_id = $2
    RETURNING *
  `, [new_survey_id, old_survey_id]);
  if (results.rows && results.rows.length > 0)
    return results.rows;
  else
    return [];
}

const getIsMultiple = async (survey_id,weblink_link_id) => {
  const results = await pool.query(`
    SELECT is_multiple, close_quota FROM weblinks WHERE  survey_id=$1 AND link_id=$2
  `, [survey_id,weblink_link_id]);
  if (results.rows && results.rows.length >0){
    return results.rows[0];}
  else
   return [];
  
}

const getResponseCount = async (survey_id, weblink_link_id) => {
  const results = await pool.query(`
      SELECT COUNT(id) AS count FROM results WHERE survey_id=$1 AND weblink_link_id=$2
  `,[survey_id, weblink_link_id]);
  if(results.rows && results.rows.length>0){
    return results.rows[0].count
  }else{
    return [];
  }
}

const deleteResult = async (id) => {
  const results = await pool.query(`
      DELETE FROM results WHERE id=$1
  `, [id])
  if (results.rows && results.rows.length > 0) {
    return results.rows
  } else {
    return []
  }
}

module.exports = {
  getResultsBySurvey,
  getResultDatesBySurvey,
  getResultDatesBySurveyCreator,
  getCompletedResponsesBySurveyCreator,
  getResultById,
  getUncompletedResultBySurveyAndUser,
  getResultItemByWebLinkAndName,
  postResult,
  postManualResult,
  updateResult,
  copyResultsBySurvey,
  getIsMultiple,
  getResponseCount,
  getResultDates,
  getCompletedResponses,
  deleteResult
};