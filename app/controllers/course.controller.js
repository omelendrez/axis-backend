const Course = require('../models/course.model')

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: 'Content can not be empty!'
    })
  }

  const course = new Course({
    name: req.body.name,
    front_id: req.body.front_id,
    back_id: req.body.back_id,
    id_card: req.body.id_card,
    duration: req.body.duration,
    validity: req.body.validity,
    cert_type: req.body.cert_type,
    opito_reg_code: req.body.opito_reg_code
  })

  Course.create(course, (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'missing_front_id':
          res.status(400).send({
            message: 'Front Id field is mandatory in Opito Courses.'
          })
          break
        case 'already_exists':
          res.status(400).send({
            message: 'Course with same name already exists in database.'
          })
          break
        default:
          res.status(500).send({
            message:
              err.message || 'Some error occurred while retrieving Courses.'
          })
      }
    } else {
      res.send(data)
    }
  })
}

exports.findAll = (req, res) => {
  const pagination = req.query

  Course.getAll(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving Courses.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.findOne = (req, res) => {
  Course.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Course with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Course with id ' + req.params.id
        })
      }
    } else res.send(data)
  })
}

exports.findOneView = (req, res) => {
  Course.findByIdView(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === 'not_found') {
        res.status(404).send({
          message: `Not found Course with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: 'Error retrieving Course with id ' + req.params.id
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

  Course.updateById(req.params.id, new Course(req.body), (err, data) => {
    if (err) {
      switch (err.kind) {
        case 'missing_front_id':
          res.status(400).send({
            message: 'Front Id field is mandatory in Opito Courses.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Course with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Error updating Course with id ' + req.params.id
          })
      }
    } else res.send(data)
  })
}

exports.delete = (req, res) => {
  Course.remove(req.params.id, (err) => {
    if (err) {
      switch (err.kind) {
        case 'cannot_delete':
          res.status(400).send({
            message: 'Course has transactions and cannot be deleted.'
          })
          break
        case 'not_found':
          res.status(404).send({
            message: `Not found Course with id ${req.params.id}.`
          })
          break
        default:
          res.status(500).send({
            message: 'Could not delete Course with id ' + req.params.id
          })
      }
    } else res.send({ message: 'Course was deleted successfully!' })
  })
}

exports.deleteAll = (req, res) => {
  Course.removeAll((err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while removing all Courses.'
      })
    } else res.send({ message: 'All Courses were deleted successfully!' })
  })
}
