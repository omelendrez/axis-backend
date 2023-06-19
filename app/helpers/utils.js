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

const routes = []

function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path)))
    )
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp)))
    )
  } else if (layer.method) {
    const endpoint = {
      method: layer.method.toUpperCase(),
      path: path.concat(split(layer.regexp)).filter(Boolean).join('/')
    }

    if (
      !routes.find(
        (e) => e.method === endpoint.method && e.path === endpoint.path
      )
    ) {
      routes.push(endpoint)
    }
  }
}

function split(thing) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing
      .toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}

function listEndpoints(app, filter = '') {
  app._router.stack.forEach(print.bind(null, []))
  routes
    .filter((r) => !filter || r.path.includes(filter))
    .forEach((r) => console.log(r))
}

module.exports = { toWeb, getPaginationFilters, loadModel, listEndpoints }
