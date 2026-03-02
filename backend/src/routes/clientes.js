const express = require('express')
const router = express.Router();
const clienteController = require('../controllers/clienteControler');

router.post('/',
clienteControler.create);

module.exports = router;