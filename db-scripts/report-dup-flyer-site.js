var db = new Mongo().getDB('rescour_scraper');

var properties = db.properties.find().toArray();

for (var i = 0; i < properties.length; i ++) {
    if (properties[i].flyer == properties[i].site) {
	print(properties[i].title);
    }
}
