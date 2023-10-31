module.exports = `SELECT
	t.id,
	l.badge,
	l.type,
	t.certificate,
	t.opito_learner,
	l.id learner_id,
	CONCAT(
		l.first_name,
		' ',
		l.last_name
	) full_name,
	l.last_name surname,
	DATE_FORMAT(l.birth_date, '%d/%m/%Y') birth_date,
	CASE
		WHEN l.sex = 'F' THEN 'Female'
		ELSE 'Male'
	END sex,
	n.nationality,
	c.name company,
	DATE_FORMAT(t.start, '%d/%m/%Y') start,
	DATE_FORMAT(t.end,
	'%d/%m/%Y'
)
end,
DATE_FORMAT(t.prev_expiry, '%d/%m/%Y') prev_expiry,
DATE_FORMAT(t.issued, '%d/%m/%Y') issued,
DATE_FORMAT(t.expiry, '%d/%m/%Y') expiry,
DATE_FORMAT(t.expiry, '%Y-%c-%e') opito_expiry,
i.full_name instructor,
t.status status_id,
st.name state,
s.status,
t.reject_reason
FROM
	learner l
	INNER JOIN training t ON l.id = t.learner
	LEFT OUTER JOIN user i ON t.instructor = i.id
	INNER JOIN company c ON c.id = l.company
	INNER JOIN nationality n ON l.nationality = n.id
	INNER JOIN state st ON l.state = st.id
	INNER JOIN status s ON s.id = t.status
WHERE
	t.id = ?;

SELECT
	t.status,
	CASE
		WHEN tm.training IS NULL THEN NULL
		ELSE JSON_ARRAYAGG(
			JSON_OBJECT(
				'systolic',
				tm.systolic,
				'diastolic',
				tm.diastolic
			)
		)
	END bp
FROM
	training_tracking t
	LEFT OUTER JOIN training_medical tm ON tm.training = t.training
	AND t.status = 4
WHERE
	t.training = ?
	AND t.status IN (4, 13)
GROUP BY
	t.status;

SELECT
	id,
	name,
	front_id_text,
	back_id_text,
	id_card,
	duration,
	validity,
	cert_type,
	expiry_type,
	opito_reg_code
FROM
	course
WHERE
	id = (
		SELECT
			course
		FROM
			training
		WHERE
			id = ?
	);

SELECT
	id,
	name
FROM
	course_item
WHERE
	id IN (
		SELECT
			item
		FROM
			course_item_rel
		WHERE
			course IN (
				SELECT
					course
				FROM
					training
				WHERE
					id = ?
			)
	)
ORDER BY
	name;

SELECT
	s.id status_id,
	s.status,
	u.full_name,
	DATE_FORMAT(t.updated, "%d/%m/%Y %H:%i:%s") updated
FROM
	training_tracking t
	INNER JOIN status s ON t.status = s.id
	INNER JOIN user u ON t.user = u.id
WHERE
	t.training = ?
ORDER BY
	t.updated;

SELECT ct.name type, ci.value
	FROM contact_info ci
	INNER JOIN contact_type ct ON ct.id = ci.type
	WHERE ci.learner = (SELECT learner FROM training WHERE id = ?)
	AND ci.type = 3
	LIMIT 1;
`
