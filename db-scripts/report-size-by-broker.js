var db = new Mongo().getDB('rescour_scraper'),
    brokers = ['HFF', 'ARA', 'CBRE', 'Cushman & Wakefield', 'Jones Lang LaSalle', 'Rock Apartment Advisors', 'Capital Advisors', 'Brown Realty Advisors'];

for (var i = 0; i < brokers.length; i ++) {
    var raw = db.raw.find({broker: brokers[i]}).toArray();
    var properties = db.properties.find({broker: brokers[i]}).toArray();
    var removed = [];

    for (var j = 0; j < properties.length; j ++) {
	var _raw = db.raw.find({ _checksum: properties[j]._checksum }).toArray();

	if (_raw.length == 0) {
	    removed.push(properties[j].title);
	}
    }

    print(brokers[i] + ':');
    print(raw.length + ' properties in last scrape, ' + properties.length + ' total properties scrubbed.');
    print(raw.length - properties.length + ' properties that were in the last scrape, but are not scrubbed.');
    print(properties.length - removed.length + ' properties that were in the last scrape, and are scrubbed.');
    print(removed.length + ' properties that were not in the last scrape, but are scrubbed. These may be removed properties:')

    for (var j = 0; j < removed.length; j ++) {
	print(removed[j]);
    }
}
