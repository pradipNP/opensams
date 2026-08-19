const statusRepository = require('../repositories/status.repository');

function toDto(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    colorCode: row.color_code,
    sortOrder: row.sort_order,
  };
}

async function listStatuses() {
  const rows = await statusRepository.list();
  return rows.map(toDto);
}

module.exports = {
  listStatuses,
};
