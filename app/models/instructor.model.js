const sql = require('./db')
const { loadModel } = require('../helpers/utils')
const { sendError } = require('../errors/error-monitoring')
// constructor
const Instructor = function (payload) {
  loadModel(payload, this)
}

Instructor.create = (instructor, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM training_instructor WHERE training = ? AND date = ? AND module = ? AND instructor = ?',
    [
      instructor.training,
      instructor.date,
      instructor.module,
      instructor.instructor
    ],
    (err, res) => {
      if (err) {
        sendError('Instructor.create', err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }
      sql.query(
        'INSERT INTO training_instructor SET ?',
        instructor,
        (err, res) => {
          if (err) {
            sendError('Instructor.create', err)
            result(err, null)
            return
          }

          result(null, { id: res.insertId, ...instructor })
        }
      )
    }
  )
}

Instructor.remove = (id, result) => {
  sql.query('DELETE FROM training_instructor WHERE id = ?', id, (err, res) => {
    if (err) {
      sendError('Instructor.remove', err)
      result(err, null)
      return
    }

    if (res.affectedRows === 0) {
      result({ kind: 'not_found' }, null)
      return
    }

    result(null, id)
  })
}

module.exports = Instructor
