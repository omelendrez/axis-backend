const sql = require('./db')
const { toWeb, getPaginationFilters, loadModel } = require('../helpers/utils')
const { log } = require('../helpers/log')
const { sendError } = require('../errors/error-monitoring')
// constructor
const Title = function (payload) {
  loadModel(payload, this)
}

Title.getAll = (pagination, result) => {
  const fields = ['name']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `SELECT id, name FROM title ${filter} ORDER BY name ${limits};`
  const queryCount = `SELECT COUNT(1) records FROM title ${filter};`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
      sendError('Title.getAll', err)
      log.error(err)
      result(err, null)
      return
    }

    const records = res[0]
    const count = res[1][0].records

    const rows = records.map((data) => toWeb(data))

    result(null, { rows, count })
  })
}

module.exports = Title
