const db = require('../config/database');

const PROVINCE_SELECT = `
  SELECT
    p.id,
    p.name,
    p.code,
    p.is_active,
    COUNT(m.id)::int AS municipality_count
  FROM provinces p
  LEFT JOIN municipalities m ON m.province_id = p.id
`;

async function list() {
  const result = await db.query(
    `${PROVINCE_SELECT}
     GROUP BY p.id
     ORDER BY p.name ASC`
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `${PROVINCE_SELECT}
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  findById,
};
