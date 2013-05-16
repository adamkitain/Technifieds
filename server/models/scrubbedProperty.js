var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId,
    propertySchema = require('./property').schema;

/*
 * ScrubbedProperty model
 */

var scrubbedPropertySchema = propertySchema;

scrubbedPropertySchema.statics.findByChecksums = function(checksums, cb) {
    ScrubbedProperty.find({ _checksum: { $in: checksums }}, cb);
}

scrubbedPropertySchema.statics.createWithChecksum = function(obj, cb) {
    obj._checksum = new ObjectId().toString();
    ScrubbedProperty.create(obj, cb);
}

scrubbedPropertySchema.statics.updateByChecksum = function(obj, cb) {
    delete obj._id;
    obj._scrubbed = true;
    obj._deployed = false;
    ScrubbedProperty.update({ _checksum: obj._checksum }, obj, { upsert: true }, cb);
}

scrubbedPropertySchema.statics.deployByChecksums = function(checksums, cb) {
    ScrubbedProperty.update({ _checksum: { $in: checksums }}, { _deployed: true }, { multi: true }, cb);
}

var ScrubbedProperty = mongoose.model('ScrubbedProperty', scrubbedPropertySchema, 'properties');

exports.model = ScrubbedProperty;
