var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/* 
 * ProductionMap model
 */

var productionMapSchema = new Schema({
    itemKey: String,
    productionID: String
}, { safe: true, strict: true });

productionMapSchema.statics.findByKey = function(key, cb) {
    ProductionMap.findOne({ itemKey: key }, cb);
}
productionMapSchema.statics.map = function(property, prodId, cb) {
    ProductionMap.update({ itemKey: property._checksum }, { productionID: prodId }, { upsert: true }, cb); 
}

var ProductionMap = mongoose.model('ProductionMap', productionMapSchema, 'productionMap');

exports.schema = productionMapSchema;
exports.model = ProductionMap;
