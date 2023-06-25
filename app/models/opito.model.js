const sql = require('./db.js')

const { log } = require('../helpers/log.js')
// constructor
const Opito = function () {}

Opito.getAll = (result) => {
  const query = `
  SELECT
    c.front_id,
    c.opito_reg_code,
    DATE_FORMAT(t.issued, '%d/%m/%Y') start,
    DATE_FORMAT(t.expiry, '%d/%m/%Y') end,
    '' title,
    l.first_name,
    l.middle_name,
    l.last_name,
    co.name company,
    DATE_FORMAT(l.birth_date, '%d/%m/%Y') birth_date,
    l.address_1,
    l.address_2,
    '' address_3,
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
    company co ON l.company = co.id
WHERE
    t.certificate <> '' AND c.cert_type = 4
        AND c.front_id <> ''
ORDER BY t.id DESC
LIMIT 200;
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

module.exports = Opito
