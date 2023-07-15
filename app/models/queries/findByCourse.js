module.exports = `
SELECT
  cr.id,
  c.name course_name,
  CASE WHEN u.full_name IS NULL THEN 'No instructor assinged' ELSE u.full_name END instructor_name,
  cr.learners
FROM
  classroom cr
INNER JOIN
  course c
ON
  cr.course = c.id
LEFT OUTER JOIN
  user u
ON
  cr.instructor = u.id
WHERE
  cr.start = ?
ORDER BY
   2;`
