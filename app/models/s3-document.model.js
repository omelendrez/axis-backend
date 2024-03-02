const sql = require('./db')
const { loadModel, toWeb } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')

const S3Document = function (payload) {
  loadModel(payload, this)
}

S3Document.create = ({ file }, result) => {
  let query = 'SELECT COUNT(*) found FROM s3_document WHERE file=?;'

  sql.query(query, [file], (err, res) => {
    if (err) {
      sendError('S3Document.create', err)
      result(err, null)
      return
    }

    if (res[0].found > 0) {
      result({ kind: 'already_exists' }, null)
      return
    }

    query = 'INSERT INTO s3_document SET ?;'

    sql.query(query, [{ file }], (err, res) => {
      if (err) {
        sendError('S3Document.create', err)
        result(err, null)
        return
      }

      result(null, { id: res.insertId, message: 'S3 document added!' })
    })
  })
}

S3Document.update = (payload, result) => {
  const { file, status } = payload

  let query = 'UPDATE s3_document SET status = ? WHERE file = ?;'
  const params = [status, file]

  sql.query(query, params, (err) => {
    if (err) {
      sendError('S3Document.update', err)
      result(err, null)
      return
    }

    result(null, {
      file,
      message: 'S3 document updated successfully!'
    })
  })
}

S3Document.exists = (url, result) => {
  const filters = url.search
    .replace('?', '')
    .split('&')
    .map((s) => {
      const searches = s.split('=')
      return { field: searches[0], value: searches[1] }
    })

  let query = 'SELECT file FROM s3_document WHERE file = ?;'

  const params = filters.map((f) => f.value)

  sql.query(query, params, (err, res) => {
    if (err) {
      sendError('S3Document.exists', err)
      result(err, null)
      return
    }

    result(null, {
      exists: res.length ? true : false
    })
  })
}

S3Document.getAll = (url, result) => {
  const filters = url.search
    .replace('?', '')
    .split('&')
    .map((s) => {
      const searches = s.split('=')
      return { field: searches[0], value: searches[1] }
    })

  const conditions = []

  filters
    .filter(({ field }) => !!field)
    .forEach(({ field, value }) => {
      let condition = ''
      condition = `WHERE ${field}='${value}'`
      conditions.push(condition)
    })

  const query = `SELECT file, status, created, updated FROM s3_document ${conditions.join(
    ' '
  )} ORDER BY created DESC LIMIT 100;`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('S3Document.getAll', err)
      result(err, null)
      return
    }

    result(
      null,
      res.map((r) => toWeb(r))
    )
  })
}

S3Document.delete = (id, result) => {
  let query = 'DELETE s3_document WHERE file = ?;'
  const params = [id]

  sql.query(query, params, (err) => {
    if (err) {
      sendError('S3Document.delete', err)
      result(err, null)
      return
    }

    result(null, {
      id,
      message: 'S3 document deleted successfully!'
    })
  })
}

module.exports = S3Document
