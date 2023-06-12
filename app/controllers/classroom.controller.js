const Classroom = require('../models/classroom.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const classroom = new Classroom({
    course: req.body.course,
    start: req.body.start,
    learners: req.body.learners
  })

  Classroom.create(classroom, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        return res.status(400).send({
          message:
            'A Classroom with the same course and start date already exists in database.'
        })
      }
      return res.status(500).send({
        message:
          err.message || 'Some error occurred while creating the Classroom.'
      })
    }

    res.send(data)
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Classroom.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Classes.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  Classroom.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Classroom with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Classroom with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findOneView = (req, res) => {
  Classroom.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Classroom with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Classroom with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Classroom.updateById(req.params.id, new Classroom(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Classroom with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Classroom with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Classroom.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Classroom has learners and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Classroom with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Classroom with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Classroom was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Classroom.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all Classs.'
      })
    } else res.send({ message: 'All Classs were deleted successfully!' })
  })
}
