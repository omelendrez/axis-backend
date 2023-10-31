const sql = require('./db')

const { log } = require('../helpers/log')
const { getPaginationFilters, toWeb } = require('../helpers/utils')

// constructor
const Opito = function () {}

Opito.getAll = (result) => {
  const query = `
  SELECT
    c.front_id_text,
    c.opito_reg_code,
    DATE_FORMAT(t.issued, '%d/%m/%y') start,
    DATE_FORMAT(t.expiry, '%d/%m/%y') end,
    ti.name title,
    l.first_name,
    l.last_name,
    co.name company,
    DATE_FORMAT(l.birth_date, '%d/%m/%Y') birth_date,
    '' city,
    '' postal_code,
    t.certificate,
    '' vantage_id
FROM
    training t
        INNER JOIN
    course c ON t.course = c.id
        INNER JOIN
    learner l ON t.learner = l.id
        INNER JOIN
    title ti ON l.title = ti.id
        INNER JOIN
    company co ON l.company = co.id
WHERE
    c.front_id_text IS NOT NULL
        AND t.expiry IS NOT NULL
        AND t.certificate IS NOT NULL
        AND c.cert_type = 4
        AND t.opito_file = ''
ORDER BY t.id DESC;
  `

  sql.query(query, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res)
  })
}

Opito.getFileList = (pagination, result) => {
  const fields = ['c.name', 'c.opito_reg_code']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `
  SELECT
    CONCAT(DATE_FORMAT(t.start, '%Y-%m-%d'), ' ', t.course) id,
    DATE_FORMAT(t.start, '%e-%b-%y') start,
    DATE_FORMAT(t.end, '%e-%b-%y') end,
    c.name,
    c.opito_reg_code product_code,
    COUNT(*) learners
  FROM
    training t
        INNER JOIN
    course c ON c.id = t.course
    ${filter}
    ${filter ? ' AND ' : ' WHERE '}
    c.cert_type = 4 AND t.status = 8
  GROUP BY
    start, end, t.course, c.name
  ORDER BY
    t.start DESC
  ${limits};`

  const queryCount = `
  SELECT COUNT(distinct t.start, t.course, c.name) records
  FROM
    training t
  INNER JOIN
      course c ON c.id = t.course
  ${filter}
  ${filter ? ' AND ' : ' WHERE '}
    c.cert_type = 4 AND t.status = 8;`

  const query = `${queryData}${queryCount}`

  sql.query(query, (err, res) => {
    if (err) {
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

Opito.getFileContent = ({ date, course }, result) => {
  const query = `
  SELECT
    l.first_name,
    l.last_name,
    DATE_FORMAT(l.birth_date, '%e-%b-%y') birth_date,
    DATE_FORMAT(t.prev_expiry, '%e-%b-%y') prev_expiry
  FROM
    training t
  INNER JOIN
    learner l ON l.id = t.learner
  WHERE t.status = 8
  AND t.start = ?
  AND t.course = ?
  ORDER BY l.last_name, l.first_name;`

  sql.query(query, [date, course], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    const rows = res.map((data) => toWeb(data))

    const count = res.length

    result(null, { rows, count })
  })
}

Opito.saveFields = ({ id }, { learnerId, certificateNo }, result) => {
  const query =
    'UPDATE training SET opito_learner = ?, certificate = ? WHERE id = ?'

  sql.query(query, [learnerId, certificateNo, id], (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Opito
