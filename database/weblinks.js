const pool = require('./pool');

const getWebLinksBySurvey = async (survey_id) => {
  const results = 
    await pool.query(`
      SELECT 
        *
      FROM
        weblinks 
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
//  SELECT COUNT(id) as count,max(weblink_link_id) from results WHERE is_completed=TRUE GROUP BY weblink_link_id

const getWebLinksCompletedResponses = async (survey_id) => {
  const results = 
    await pool.query(`
        SELECT COUNT(id) as count,max(weblink_link_id) as weblink
        FROM 
          results 
        WHERE 
          survey_id=$1 AND is_completed=TRUE
        GROUP BY 
          weblink_link_id
    `, [survey_id]);
    if(results.rows && results.rows.length >0){
      let resultsTemp={}
      for (let row of results.rows){
        if(row.weblink){
          resultsTemp[row.weblink]=row.count
        }
      }
      return resultsTemp;
    } 
    else{
      return [];
    }
      
}
const getWebLinksTotalResponses = async (survey_id) => {
  const results = 
    await pool.query(`
        SELECT COUNT(id) as count,max(weblink_link_id) as weblink
        FROM 
          results 
        WHERE 
          survey_id=$1
        GROUP BY 
          weblink_link_id
    `, [survey_id]);
    if(results.rows && results.rows.length >0){
      let resultsTemp={}
      for (let row of results.rows){
        if(row.weblink){
          resultsTemp[row.weblink]=row.count
        }
      }
      return resultsTemp;
    } 
    else{
      return [];
    }
      
}
const getWebLinkByLinkId = async (link_id) => {
  const results = 
    await pool.query(`SELECT * FROM weblinks WHERE link_id=$1 AND is_deleted=false`, [link_id]);

    if (results.rows && results.rows.length > 0)
      return results.rows[0];
    else
      return null;
}

const createWebLink = async (name, survey_id, user_id, link_id, close_quota, close_date, is_active, is_multiple) => {
  const results = 
    await pool.query(`
      INSERT INTO 
        weblinks
        (name, survey_id, user_id, link_id, close_quota, close_date, is_active, is_multiple)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`, [name, survey_id, user_id, link_id, close_quota, close_date, is_active, is_multiple]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

const deleteWebLink = async (weblink_id) => {
  const results = 
    await pool.query(`UPDATE weblinks SET is_deleted=true WHERE id = $1`, [weblink_id]);

  if (results.rowCount > 0)
    return weblink_id;
  else
    return null;
}

const updateWebLink = async (weblink_id, name, close_quota, close_date, is_active, is_multiple) => {
  const results = 
    await pool.query(`
    UPDATE 
      weblinks 
    SET 
      name=$2, close_quota=$3, close_date=$4, is_active=$5, is_multiple=$6
    WHERE 
      id=$1 
    RETURNING *`, [weblink_id, name, close_quota, close_date, is_active, is_multiple]);

  if (results.rows && results.rows.length > 0)
    return results.rows[0];
  else
    return null;
}

module.exports = {
  getWebLinksBySurvey,
  getWebLinkByLinkId,
  createWebLink,
  deleteWebLink,
  updateWebLink,
  getWebLinksCompletedResponses,
  getWebLinksTotalResponses
};