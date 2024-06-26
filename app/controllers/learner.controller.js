const Learner = require('../models/learner.model')

exports.create = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const learner = new Learner({
    type: req.body.type,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    title: req.body.title,
    sex: req.body.sex,
    state: req.body.state,
    nationality: req.body.nationality,
    birth_date: req.body.birth_date,
    company: req.body.company,
    status: req.body.status
  })

  Learner.create(learner, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'title_missing':
          return res.status(400).send({
            message: 'Title is required.'
          })

        case 'already_exists':
          return res.status(400).send({
            message:
              'Learner with same names and birth date already exists in database.'
          })

        default:
          return res.status(500).send({
            message:
              err.message || 'Some error occurred while creating the Learner.'
          })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.findAll = (req, res, next) => {
  const pagination = req.query

  Learner.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Learners.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOne = (req, res, next) => {
  Learner.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Learner with id ' + req.params.id
        })
      }
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.findOneView = (req, res, next) => {
  Learner.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Learner with id ' + req.params.id
        })
      }
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.update = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  Learner.updateById(req.params.id, new Learner(req.body), (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Learner with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error updating Learner with id ' + req.params.id
        })
      }
    } else {
      res.send(data)
      next()
    }
  })
}

exports.delete = (req, res, next) => {
  Learner.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(404).send({
            message:
              'Learner has rows assigned with another table and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Learner with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Learner with id ' + req.params.id
          })
      }
    } else {
      res.send({ message: 'Learner was deleted successfully!' })
      next()
    }
  })
}

// exports.deleteAll = (req, res) => {
//   Learner.removeAll((err) => {
//     if (err) {
//       res.status(500).send({
//         message:
//           err.message || 'Some error occurred while removing all Learners.'
//       })
//     } else {
//       res.send({ message: 'All Learners were deleted successfully!' })
//     }
//   })
// }
