function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const rawLimit = Number.parseInt(query.limit, 10) || 20;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

const SORT_COLUMNS = {
  created_at: 'a.created_at',
  name: 'a.name',
  purchase_cost: 'a.purchase_cost',
  asset_tag: 'a.asset_tag',
  purchase_date: 'a.purchase_date',
};

function parseSort(query = {}, allowed = SORT_COLUMNS, defaultColumn = 'created_at') {
  const requested = String(query.sort || defaultColumn).trim();
  const column = allowed[requested] ? requested : defaultColumn;
  const order = String(query.order || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return {
    column,
    sqlColumn: allowed[column],
    order,
  };
}

module.exports = {
  parsePagination,
  buildMeta,
  parseSort,
  SORT_COLUMNS,
};
