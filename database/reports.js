const pool = require('./pool');

const getReportsBySurvey = async (survey_id) => {
  const results = 
    await pool.query(`
      SELECT 
        *,
        (SELECT name FROM users WHERE reports.user_id=users.id) as username
      FROM
        reports 
      WHERE 
        survey_id=$1 AND is_deleted=false
      ORDER BY
        id DESC
    `, [survey_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows;
    else
      return [];
}

const getReportById = async (report_id) => {
  const results = 
    await pool.query(`
      SELECT 
        *
      FROM
        reports
      WHERE 
        id=$1 AND is_deleted=false
    `, [report_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows[0];
    else
      return [];
}

const getReportByShareId = async (share_id) => {
  const results = 
    await pool.query(`
      SELECT 
        *
      FROM
        reports
      WHERE 
        share_id=$1 AND is_deleted=false
    `, [share_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows[0];
    else
      return [];
}

const createReport = async (name, survey_id, user_id, type, filter, sections) => {
  console.log("data->>", name, survey_id, user_id, type, filter, sections)
  const results = 
    await pool.query(`
      INSERT INTO 
        reports
        (name, survey_id, user_id, type, filter, sections)
      VALUES
        ($1, $2, $3, $4, $5, $6) 
      RETURNING *`, [name, survey_id, user_id, type, filter, sections]);

  if (results.rows && results.rows.length > 0) {
    const report = results.rows[0];
    const user = await pool.query(`SELECT name FROM users WHERE id=$1`, [report.user_id]);
    if (user.rows && user.rows.length > 0) {
      report.username = user.rows[0].name;
      return report;
    } else {
      return null;
    }
  }
  else
    return null;
}

const deleteReport = async (report_id) => {
  const results = 
    await pool.query(`UPDATE reports SET is_deleted=true WHERE id = $1`, [report_id]);

  if (results.rowCount > 0) {
    return report_id;
  }
  else
    return null;
}

const updateReportFilter = async (id, filter) => {
  const results = 
    await pool.query(`UPDATE reports SET filter=$2 WHERE id=$1 RETURNING *`, [id, filter]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const updateReportSections = async (id, sections) => {
  const results = 
    await pool.query(`UPDATE reports SET sections=$2 WHERE id=$1 RETURNING *`, [id, sections]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const resetReportShareLink = async (id) => {
  const results = 
    await pool.query(`UPDATE reports SET share_id=uuid_generate_v1() WHERE id=$1 RETURNING share_id`, [id]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

module.exports = {
  getReportsBySurvey,
  getReportById,
  getReportByShareId,
  createReport,
  deleteReport,
  updateReportFilter,
  updateReportSections,
  resetReportShareLink,
};