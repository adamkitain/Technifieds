var RawProperty = require('./rawProperty'),
    ScrubbedProperty = require('./scrubbedProperty'),
    Tag = require('./tag'),
    PropertyWrapper = require('./propertyWrapper'),
    ProductionMap = require('./productionMap'),
    ArchivedProperty = require('./archivedProperty');

function Models() {}

Models.prototype.RawProperty = RawProperty;
Models.prototype.ScrubbedProperty = ScrubbedProperty;
Models.prototype.Tag = Tag;
Models.prototype.PropertyWrapper = PropertyWrapper;
Models.prototype.ProductionMap = ProductionMap;
Models.prototype.ArchivedProperty = ArchivedProperty;

module.exports = new Models;
