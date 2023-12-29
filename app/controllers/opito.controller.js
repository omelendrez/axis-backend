const Opito = require('../models/opito.model')

exports.findAll = (req, res) => {
  Opito.getAll((err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving Opito records.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.fileList = (req, res) => {
  const pagination = req.query

  Opito.getFileList(pagination, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Opito file list records.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.fileContent = (req, res) => {
  Opito.getFileContent(req.query, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message ||
          'Some error occurred while retrieving Opito file content records.'
      })
    } else {
      res.send(data)
    }
  })
}

exports.saveFieldValues = (req, res) => {
  Opito.saveFields(req.params, req.body, (err) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while saving Opito field values.'
      })
    } else {
      res.send({ message: 'Fields updated successfully!' })
    }
  })
}
