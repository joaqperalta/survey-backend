const pool = require('./pool');

const createSurvey = async (name, user_id, category_id) => {
  const results =
    await pool.query(`
      INSERT INTO 
        surveys
        (name, json, user_id, category_id)
      VALUES
        ($1, $2, $3, $4) 
      RETURNING *`, [name, {}, user_id, category_id]);

  if (results.rows && results.rows.length > 0) {
    const survey = results.rows[0];
    survey.responses = 0;
    survey.myresponses = 0;
    return survey;
  }
  else
    return null;
}

const getAllSurveys = async (user_id) => {
  const results = await pool.query(`
      SELECT
        *
        , CASE WHEN category_id IS NULL THEN '' ELSE (SELECT name FROM categories WHERE surveys.category_id=categories.id) END AS category
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id) AS responses
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.is_completed=TRUE) AS completedresponses
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.user_id=$1) AS myresponses
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.user_id=$1 AND results.is_completed=TRUE) AS completedmyresponses
        , (SELECT name FROM users WHERE surveys.user_id = users.id) AS creator_name
      FROM
        surveys 
      WHERE 
        is_deleted=false 
      ORDER BY 
        created_at DESC 
    `, [user_id]);
  if (results.rows)
    return results.rows;
  else
    return [];
}

const getMySurveys = async (user_id) => {
  const results = await pool.query(`
      SELECT
        *
        , CASE WHEN category_id IS NULL THEN '' ELSE (SELECT name FROM categories WHERE surveys.category_id=categories.id) END AS category
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id) AS responses
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.user_id=$1) AS myresponses
        , (SELECT name FROM users WHERE surveys.user_id = users.id) AS creator_name
      FROM
        surveys 
      WHERE 
        user_id=$1 AND is_deleted=false 
      ORDER BY 
        created_at DESC 
    `, [user_id]);
  if (results.rows)
    return results.rows;
  else
    return [];
}

const getSharedSurveys = async (user_id) => {
  const results = await pool.query(`
      SELECT
        *
        , CASE WHEN category_id IS NULL THEN '' ELSE (SELECT name FROM categories WHERE surveys.category_id=categories.id) END AS category
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id) AS responses
        , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.user_id=$1) AS myresponses
        , (SELECT name FROM users WHERE surveys.user_id=users.id) AS username
      FROM
        surveys 
      WHERE 
        is_share=true AND is_deleted=false 
      ORDER BY 
        created_at DESC 
    `, [user_id]);
  if (results.rows)
    return results.rows;
  else
    return [];
}

const getSurveyById = async (survey_id, user_id) => {
  const results = await pool.query(`
    SELECT 
      * 
      , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id) AS responses
      , (SELECT count(results.id) FROM results WHERE surveys.id = results.survey_id AND results.user_id=$2) AS myresponses
      , (SELECT count(reports.id) FROM reports WHERE surveys.id = reports.survey_id) AS reports
      , (SELECT count(weblinks.id) FROM weblinks WHERE surveys.id = weblinks.survey_id) AS weblinks
      , (SELECT count(emaillinks.id) FROM emaillinks WHERE surveys.id = emaillinks.survey_id) AS emaillinks
      , (SELECT AVG(results.time_spent) FROM results WHERE surveys.id = results.survey_id) AS average_time
    FROM surveys WHERE id=$1
    `, [survey_id, user_id]);
  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const getSurveyDatesByCreator = async (user_id) => {
  const results = await pool.query(`
    SELECT
      created_at
    FROM 
      surveys
    WHERE 
      surveys.user_id=$1
    ORDER BY
      id DESC
  `, [user_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows.map(row => row.created_at.toString());
  else
    return [];
}

const updateSurvey = async (survey_id, json) => {
  const results = await pool.query(`
    UPDATE surveys SET json = $1 WHERE id = $2 RETURNING *
  `, [json, survey_id]);
  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const deleteSurveys = async (surveys_ids) => {
  await pool.query('UPDATE surveys SET is_deleted=true WHERE id = ANY($1::int[])', [surveys_ids]);
}

const copySurveys = async (user_id, surveys_ids) => {
  const results = await pool.query(`
    INSERT INTO surveys (name, json, user_id)
      SELECT CONCAT(name, ' (COPY)'), json, $1
      FROM surveys AS old
      WHERE old.id = ANY($2::int[])
    RETURNING *
  `, [user_id, surveys_ids]);

  if (results.rows && results.rows.length > 0)
    return results.rows;
  else
    return [];
}

const shareSurvey = async (survey_id) => {
  const results = await pool.query(`
    UPDATE surveys SET is_share = NOT is_share WHERE id = $1 RETURNING id
  `, [survey_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const activeSurvey = async (survey_id) => {
  const results = await pool.query(`
    UPDATE surveys SET is_active = NOT is_active WHERE id = $1 RETURNING id
  `, [survey_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const setMutliResponsesSurvey = async (survey_id) => {
  const results = await pool.query(`
    UPDATE surveys SET is_multi_responses = NOT is_multi_responses WHERE id = $1 RETURNING id
  `, [survey_id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

module.exports = {
  createSurvey,
  getAllSurveys,
  getMySurveys,
  getSharedSurveys,
  getSurveyById,
  getSurveyDatesByCreator,
  updateSurvey,
  deleteSurveys,
  copySurveys,
  shareSurvey,
  activeSurvey,
  setMutliResponsesSurvey,
};