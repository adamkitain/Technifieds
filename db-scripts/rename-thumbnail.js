var db = new Mongo().getDB('rescour_scraper');

var properties = db.properties_test.find().toArray();

for (var i = 0; i < properties.length; i ++) {
    db.properties_test.update({ _id: properties[i]._id }, { $rename: { thumbnail: 'thumbnails' }});
}
