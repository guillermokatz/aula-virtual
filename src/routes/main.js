var express = require('express');
var router = express.Router();

const mainController = require('../controllers/mainController');

router.get('/', mainController.index);

router.post('/search', mainController.search);

router.post('/:id', mainController.detail);

module.exports = router;
