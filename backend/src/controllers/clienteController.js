const clienteService = require('../services/clienteService');

exports.create = async (req, res, next) => {
  try{
    const result = await
clienteService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};