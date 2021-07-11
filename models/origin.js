var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OriginSchema = new Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
  description: { type: String, minLength: 3, maxLength: 200, required: true },
})

OriginSchema.virtual('url').get(function() {
  return '/store/origin/' + this._id;
})

module.exports = mongoose.model('Origin', OriginSchema);