module.exports = `
SELECT
  t.id,
  l.badge,
  CONCAT(l.first_name, ' ' , l.middle_name, ' ' , l.last_name) full_name,
  co.name company_name,
  c.name course_name,
  t.status,
  s.status status_name,
  s.state state_name
FROM
  training t
INNER JOIN
  course c
ON
  t.course = c.id
INNER JOIN
  learner l
ON
  t.learner = l.id
INNER JOIN
  company co
ON
  l.company = co.id
INNER JOIN
  status s
ON
  t.status = s.id
WHERE
  t.start = ?
{{status_filter}}
ORDER BY 3;
`
