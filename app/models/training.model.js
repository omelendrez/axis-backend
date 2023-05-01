const sql = require('./db.js')
const { toWeb } = require('../helpers/utils.js')
const { log } = require('../helpers/log.js')
// constructor
const Training = function (training) {
  this.trainee = training.trainee
  this.code = training.code
  this.start = training.start
  this.ending = training.ending
  this.certificate = training.certificate
  this.status = training.status
}

Training.create = (training, result) => {
  const newTraining = { ...training, status: 1 }

  sql.query(
    'SELECT COUNT(1) records FROM training WHERE trainee = ? AND code = ? AND DATE_FORMAT(start, `%Y-%m-%d`) = ?',
    [newTraining.trainee, newTraining.code, newTraining.start],
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
    `SELECT id, trainee, code, DATE_FORMAT(start, '%Y-%m-%d') start, DATE_FORMAT(ending, '%Y-%m-%d') ending, certificate, status FROM training WHERE id = ${id}`,
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
    'UPDATE training SET trainee = ?, code = ?, start = ?, ending = ?, certificate = ?, status = ? WHERE id = ?',
    [
      training.trainee,
      training.code,
      training.start,
      training.ending,
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
    'SELECT COUNT(1) records FROM training WHERE training = ?',
    id,
    (err, res) => {
      if (err) {
        log.error(err)
        result(err, null)
        return
      }

      if (res[0].records) {
        result({ kind: 'cannot_delete' }, null)
        return
      }

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
