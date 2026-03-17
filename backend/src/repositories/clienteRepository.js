const { getDb } = require('../config/database');

exports.insert = async (data, ownerId) => {
  const { nome, email } = data;
  const db = getDb(); // Pega a instância do banco conectada

  // O db.run aqui já retorna uma promise, não precisa de callback!
  const result = await db.run(
    "INSERT INTO clientes (nome, email, owner_id) VALUES (?, ?, ?)",
    [nome, email, ownerId]
  );

  return {
    id: result.lastID, // No 'sqlite' (wrapper), o result traz o lastID
    nome,
    email,
    owner_id: ownerId
  };
};

exports.findAllByOwner = async (ownerId) => {
  const db = getDb(); // Pega a instância do banco conectada

  // O db.all também já é assíncrono
  return await db.all(
    "SELECT * FROM clientes WHERE owner_id = ?",
    [ownerId]
  );
};

exports.remove = async (id, ownerId) => {
  const db = getDb();
  await db.run(
    "DELETE FROM clientes WHERE id = ? AND owner_id = ?",
    [id, ownerId]
  );
};