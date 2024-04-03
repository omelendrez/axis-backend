module.exports = `SELECT
    c.name course,
    CONCAT(l.last_name, ', ', l.first_name) full_name,
    DATE_FORMAT(t.issued, '%d %M %Y') issued,
    CASE
        WHEN ISNULL(t.expiry) THEN NULL ELSE DATE_FORMAT(t.expiry, '%d %M %Y')
    END expiry,
    CASE
        WHEN expiry < NOW() THEN 0
        ELSE 1
    END is_valid
FROM
    training t
    INNER JOIN course c ON t.course = c.id
    INNER JOIN learner l ON t.learner = l.id
WHERE
    t.id = ?;`
