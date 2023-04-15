const User = require("../models/user.model")

exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    })
  }

  // Create a User
  const user = new User({
    password: req.body.password,
    name: req.body.name,
    full_name: req.body.full_name,
    email: req.body.email,
  })

  // Save User in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      })
    else res.send(data)
  })
}

// Retrieve all users from the database (with condition).
exports.findAll = (req, res) => {
  const title = req.query.title

  User.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      })
    else res.send(data)
  })
}

// Find a single user with a id
exports.findOne = (req, res) => {
  User.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.id
        })
      }
    } else res.send(data)
  })
}

// Update a user identified by the id in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    })
  }

  User.updateById(
    req.params.id,
    new User(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found User with id ${req.params.id}.`
          })
        } else {
          res.status(500).send({
            message: "Error updating User with id " + req.params.id
          })
        }
      } else res.send(data)
    }
  )
}

exports.chgPwd = (req, res) => {
  User.chgPwd(
    req.params.id,
    req.body,
    (err, data) => {
      if (err) {
        switch (err.kind) {
          default:
            res.status(500).send({
              message: "Error updating User with id " + req.params.id
            })
            break
          case "not_found":
            res.status(404).send({
              message: `Not found User with id ${req.params.id}.`
            })
            break
          case "wrong_prev_password":
            res.status(400).send({
              message: `Previous password not matching.`
            })
            break
        }
      } else res.send({ message: `Password changed successfuly.` })
    })
}

// Delete a user with the specified id in the request
exports.delete = (req, res) => {
  User.remove(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`
        })
      } else {
        res.status(500).send({
          message: "Could not delete User with id " + req.params.id
        })
      }
    } else res.send({ message: `User was deleted successfully!` })
  })
}

// Delete all users from the database.
exports.deleteAll = (req, res) => {
  User.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Users."
      })
    else res.send({ message: `All Users were deleted successfully!` })
  })
}


exports.login = (req, res) => {
  User.login(req.body, (err, data) => {

    if (err) {
      switch (err.kind) {
        default:
          res.status(500).send({
            message: "Error retrieving User with id " + req.params.id
          })
          break
        case "not_found":
          res.status(404).send({
            message: `Not found User with id ${req.params.id}.`
          })
          break
        case "wrong_password":
          res.status(401).send({
            message: `Email or password incorrect.`
          })
          break
      }
    } else res.send(data)
  })
}
