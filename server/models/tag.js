var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*
 * Tag model
 */

var tagSchema = new Schema({
    _id: String,
    _current: Boolean,
    itemKey: String,
    tag: String
});

tagSchema.statics.findCurrent = function(itemKey, cb) {
    if (typeof itemKey === 'function') {
        Tag.find({ _current: true }, itemKey);
    } else {
        Tag.findOne({ itemKey: itemKey, _current: true }, cb);
    }
}

var Tag = mongoose.model('Tag', tagSchema, 'tags');

exports.model = Tag;
