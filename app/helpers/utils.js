const toWeb = (data) => {
  const exclude = ['password', 'new_password']

  const newData = {}

  Object.entries(data).forEach(([field, value]) => {
    if (!exclude.includes(field)) {
      newData[field] = value
    }
  })

  return newData
}

const getPaginationFilters = (pagination, fields, filterField = '') => {
  const { search, limit, offset } = pagination
  let filter = ''
  if (search) {
    filter =
      fields.length > 1
        ? `WHERE CONCAT(${fields.join('," ",')}) LIKE '%${search.trim()}%'`
        : `WHERE ${fields[0]} LIKE '%${search.trim()}%'`
    if (filterField) {
      filter += ` AND ${filterField}`
    }
  } else {
    if (filterField) {
      filter = `WHERE ${filterField}`
    }
  }

  let limits = ''

  if (limit) {
    limits += `LIMIT ${limit} `
  }

  if (offset) {
    limits += `OFFSET ${offset} `
  }

  return { filter, limits }
}

const loadModel = (payload, object) =>
  Object.keys(payload).forEach((key) => (object[key] = payload[key]))

module.exports = { toWeb, getPaginationFilters, loadModel }
