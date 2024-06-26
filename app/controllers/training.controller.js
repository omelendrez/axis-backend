const { USER_TYPES } = require('../helpers/utils')
const Training = require('../models/training.model')

exports.create = (req, res, next) => {
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
    prev_expiry: req.body.prev_expiry,
    instructor: req.body.instructor
  })

  Training.create(training, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'already_exists':
          res.status(400).send({
            message:
              'A training with the same info already exists for this Learner in database.'
          })
          break
        case 'missing_prev_expiry':
          res.status(400).send({
            message: 'Previous Expire Date is required for FOET courses.'
          })
          break
        case 'training_dates':
          res.status(400).send({
            message: 'Start course date is required.'
          })
          break
        default:
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
          next()
        }
      })
    }
  })
}

exports.getAllById = (req, res, next) => {
  Training.findAllById(req.params.id, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Trainings.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getOne = (req, res, next) => {
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
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getOneView = (req, res, next) => {
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
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getAllByDate = (req, res, next) => {
  Training.findByDate(
    req.params.date,
    req.params.statuses,
    req.query,
    (err, data) => {
      if (err) {
        if (err.kind === 'not_found') {
          res.status(404).send({
            message: 'Not records found for the given date.'
          })
        } else {
          res.status(500).send({
            message: 'Internal database error'
          })
        }
      } else {
        res.locals.data = data
        next()
      }
    }
  )
}

exports.update = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Training.updateById(req.params.id, new Training(req.body), (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'not_found':
          res.status(404).send({
            message: `Not found Training with id ${req.params.id}.`
          })

          break
        case 'missing_prev_expiry':
          res.status(400).send({
            message: 'Previous Expire Date is required for FOET courses.'
          })
          break
        case 'training_dates':
          res.status(400).send({
            message: 'Start course date id required.'
          })
          break
        default:
          res.status(500).send({
            message: 'Error updating Training with id ' + req.params.id
          })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  const roles = JSON.parse(req.decoded?.data?.roles)

  if (roles.find((r) => r.id === USER_TYPES.SYS_ADMIN)) {
    return Training.removeForce(req.params.id, (err) => {
      if (err) {
        switch (err.kind) {
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
      } else {
        res.send({ message: 'Training was deleted successfully!' })
        next()
      }
    })
  }

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
    } else {
      res.send({ message: 'Training was deleted successfully!' })
      next()
    }
  })
}

// exports.deleteAll = (req, res) => {
//   Training.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message || 'Some error occurred while removing all Trainings.'
//       })
//     } else {
//       res.send({ message: 'All Trainings were deleted successfully!' })
//     }
//   })
// }

exports.getActivePeriod = (req, res, next) => {
  Training.findActivePeriod((err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Internal database error'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getCourseMonthByYear = (req, res, next) => {
  Training.findCourseMonthByYear(req.params.year, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Internal database error'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getLearnerByYear = (req, res, next) => {
  Training.findLearnerByYear(req.params.year, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Internal database error'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getCourseByYear = (req, res, next) => {
  Training.findCourseByYear(req.params.year, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Internal database error'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getCourseTypeByYear = (req, res, next) => {
  Training.findCourseTypeByYear(req.params.year, (err, data) => {
    if (err) {
      res.status(500).send({
        message: 'Internal database error'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.getTrainingRecords = (req, res, next) => {
  Training.findTrainingRecords(
    new URL(req.url, `http://${req.headers.host}`),
    (err, data) => {
      if (err) {
        if (err.kind === 'too_many') {
          res.status(400).send({
            message: `Too many records found (${err.data}). Not enough filters were applied.`
          })
        } else {
          res.status(500).send({
            message: 'Internal database error'
          })
        }
      } else {
        res.locals.data = data
        next()
      }
    }
  )
}

exports.verify = (req, res, next) => {
  const id = parseInt(req.params.id, 16)
  Training.verify(id, (err, data) => {
    if (err) {
      switch (err.kind) {
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
    } else {
      res.locals.data = data
      next()
    }
  })
}
