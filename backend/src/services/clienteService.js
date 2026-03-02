const clienteRepository = require('../repositories/clienteRepository');

exports.create = async (data) => {

  return await
clienteRepository.insert(data);
};