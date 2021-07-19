var Product = require('../models/product');
var Origin = require('../models/origin');
const { body, validationResult} = require('express-validator');

var async = require('async');

exports.index = function(req, res, next) {
  async.parallel(
    {
      products: function (callback) {
        Product.find({}, 'name price image_url').exec(callback);
      },
      origins: function (callback) {
        Origin.find({}, 'name').exec(callback);
      }
    },
    function (err, results) {
      if (err) return next(err);
      if (results.products == null) {
        var err = new Error("No products found!");
        err.status = 404;
        return next(err);
      }
      res.render('index', { products: results.products, origins: results.origins });
    }
  )
}

exports.product_create_get = function(req, res, next) {
  async.parallel({
    origins: function (callback) {
      Origin.find(callback);
    }
  },
  function (err, results) {
    if (err) return next(err);
    res.render('product_form', { title: 'Create product', origins: results.origins })
  })
}

exports.product_create_post = [
  (req, res, next) => {
    next();
  },

  body('name', 'Name must be longer than 3 characters.').trim().isLength( { min: 3 }).escape(),
  body('name', 'Name must not be longer than 50 characters.').trim().isLength( { max: 50 }).escape(),
  body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must be longer than 3 characters.').trim().isLength({ min: 3 }).escape(),
  body('description', 'Description must not be longer than 200 characters.').trim().isLength({ max: 200 }).escape(),
  body('num_in_stock', 'Number in stock must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('image_url', 'Image URL must not be empty.').trim().isLength({ min: 1 }),
  body('origin', 'Origin must not be emtpy.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password is incorrect.').trim().equals(process.env.PASSWORD),

  (req, res, next) => {
    const errors = validationResult(req);

    var product = new Product(
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        num_in_stock: req.body.num_in_stock,
        image_url: req.body.image_url,
        origin: req.body.origin,
      }
    )

    if (!errors.isEmpty()) {
      async.parallel({
        origins: function (callback) {
          Origin.find(callback);
        }
      },
      function (err, results) {
        if (err) return next(err);
        res.render('product_form', { title: 'Create product', origins: results.origins, errors: errors.array() })
      });
      return;
    } else {
      product.save(function (err) {
        if (err) return next(err);
        res.redirect(product.url);
      });
    }
  }
]

exports.product_delete_get = function(req, res, next) {
  async.parallel({
    product: function (callback) {
      Product.findById(req.params.id).populate('origin').exec(callback);
    }
  },
  function (err, results) {
    if (err) return next(err);
    if (results.product == null) {
      res.redirect('/store/');
    }
    res.render('product_delete', { title: 'Delete product', product: results.product });
  })
}

exports.product_delete_post = [
  (req, res, next) => {
    next();
  },

  body('password', 'Password is incorrect.').trim().equals(process.env.PASSWORD),

  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      async.parallel({
        product: function(callback) {
          Product.findById(req.params.id).populate('origin').exec(callback);
        }
      },
      function (err, results) {
        if (err) return next(err);
        if (results.product == null) {
          res.redirect('/store/');
        }
        res.render('product_delete', { title: 'Delete product', product: results.product, errors: errors.array()});
      })
      return;
    } else {
      Product.findByIdAndRemove(req.body.productid, function deleteProduct (err) {
        if (err) return next(err);
        res.redirect('/store/');
      })
    }
  }
]

exports.product_update_get = function(req, res, next) {
  async.parallel({
    product: function (callback) {
      Product.findById(req.params.id).populate('origin').exec(callback);
    },
    origins: function (callback) {
      Origin.find().exec(callback);
    }
  },
  function (err, results) {
    if (err) return next(err);
    if (results.product==null) {
      var err = new Error('Product not found');
      err.status = 404;
      return next(err);
    }
    res.render('product_form', {title: 'Update Product', product: results.product, origins: results.origins })
  })
}

exports.product_update_post = [
  (req, res, next) => {
    next();
  },

  body('name', 'Name must be longer than 3 characters.').trim().isLength( { min: 3 }).escape(),
  body('name', 'Name must not be longer than 50 characters.').trim().isLength( { max: 50 }).escape(),
  body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must be longer than 3 characters.').trim().isLength({ min: 3 }),
  body('description', 'Description must not be longer than 200 characters.').trim().isLength({ max: 200 }),
  body('num_in_stock', 'Number in stock must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('image_url', 'Image URL must not be empty.').trim().isLength({ min: 1 }),
  body('origin', 'Origin must not be emtpy.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password is incorrect.').trim().equals(process.env.PASSWORD),

  (req, res, next) => {
    const errors = validationResult(req);

    var product = new Product(
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        num_in_stock: req.body.num_in_stock,
        image_url: req.body.image_url,
        origin: req.body.origin,
        _id: req.params.id
      }
    )

    if (!errors.isEmpty()) {
      async.parallel({
        origins: function (callback) {
          Origin.find(callback);
        }
      },
      function (err, results) {
        if (err) return next(err);
        res.render('product_form', { title: 'Create product', origins: results.origins, product: product, errors: errors.array() })
      });
      return;
    } else {
      Product.findByIdAndUpdate(req.params.id, product, {}, function(err, theproduct) {
        if (err) return next(err);
        res.redirect(theproduct.url);
      })
    }
  }
]

exports.product_detail = function(req, res, next) {
  async.parallel(
    {
      product: function (callback) {
        Product.findById(req.params.id).populate('origin').exec(callback);
      }
    },
    function (err, results) {
      if (err) return next(err);
      if (results.product == null) {
        var err = new Error('Product not found');
        err.status = 404;
        return next(err);
      }
      res.render('product_detail', {
        title: results.product.name, product: results.product,
      })
    }
  )
}
