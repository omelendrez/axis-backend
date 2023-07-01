const Training = require('../models/training.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const training = new Training({
    learner: req.body.learner,
    course: req.body.course,
    start: req.body.start,
    end: req.body.end,
    issued: req.body.issued,
    certificate: req.body.certificate
  })

  Training.create(training, (err, data) => {
    if (err) {
      if (err.kind === 'already_exists') {
        res.status(400).send({
          message:
            'A Training with the same info already exists for this Learner in database.'
        })
      } else {
        res.status(500).send({
          message:
            err.message || 'Some error occurred while creating the Training.'
        })
      }
    } else {
      const trainingId = data.id
      const userId = req.decoded.data.id
      Training.addTracking(trainingId, userId, 1, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
              err.message || 'Some error occurred while creating the Training.'
          })
        } else {
          res.status(201).send(data)
        }
      })
    }
  })
}

exports.findAll = (req, res) => {
  Training.getAll(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Trainings.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  Training.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Training with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Training with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findOneView = (req, res) => {
  Training.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Training with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Training with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findMedicalData = (req, res) => {
  Training.getMedicalData(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Medical Data with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Medical Data with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findAllByClassroom = (req, res) => {
  const pagination = req.query
  Training.getAllByClassroom(req.params.id, pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Trainings.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findTracking = (req, res) => {
  Training.getTracking(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Training tracking records.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findCourseItems = (req, res) => {
  Training.getCourseItemData(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Training tracking records.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Training.updateById(req.params.id, new Training(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Training with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Training with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Training.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message: 'Training has changed status and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Training with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Training with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Training was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Training.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Trainings.'
      })
    } else res.send({ message: 'All Trainings were deleted successfully!' })
  })
}
