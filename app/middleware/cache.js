const NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 })

function getUrlFromRequest(req) {
  // const url = req.protocol + '://' + req.headers.host + req.originalUrl
  const url = req.originalUrl
  return url
}

function getModelFromUrl(req) {
  // model => "api/company"

  return req.originalUrl
    .split('?')[0]
    .split('/')
    .filter((u) => u)
    .filter((u, i) => i < 2)
    .join('/')
}

function get(req, res, next) {
  const url = getUrlFromRequest(req)

  const content = cache.get(url)
  if (content) {
    return res.status(200).send(content)
  }
  return next()
}

function set(req, res, next) {
  const url = getUrlFromRequest(req)
  cache.set(url, res.locals.data)
  return next()
}

async function del(req, res, next) {
  // cache.keys() => ["api/company?limit=100&search=spdc", "api/company/1234"]
  const model = getModelFromUrl(req)
  console.log({ model })
  console.log(cache.keys())
  try {
    for (const key of cache.keys()) {
      if (key.includes(model)) {
        console.log(key)
        await cache.del(key)
      }
    }
  } catch (error) {
    console.log(error)
  }
  console.log(cache.keys())

  return next()
}

module.exports = { get, set, del }
