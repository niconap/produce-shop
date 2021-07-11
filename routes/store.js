var express = require('express');
var router = express.Router();

var origin_controller = require('../controllers/originController');
var product_controller = require('../controllers/productController');

router.get('/', product_controller.index);

router.get('/product/create', product_controller.product_create_get);

router.post('/product/create', product_controller.product_create_post);

router.get('/product/:id/delete', product_controller.product_delete_get);

router.post('/product/:id/delete', product_controller.product_delete_post);

router.get('/product/:id/update', product_controller.product_update_get);

router.post('/product/:id/update', product_controller.product_update_post);

router.get('/product/:id', product_controller.product_detail);

router.get('/origin/create', origin_controller.origin_create_get);

router.post('/origin/create', origin_controller.origin_create_post);

router.get('/origin/:id/delete', origin_controller.origin_delete_get);

router.post('/origin/:id/delete', origin_controller.origin_delete_post);

router.get('/origin/:id/update', origin_controller.origin_update_get);

router.post('/origin/:id/update', origin_controller.origin_update_post);

router.get('/origin/:id', origin_controller.origin_detail);

module.exports = router;