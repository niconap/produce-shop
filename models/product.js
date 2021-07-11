var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 50 },
  price: { type: Number, required: true },
  description: { type: String, required: true, minLength: 3, maxLength: 200 },
  num_in_stock: {type: Number, required: true },
  origin: { type: Schema.Types.ObjectId, ref: 'Origin' },
  image_url: { type: String, required: true }
})

ProductSchema.virtual('url').get(function() {
  return '/store/product/' + this._id;
})

module.exports = mongoose.model('Product', ProductSchema);