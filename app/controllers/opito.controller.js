const Opito = require('../models/opito.model')

exports.findAll = (req, res, next) => {
  Opito.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Opito records.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.fileList = (req, res, next) => {
  const pagination = req.query

  Opito.getFileList(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Opito file list records.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.fileContent = (req, res, next) => {
  Opito.getFileContent(req.query, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Opito file content records.'
      })
    } else {
      res.locals.data = data
      next()
    }
  })
}

exports.saveFieldValues = (req, res, next) => {
  Opito.saveFields(req.params, req.body, (err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while saving Opito field values.'
      })
    } else {
      res.send({ message: 'Fields updated successfully!' })
      next()
    }
  })
}
