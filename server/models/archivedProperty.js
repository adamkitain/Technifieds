var propertySchema = require('./property').schema,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*
 * ArchivedProperty model
 */

var archivedPropertySchema = new Schema({
    data: [propertySchema],
    archived: Date
}, { safe: true, strict: true });

var ArchivedProperty = mongoose.model('archivedProperty', archivedPropertySchema, 'archives');

exports.model = ArchivedProperty;
exports.schema = archivedPropertySchema;
