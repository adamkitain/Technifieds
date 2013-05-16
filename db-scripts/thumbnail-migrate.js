var db = new Mongo().getDB('rescour_scraper');

var listings = db.properties_test.find().toArray();

for (var i = 0; i < listings.length; i ++) {
    if (listings[i].thumbnail) {
    	listings[i].thumbnail = [ { link: listings[i].thumbnail } ];
    } else {
	listings[i].thumbnail = [];
    }
    db.properties_test.update({ _id: listings[i]._id }, listings[i]);
}
