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
    DATE_FORMAT(t.issued, '%d/%m/%Y') start,
    DATE_FORMAT(t.expiry, '%d/%m/%Y') end,
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

Opito.getOpitoFileList = (pagination, result) => {
  const fields = ['c.name', 'c.opito_reg_code']

  const { filter, limits } = getPaginationFilters(pagination, fields)

  const queryData = `
  SELECT
    CONCAT(DATE_FORMAT(t.start, '%Y-%m-%d'), ' ', t.course) id,
    DATE_FORMAT(t.start, '%d/%m/%Y') start,
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
    start, t.course, c.name
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

module.exports = Opito
