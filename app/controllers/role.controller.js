const Role = require("../models/role.model");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const role = new Role({
    name: req.body.name,
  });

  Role.create(role, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Role.",
      });
    else res.send(data);
  });
};

exports.findAll = (req, res) => {
  const search = req.query.search;

  Role.getAll(search, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Roles.",
      });
    else res.send(data);
  });
};

exports.findOne = (req, res) => {
  Role.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Role with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Role with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.update = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  Role.updateById(req.params.id, new Role(req.body), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Role with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating Role with id " + req.params.id,
        });
      }
    } else res.send(data);
  });
};

exports.delete = (req, res) => {
  Role.remove(req.params.id, (err, data) => {
    if (err)
      switch (err.kind) {
        case "cannot_delete":
          res.status(404).send({
            message: `Role has transactions and cannot be deleted.`,
          });
          break;
        case "not_found":
          res.status(404).send({
            message: `Not found Role with id ${req.params.id}.`,
          });
          break;
        default:
          res.status(500).send({
            message: "Could not delete Role with id " + req.params.id,
          });
      }
    else res.send({ message: `Role was deleted successfully!` });
  });
};

exports.deleteAll = (req, res) => {
  Role.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Roles.",
      });
    else res.send({ message: `All Roles were deleted successfully!` });
  });
};
