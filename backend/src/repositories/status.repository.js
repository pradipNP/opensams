const db = require('../config/database');

async function list() {
  const result = await db.query(
    `SELECT
        id,
        name,
        slug,
        color_code,
        sort_order
     FROM asset_statuses
     ORDER BY sort_order ASC, name ASC`
  );
  return result.rows;
}

module.exports = {
  list,
};
