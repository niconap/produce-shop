#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Product = require('./models/product');
var Origin = require('./models/origin');


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = [];
var origins = [];

function productCreate(name, price, description, num_in_stock, origin, image_url, cb) {
  productdetail = {
    name: name,
    price: price,
    description: description,
    num_in_stock: num_in_stock,
    image_url: image_url,
    origin: origin,
  }
  
  var product = new Product(productdetail);
       
  product.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Product: ' +product);
    products.push(product)
    cb(null, product)
  }  );
}

function originCreate(name, description, cb) {
  var origin = new Origin({
    name: name,
    description: description,
  });
       
  origin.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Origin: ' + origin);
    origins.push(origin)
    cb(null, origin);
  }   );
}


function createOrigins(cb) {
    async.series([
        function(callback) {
          originCreate("The Netherlands", "All of this produce comes from the beautiful country of The Netherlands! One of the biggest exporters of agricultural products.", callback);
        },
        function(callback) {
          originCreate("United States of America", "All of this produce comes from the United States of America, the world's biggest exporter of agricultural products.", callback);
        },
        function(callback) {
          originCreate("India", "All of this produce comes from the wonderful country of India, rich in culture AND crops!", callback);
        },
        ],
        // optional callback
        cb);
}


function createProducts(cb) {
    async.parallel([
        function(callback) {
          productCreate("Cucumber", 1.50, "Cucumbers are a long, green vegetable with a refreshing taste!", 50, origins[0], "https://www.johnnyseeds.com/dw/image/v2/BBBW_PRD/on/demandware.static/-/Sites-jss-master/default/dw1e097d9a/images/products/vegetables/03885_01_sv4719cs.jpg", callback);
        },
        function(callback) {
          productCreate("Indian eggplant", 2.00, "Indian eggplants are, unsurprisingly, from India! These eggplants are small vegetables that look like little eggs.", 20, origins[2], "https://www.gardeningknowhow.com/wp-content/uploads/2019/01/indian-eggplant-400x267.jpg", callback)
        },
        function(callback) {
          productCreate("Corn", 1.75, "Corn is a vegetable that originates in America. It's famous all over the world for its amazing taste!", 40, origins[1], "https://www.pritikin.com/wp/wp-content/uploads/2014/03/corn.jpg", callback)
        }
        ],
        // optional callback
        cb);
}

async.series([
    createOrigins,
    createProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Products: '+products);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




