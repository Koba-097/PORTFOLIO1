const db = require('../database/connection');

exports.insert = async (data) => {
  const { nome, email } = data;

  return new Promise((resolve, reject) => {
    db.run {
       "INSERT INTO clientes (nome, email) VALUES (?, ?)",
       [nome, email],
       function (err) {
         if (err) return reject(err);
         resolve({ id: this.lastID, nome, email});
      }
    );
  });
};