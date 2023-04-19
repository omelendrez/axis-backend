const sql = require("./db.js");
const { toWeb } = require("../helpers/utils.js");
const { log } = require("../helpers/log.js");
// constructor
const State = function (state) {
  this.name = state.name;
};

State.create = (state, result) => {
  const newState = { ...state };
  sql.query("INSERT INTO state SET ?", newState, (err, res) => {
    if (err) {
      log.error("error: ", err);
      result(err, null);
      return;
    }

    result(null, { id: res.insertId, ...newState });
  });
};

State.findById = (id, result) => {
  sql.query(`SELECT * FROM state WHERE id = ${id}`, (err, res) => {
    if (err) {
      log.error("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, toWeb(res[0]));
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

State.getAll = (search, result) => {
  let filter = "";
  const fields = ["name"];
  if (search) {
    filter = ` WHERE CONCAT(${fields.join(" , ")}) LIKE '%${search}%'`;
  }

  const query = `SELECT id, name FROM state ${filter} ORDER BY name LIMIT 50;`;

  console.log(query, search);

  sql.query(query, (err, res) => {
    if (err) {
      log.error("error: ", err);
      result(null, err);
      return;
    }
    const results = res.map((state) => toWeb(state));
    result(null, results);
  });
};

State.updateById = (id, state, result) => {
  sql.query(
    "UPDATE state SET name = ? WHERE id = ?",
    [state.name, id],
    (err, res) => {
      if (err) {
        log.error("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, { id: id, ...toWeb(state) });
    }
  );
};

State.remove = (id, result) => {
  sql.query(
    "SELECT COUNT(1) records FROM trainee WHERE state = ?",
    id,
    (err, res) => {
      if (err) {
        log.error("error: ", err);
        result(null, err);
        return;
      }

      if (res[0].records) {
        result({ kind: "cannot_delete" }, null);
        return;
      }

      sql.query("DELETE FROM state WHERE id = ?", id, (err, res) => {
        if (err) {
          log.error("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        result(null, id);
      });
    }
  );
};

State.removeAll = (result) => {
  sql.query("DELETE FROM state", (err, res) => {
    if (err) {
      log.error("error: ", err);
      result(null, err);
      return;
    }

    result(null, res.affectedRows);
  });
};

module.exports = State;
