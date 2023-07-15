module.exports = `
SELECT
  l.company,
  co.name company_name,
  COUNT(*) learners
FROM
  training t
INNER JOIN
  learner l
ON
  t.learner = l.id
INNER JOIN
  company co
ON
  l.company = co.id
WHERE
  t.start = ?
AND
  t.status IN (?)
GROUP BY
  l.company,
  co.name
ORDER BY
  2;`
