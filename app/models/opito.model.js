const sql = require('./db')

const { log } = require('../helpers/log')
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

module.exports = Opito
