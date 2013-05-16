var db = new Mongo().getDB('rescour_scraper');

function findMissingStrings(_properties, key) {
    for (var i = 0; i < _properties.length; i++) {
        if (!_properties[i][key]) {
        	print(_properties[i].title);
        }
    }
}

function findStrings(_properties, key) {
    for (var i = 0; i < _properties.length; i++) {
        if (_properties[i][key]) {
        	print(_properties[i].title);
        }
    }
}

function findNonNumbers(_properties, key) {
    for (var i = 0; i < _properties.length; i++) {
	if (isNaN(_properties[i][key])) {
	    print(_properties[i].title);
	}
    }
}

function findIncompleteArrays(_properties, key, minimum) {
    for (var i = 0; i < _properties.length; i++) {
	if (_properties[i][key] instanceof Array) {
	    if (_properties[i][key].length < minimum) {
		print(_properties[i].title);
	    }
	} else {
	    print('WARNING: ' + _properties[i].title + ' does not have an array at ' + key);
	}
    }
}

function findIncompleteAddresses(_properties) {
    for (var i = 0; i < _properties.length; i++) {
	if (
	    !_properties[i].address.street1 ||
	    !_properties[i].address.city ||
	    !_properties[i].address.state ||
	    !_properties[i].address.zip
	) {
	    print(_properties[i].title);
	}
    }
}
function findCompleteAddresses(_properties) {
    for (var i = 0; i < _properties.length; i++) {
	if (
	    _properties[i].address.street1 ||
	    _properties[i].address.city ||
	    _properties[i].address.state ||
	    _properties[i].address.zip
	) {
	    print(_properties[i].title);
	}
    }
}

var properties = db.properties.find().toArray(),
    apartments = db.properties.find({propertyType: 'Apartment'}).toArray();
    apartmentsAndLand = apartments.concat(db.properties.find({propertyType: 'Land'}).toArray());
    portfolios = db.properties.find({propertyType: 'Portfolio'}).toArray();

print('Properties that are on the stage and missing property type:');
findMissingStrings(properties, 'propertyType');

print();
print('Properties that are on the stage and missing property status:');
findMissingStrings(properties, 'propertyStatus');

print();
print('Apartments that are on the stage and don\'t have a year built');
findMissingStrings(apartments, 'yearBuilt');

print();
print('Apartments that are on the stage and don\'t have number of units');
findMissingStrings(apartments, 'numUnits');

print();
print('Properties that have no images');
findIncompleteArrays(properties, 'images', 1);

print();
print('Apartments that have invalid year built');
findNonNumbers(apartments, 'yearBuilt');

print();
print('Apartments that have invalid number of units');
findNonNumbers(apartments, 'numUnits');

print();
print('Apartments and Land that have incomplete addresses');
findIncompleteAddresses(apartmentsAndLand);

print();
print('Portfolios that have addresses');
findCompleteAddresses(portfolios);

print();
print('Portfolios that have year built');
findStrings(portfolios, 'yearBuilt');

print();
print('Portfolios with less than 2 properties');
findIncompleteArrays(portfolios, 'portfolio', 2);
