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
