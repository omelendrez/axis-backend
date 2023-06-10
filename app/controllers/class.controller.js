const Class = require('../models/class.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const classroom = new Class({
    course: req.body.course,
    start: req.body.start,
    learners: req.body.learners
  })

  Class.create(classroom, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        return res.status(400).send({
          message:
            'A Class with the same course and start date already exists in database.'
        })
      }
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the Class.'
      })
    }

    res.send(data)
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Class.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Classes.'
      })
    } else res.send(data)
  })
}

exports.findOne = (req, res) => {
  Class.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Class with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Class with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findOneView = (req, res) => {
  Class.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Class with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Class with id ' + req.params.id
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

  Class.updateById(req.params.id, new Class(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Class with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Class with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Class.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Class has learners and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Class with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Class with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Class was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Class.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all Classs.'
      })
    } else res.send({ message: 'All Classs were deleted successfully!' })
  })
}
