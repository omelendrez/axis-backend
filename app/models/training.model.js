const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Training = function (training) {
  this.trainee = training.trainee
  this.course = training.course
  this.start = training.start
  this.expiry = training.expiry
  this.certificate = training.certificate
  this.status = training.status
}

Training.create = (training, result) => {
  const newTraining = { ...training, status: 1 }

  sql.query(
    'SELECT COUNT(1) records FROM training WHERE trainee = ? AND course = ? AND DATE_FORMAT(start, "%Y-%m-%d") = ?',
    [newTraining.trainee, newTraining.course, newTraining.start],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'already_exists' }, null)
        return
      }

      sql.query('INSERT INTO training SET ?', newTraining, (err, res) => {
        if (err) {
          log.error(err)
          result(err, null)
          return
        }

        result(null, { id: res.insertId, ...newTraining })
      })
    }
  )
}

Training.findById = (id, result) => {
  sql.query(
    `SELECT id, trainee, course, DATE_FORMAT(start, '%Y-%m-%d') start, DATE_FORMAT(expiry, '%Y-%m-%d') expiry, certificate, status FROM training WHERE id = ${id}`,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res.length) {
        result(null, toWeb(res[0]))
        return
      }

      result({ kind: 'not_found' }, null)
    }
  )
}

Training.getAll = (id, result) => {
  const query = `SELECT t.id, c.name course, DATE_FORMAT(t.start, '%d-%m-%Y') start, DATE_FORMAT(t.expiry, '%d-%m-%Y') expiry, t.certificate, s.status FROM training t INNER JOIN course c ON t.course = c.id INNER JOIN status s ON t.status = s.id WHERE trainee = ${id}`

  sql.query(query, (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    const data = res.map((data) => toWeb(data))

    result(null, data)
  })
}

Training.updateById = (id, training, result) => {
  sql.query(
    'UPDATE training SET trainee = ?, course = ?, start = ?, expiry = ?, certificate = ?, status = ? WHERE id = ?',
    [
      training.trainee,
      training.course,
      training.start,
      training.expiry,
      training.certificate,
      training.status,
      id
    ],
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res.affectedRows === 0) {
        result({ kind: 'not_found' }, null)
        return
      }

      result(null, { id, ...toWeb(training) })
    }
  )
}

Training.remove = (id, result) => {
  sql.query(
    'SELECT COUNT(1) records FROM tracking WHERE training = ?',
    id,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records > 1) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

      sql.query('DELETE FROM tracking WHERE training = ?', id, () => {
        sql.query('DELETE FROM training WHERE id = ?', id, (err, res) => {
          if (err) {
            log.error(err)
            result(err, null)
            return
          }

          if (res.affectedRows === 0) {
            result({ kind: 'not_found' }, null)
            return
          }

          result(null, id)
        })
      })
    }
  )
}

Training.removeAll = (result) => {
  sql.query('DELETE FROM training', (err, res) => {
    if (err) {
      log.error(err)
      result(err, null)
      return
    }

    result(null, res.affectedRows)
  })
}

module.exports = Training
