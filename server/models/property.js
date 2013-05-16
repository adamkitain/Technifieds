var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var contactSchema = new Schema({
    _id: String,
    _checksum: String,
    name: String,
    phone: String,
    email: String
}, { safe: true, strict: true });

var imageSchema = new Schema({
    _id: String,
    _checksum: String,
    weight: Number,
    link: String,
    caption: String
}, { safe: true, strict: true });

var tourDateSchema = new Schema({
    date: String    
}, { safe: true, strict: true });

var unitMixSchema = new Schema({
    type: String,
    units: String,
    sqft: String,
    rent: String,
    rentpsqft: String
}, { safe: true, strict: true });

var portfolioSchema = new Schema({
    title: String
}, { safe: true, strict: true });

var propertySchema = new Schema({
    _checksum: String,
    _temp: Boolean,
    _scrubbed: Boolean,
    _deployed: Boolean,
    _ignored: Boolean,
    site: String,
    title: String,
    broker: String,
    address: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        zip: String
    },
    numUnits: String,
    yearBuilt: String,
    description: String,
    callForOffers: String,
    acres: String,
    propertyStatus: String,
    propertyType: String,
    flyer: String,
    unitMix: [unitMixSchema],
    contacts: [contactSchema],
    images: [imageSchema], 
    thumbnails: [imageSchema],
    tourDates: [tourDateSchema],
    portfolio: [portfolioSchema]
}, { safe: true, strict: true });

exports.schema = propertySchema;
