const Nationality = require("../models/nationality.model");

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }

  const nationality = new Nationality({
    code: req.body.code,
    country: req.body.country,
    nationality: req.body.nationality,
  });

  Nationality.create(nationality, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Nationality.",
      });
    else res.send(data);
  });
};

exports.findAll = (req, res) => {
  const title = req.query.title;

  Nationality.getAll(title, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Nationalitys.",
      });
    else res.send(data);
  });
};

exports.findOne = (req, res) => {
  Nationality.findById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Nationality with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Nationality with id " + req.params.id,
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

  Nationality.updateById(
    req.params.id,
    new Nationality(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Nationality with id ${req.params.id}.`,
          });
        } else {
          res.status(500).send({
            message: "Error updating Nationality with id " + req.params.id,
          });
        }
      } else res.send(data);
    }
  );
};

exports.delete = (req, res) => {
  Nationality.remove(req.params.id, (err, data) => {
    if (err)
      switch (err.kind) {
        case "cannot_delete":
          res.status(404).send({
            message: `Nationality has transactions and cannot be deleted.`,
          });
          break;
        case "not_found":
          res.status(404).send({
            message: `Not found Nationality with id ${req.params.id}.`,
          });
          break;
        default:
          res.status(500).send({
            message: "Could not delete Nationality with id " + req.params.id,
          });
      }
    else res.send({ message: `Nationality was deleted successfully!` });
  });
};

exports.deleteAll = (req, res) => {
  Nationality.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Nationalitys.",
      });
    else res.send({ message: `All Nationalitys were deleted successfully!` });
  });
};