var db = new Mongo().getDB('rescour_scraper');

var properties = db.properties.find().toArray();

for (var i = 0; i < properties.length; i ++) {
    for (var j = 0; j < properties[i].images.length; j ++) {
	properties[i].images[j].weight = properties[i].images[j]._weight;
	delete properties[i].images[j]._weight;
    }

    db.properties.update({ _id: properties[i]._id }, properties[i]);
}
