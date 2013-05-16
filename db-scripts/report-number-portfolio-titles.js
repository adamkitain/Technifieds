var db = new Mongo().getDB('rescour_scraper');

var land = db.properties.find({propertyType: 'Land'}).toArray();

for (var i = 0; i < land.length; i ++) {
    var portfolioProperties = land[i].portfolio;

    print();
    print(land[i].title);
    for (var j = 0; j < portfolioProperties.length; j ++) {
        print(portfolioProperties[j].title);
    }
}
