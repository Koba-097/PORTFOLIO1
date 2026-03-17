const clienteService = require('../services/clienteService');

exports.create = async (req, res, next) => {
  try {
    const result = await clienteService.create(req.body, req.userId);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const clientes = await clienteService.getAll(req.userId);
    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

exports.deletar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await clienteService.delete(id, req.userId);
    res.status(204).send(); // Sucesso, sem conteúdo para retornar
  } catch (error) {
    next(error);
  }
};