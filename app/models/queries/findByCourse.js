module.exports = `
SELECT
  c.name course_name,
  u.full_name instructor_name,
  count(*) learners
FROM
  training t
INNER JOIN
  course c
ON
  t.course = c.id
LEFT OUTER JOIN
  user u ON t.instructor = u.id
WHERE
  t.start = ?
GROUP BY
	c.name, u.full_name
ORDER BY
   2;`
