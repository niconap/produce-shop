var Product = require('../models/product');
var Origin = require('../models/origin');
const { body, validationResult} = require('express-validator');

var async = require('async');

exports.origin_create_get = function(req, res, next) {
  res.render('origin_form', { title: 'Create origin' })
}

exports.origin_create_post = [
  (req, res, next) => {
    next();
  },

  body('name', 'Name must be longer than 3 characters.').trim().isLength( { min: 3 }).escape(),
  body('name', 'Name must not be longer than 50 characters.').trim().isLength( { max: 50 }).escape(),
  body('description', 'Description must be longer than 3 characters.').trim().isLength({ min: 3 }).escape(),
  body('description', 'Description must not be longer than 200 characters.').trim().isLength({ max: 200 }).escape(),
  body('password', 'Password is incorrect.').trim().equals('somepassword'),

  (req, res, next) => {
    const errors = validationResult(req);

    var origin = new Origin(
      {
        name: req.body.name,
        description: req.body.description,
      }
    )

    if (!errors.isEmpty()) {
      res.render('origin_form', { title: 'Create origin', errors: errors.array()  })
      return;
    } else {
      origin.save(function (err) {
        if (err) return next(err);
        res.redirect(origin.url);
      });
    }
  }
]

exports.origin_delete_get = function(req, res, next) {
  async.parallel({
    origin: function (callback) {
      Origin.findById(req.params.id).populate('origin').exec(callback);
    },
    products: function (callback) {
      Product.find({ 'origin': req.params.id }).populate('origin').exec(callback);
    }
  },
  function (err, results) {
    if (err) return next(err);
    if (results.origin == null) {
      res.redirect('/store/');
    }
    res.render('origin_delete', { title: 'Delete origin', origin: results.origin, products: results.products });
  })
}

exports.origin_delete_post = [
  (req, res, next) => {
    next();
  },

  body('password', 'Password is incorrect.').trim().equals('somepassword'),

  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      async.parallel({
        origin: function (callback) {
          Origin.findById(req.params.id).populate('origin').exec(callback);
        },
        products: function (callback) {
          Product.find({ 'origin': req.params.id }).populate('origin').exec(callback);
        }
      },
      function (err, results) {
        if (err) return next(err);
        if (results.origin == null) {
          res.redirect('/store/');
        }
        res.render('origin_delete', { title: 'Delete origin', origin: results.origin, products: results.products, errors: errors.array() });
      })
      return;
    } else {
      Origin.findByIdAndRemove(req.body.originid, function deleteOrigin (err) {
        if (err) return next(err);
        res.redirect('/store/');
      })
    }
  }
]

exports.origin_update_get = function(req, res, next) {
  async.parallel({
    origin: function (callback) {
      Origin.findById(req.params.id).exec(callback);
    }
  },
  function (err, results) {
    if (err) return next(err);
    if (results.origin==null) {
      var err = new Error('Origin not found');
      err.status = 404;
      return next(err);
    }
    res.render('origin_form', {title: 'Update origin', origin: results.origin, origins: results.origins })
  })
}

exports.origin_update_post = [
  (req, res, next) => {
    next();
  },

  body('name', 'Name must be longer than 3 characters.').trim().isLength( { min: 3 }).escape(),
  body('name', 'Name must not be longer than 50 characters.').trim().isLength( { max: 50 }).escape(),
  body('description', 'Description must be longer than 3 characters.').trim().isLength({ min: 3 }).escape(),
  body('description', 'Description must not be longer than 200 characters.').trim().isLength({ max: 200 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var origin = new Origin(
      {
        name: req.body.name,
        description: req.body.description,
        _id: req.params.id
      }
    )

    if (!errors.isEmpty()) {
      res.render('origin_form', { title: 'Create origin', errors: errors.array()  })
      return;
    } else {
      Origin.findByIdAndUpdate(req.params.id, origin, {}, function(err, theorigin) {
        if (err) return next(err);
        res.redirect(theorigin.url);
      })
    }
  }
]

exports.origin_detail = function(req, res, next) {
  async.parallel(
    {
      origin: function (callback) {
        Origin.findById(req.params.id).exec(callback);
      },
      products: function (callback) {
        Product.find({ origin: req.params.id }).exec(callback);
      }
    },
    function (err, results) {
      if (err) return next(err);
      if (results.origin == null) {
        var err = new Error('Origin not found');
        err.status = 404;
        return next(err);
      }
      res.render('origin_detail', {
        title: results.origin.name, origin: results.origin, products: results.products
      })
    }
  )
}