const clienteRepository = require('../repositories/clienteRepository');

exports.create = async (data, ownerId) => {
  // Regra de negócio: todo cliente precisa de um dono
  return await clienteRepository.insert(data, ownerId);
};

exports.getAll = async (ownerId) => {
  return await clienteRepository.findAllByOwner(ownerId);
};

exports.delete = async (id, ownerId) => {
  const clienteRepository = require('../repositories/clienteRepository');
  return await clienteRepository.remove(id, ownerId);
};