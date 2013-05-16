var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    propertySchema = require('./property').schema;

/*
 * RawProperty model
 */

var rawPropertySchema = propertySchema;

rawPropertySchema.statics.findOnlyTemp = function(cb) {
    RawProperty.find({_temp: true, _scrubbed: false }, cb);
}

rawPropertySchema.statics.makePermanent = function(checksums, cb) {
    RawProperty.update({ _checksum: { $in: checksums }}, { _temp: false }, { multi: true }, cb);
}

rawPropertySchema.statics.scrub = function(checksum, cb) {
    RawProperty.update({ _checksum: checksum }, { _scrubbed: true }, cb);
}

rawPropertySchema.statics.process = function(data) {
    function generateChecksum(seed) {
        seed = seed.replace(/[^a-zA-Z\d]/, '').toLowerCase();
        var md5 = crypto.createHash('md5');
        md5.update(seed);
        return md5.digest('hex');
    }

    function assignChecksum(obj) {
        var seed = '';
        for (var field in obj) {
            if (obj.hasOwnProperty(field) && typeof obj === 'string') {
                seed += obj[field];
            }
        }
        obj._checksum = generateChecksum(seed);
    }
    
    function assignChecksums(objs) {
        for (var i = 0; i < objs.length; i ++) {
            if (!objs[i]._checksum) {
                assignChecksum(objs[i]);
            }
        }
    }

    assignChecksums(data.images);
    assignChecksums(data.contacts);

    return new RawProperty(data);
}

var RawProperty = mongoose.model('RawProperty', rawPropertySchema, 'raw');

exports.model = RawProperty;
