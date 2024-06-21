module.exports = `
SELECT
    (SELECT
            foet_required
        FROM
            course c
        WHERE
            c.id = (SELECT
                    course
                FROM
                    training t
                WHERE
                    t.id = ?)) as 'is_required',
    (SELECT
            COUNT(1)
        FROM
            s3_document
        WHERE
            file IN (SELECT
                    CONCAT('uploads/foets/',
                                LPAD(?, 12, '0'),
                                '.jpg') documents
                )) as 'documents'

`
