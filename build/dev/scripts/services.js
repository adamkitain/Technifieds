'use strict';

angular.module('scraper.app')
    .factory('Property', ['Contact', 'Image', 'UnitMix', '$_api', '$http', '$q', 'TourDate', 'Portfolio', 'States',
        function (Contact, Image, UnitMix, $_api, $http, $q, TourDate, Portfolio, States) {
            var Property = function Property(data) {
                if (data.data._id === 'undefined') {
                    throw new Error('Property has no id');
                }
                var self = this;
                this.tag = data.tag;
                this.$isSelected = false;
                this.data = {
                    _id: data.data._id,
                    _checksum: data.data._checksum,
                    _temp: data.data._temp,
                    _scrubbed: data.data._scrubbed,
                    _deployed: data.data._deployed,
                    title: data.data.title || "",
                    site: data.data.site || "",
                    broker: data.data.broker || "",
                    numUnits: data.data.numUnits || "",
                    yearBuilt: data.data.yearBuilt || "",
                    description: data.data.description || "",
                    flyer: data.data.flyer,
                    callForOffers: data.data.callForOffers ? new Date(data.data.callForOffers) : undefined,
                    propertyStatus: data.data.propertyStatus || "",
                    thumbnail: data.data.thumbnail,
                    address: data.data.address || {},
                    portfolio: [],
                    unitMix: [],
                    contacts: [],
                    tourDates: [],
                    images: []
                };

                angular.forEach(data.data.contacts, function (value, key) {
                    self.data.contacts.push(new Contact(value));
                });

                angular.forEach(data.data.images, function (value, key) {
                    self.data.images.push(new Image(value));
                });

                angular.forEach(data.data.tourDates, function (value, key) {
                    self.data.tourDates.push(new TourDate(value));
                });

                angular.forEach(data.data.unitMix, function (value, key) {
                    self.data.unitMix.push(new UnitMix(value));
                });

                angular.forEach(data.data.portfolio, function (value, key) {
                    self.data.portfolio.push(new Portfolio(value));
                });

                this.scrubbed = false;
                this.percentComplete = this.getPercentComplete();
                this.checkStateAbbreviation();
            };

            Property.query = function () {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/properties/',
                    config = angular.extend({
                    }, $_api.config);

                $http.get(path, config).then(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject();
                    }
                );
                return defer.promise;
            };

            Property.deploy = function (_checksums) {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/deploy',
                    config = angular.extend({
                    }, $_api.config),
                    body = JSON.stringify(_checksums);

                $http.post(path, body, config).then(function (response) {
                    console.log("Successful deploy", response);
                    defer.resolve(response);
                }, function (response) {
                    console.log("Failed to deploy", response);
                    defer.reject(response);
                });

                return defer.promise;
            };

            Property.prototype.$save = function () {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/properties/' + this.data._checksum,
                    config = angular.extend({
                    }, $_api.config),
                    body = JSON.stringify(this.data);

                $http.put(path, body, config).then(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response);
                    }
                );

                return defer.promise;
            };

            Property.prototype.$remove = function () {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/properties/' + this.data._checksum,
                    config = angular.extend({
                    }, $_api.config),
                    body = JSON.stringify({});

                $http.delete(path, body, config).then(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response);
                    }
                );

                return defer.promise;
            };

            Property.prototype.$recover = function () {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/properties/' + this.data._checksum,
                    config = angular.extend({
                    }, $_api.config),
                    body = JSON.stringify({});

                $http.post(path, body, config).then(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response);
                    }
                );

                return defer.promise;
            };

            /** CONTACT MODIFIERS BEGIN **/
            Property.prototype.unionContacts = function (contacts) {
                return _.sortBy(
                    _.union(_.pluck(this.data.contacts, '_id'), _.pluck(contacts, '_id')),
                    function (num) {
                        return parseInt(num, 10);
                    }
                );
            };

            Property.prototype.getContact = function (id) {
                return _.find(this.data.contacts, function (value, key) {
                    return value._id == id;
                });
            };

            Property.prototype.removeContact = function (id) {
                this.data.contacts = _.reject(this.data.contacts, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.addContact = function (contact) {
                this.data.contacts.push(contact);
            };
            /** CONTACT MODIFIERS BEGIN **/

            /** IMAGE MODIFIERS BEGIN **/
            Property.prototype.unionImages = function (images) {
                return _.sortBy(
                    _.union(_.pluck(this.data.images, '_id'), _.pluck(images, '_id')),
                    function (num) {
                        return parseInt(num, 10);
                    }
                );
            };

            Property.prototype.getImage = function (id) {
                return _.find(this.data.images, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.removeImage = function (id) {
                this.data.images = _.reject(this.data.images, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.addImage = function (image) {
                this.data.images.push(image);
            };
            /** IMAGE MODIFIERS END **/

            /** TOUR DATE MODIFIERS BEGIN **/
            Property.prototype.unionTourDates = function (tourDates) {
                return _.sortBy(
                    _.union(_.pluck(this.data.tourDates, '_id'), _.pluck(tourDates, '_id')),
                    function (num) {
                        return parseInt(num, 10);
                    }
                );
            };

            Property.prototype.removeTourDate = function (id) {
                this.data.tourDates = _.reject(this.data.tourDates, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.addTourDate = function (tourDate) {
                this.data.tourDates.push(tourDate);
            };
            /** TOUR DATE MODIFIERS END **/

            /** PORTFOLIO MODIFIERS BEGIN **/
            Property.prototype.removePortfolio = function (id) {
                this.data.portfolio = _.reject(this.data.portfolio, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.addPortfolio = function (portfolio) {
                this.data.portfolio.push(portfolio);
            };
            /** PORTFOLIO MODIFIERS END **/

            /** UNION MIX MODIFIERS BEGIN **/
            Property.prototype.addUnitMix = function (unitMix) {
                this.data.unitMix.push(unitMix);
            };

            Property.prototype.removeUnitMix = function (id) {
                this.data.unitMix = _.reject(this.data.unitMix, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };

            Property.prototype.unionUnitMix = function (unitMix) {
                return _.sortBy(
                    _.union(_.pluck(this.data.unitMix, '_id'), _.pluck(unitMix, '_id')),
                    function (num) {
                        return parseInt(num, 10);
                    }
                );
            };

            Property.prototype.getUnitMix = function (id) {
                return _.find(this.data.unitMix, function (value, key) {
                    return value._id == id || value.$$hashKey == id;
                });
            };
            /** UNION MIX MODIFIERS BEGIN **/

            Property.prototype.getFields = function (model) {
                if (model === 'Contact') {
                    return ['name', 'phone', 'email'];
                } else {
                    return ['link', 'caption'];
                }
            };

            Property.prototype.checkStateAbbreviation = function () {
                var state = (this.data.address.state).replace(/\s+/g, '').toUpperCase();
                if (States.hasOwnProperty(state)) {
                    this.data.address.state = States[state];
                }

                return this.data.address.state;
            };

            Property.prototype.getPercentComplete = function () {
                var self = this,
                    totalFields = 0,
                    completedFields = 0,
                    ignore = ['_id', '$$hashKey', '_checksum', '_deployed', '_temp', '_scrubbed'];

                angular.forEach(this.data, function (dataVal, key) {
                    if (_.isArray(dataVal)) {
                        angular.forEach(dataVal, function (arrayObj, key) {
                            if (arrayObj && !_.isEmpty(arrayObj)) {
                                angular.forEach(arrayObj, function (arrayObjVal, key) {
                                    if (!_.contains(ignore, key)) {
                                        if (arrayObjVal) {
                                            completedFields += 1;
                                            totalFields += 1;
                                        } else {
                                            totalFields += 1;
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        if (_.isObject(dataVal)) {
                            angular.forEach(dataVal, function (dataObj, key) {
                                if (!_.contains(ignore, key)) {
                                    if (dataObj) {
                                        completedFields += 1;
                                        totalFields += 1;
                                    } else {
                                        totalFields += 1;
                                    }
                                }
                            });
                        } else {
                            if (!_.contains(ignore, key)) {
                                if (dataVal) {
                                    completedFields += 1;
                                    totalFields += 1;
                                } else {
                                    totalFields += 1;
                                }
                            }
                        }
                    }
                });

                return parseInt(((completedFields / totalFields) * 100), 10);
            };

            return Property;
        }])
    .factory('Properties', ['Property',
        function (Property) {
            var properties = {},
                conflicts = {};

            return {
                setProperties: function (data) {
                    properties = {};
                    conflicts = {};
                    angular.forEach(data, function (prop) {
                        if (prop.tag === 'conflict') {
                            if (prop.data._temp) {
                                conflicts[prop.data._checksum] = new Property(prop);
                            } else {
                                properties[prop.data._checksum] = new Property(prop);
                            }
                        } else {
                            properties[prop.data._checksum] = new Property(prop);
                        }
                    });

                    return _.map(properties, function (val) {
                        return val;
                    });
                },
                getProperties: function () {
                    return _.map(properties, function (val) {
                        return val;
                    });
                },
                getProperty: function (checksum) {
                    return properties[checksum];
                },
                getConflict: function (checksum) {
                    if (typeof checksum === 'undefined') {
                        return conflicts;
                    } else {
                        return conflicts[checksum];
                    }
                },
                getScrubbed: function () {
                    return _.filter(properties, function (value, key) {
                        return value.data._scrubbed;
                    });
                },
                getUnscrubbed: function () {
                    return _.filter(properties, function (value, key) {
                        return !value.data._scrubbed;
                    });
                }
            };
        }])
    .factory('Templates', function () {
        return {
            newProperty: '/views/new/newProperty.html',
            conflictProperty: '/views/conflict/conflictProperty.html',
            removedProperty: '/views/removed/removedProperty.html',
            okProperty: '/views/ok/okProperty.html',
            propertyDetails: '/views/partials/propertyDetails.html',
            main: '/views/raw/raw.html'
        };
    })
    .factory('Contact', function () {
        var Contact = function Contact(data) {
            this._id = data._checksum || Date.now();
            this._checksum = data._checksum;
            this.name = data.name || "";
            this.phone = data.phone || "";
            this.email = data.email || "";
        };

        return Contact;
    })
    .factory('Image', function () {
        var Image = function Image(data) {
            this._id = data._checksum || Date.now();
            this._checksum = data._checksum;
            this.link = data.link || "";
        };

        return Image;
    })
    .factory('TourDate', function () {
        var TourDate = function TourDate(data) {
            this._id = data._checksum || Date.now();
            this._checksum = data._checksum;
            this.date = new Date(data.date);
        };

        return TourDate;
    })
    .factory('Portfolio', function () {
        var TourDate = function TourDate(data) {
            this._id = data._checksum || Date.now();
            this._checksum = data._checksum;
            this.title = data.title || "";
        };

        return TourDate;
    })
    .factory('UnitMix', function () {
        var UnitMix = function UnitMix(data) {
            this._id = data._checksum || Date.now();
            this._checksum = data._checksum;
            this.type = data.type || "";
            this.units = data.units || "";
            this.sqft = data.sqft || "";
            this.rent = data.rent || "";
        };

        UnitMix.prototype.calculateRentpsqft = function () {
            if (this.rent && this.sqft) {
                this.rentpsqft = parseFloat(this.rent / this.sqft).toFixed(2);
            } else {
                this.rentpsqft = undefined;
            }

            return this.rentpsqft;
        }

        return UnitMix;
    })
    .factory('$_api', ['$http', function ($http) {
        var urls = {
            dev: "http://10.0.1.75:8000",
            local: ""
        };
        return {
            config: {
                headers: {'Content-Type': 'application/json'},
                withCredentials: true
            },
            path: urls.local
        };
    }])
    .factory('States', function () {
        return {
            "AL": "Alabama",
            "AK": "Alaska",
            "AS": "American Samoa",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "District Of Columbia",
            "FM": "Federated States Of Micronesia",
            "FL": "Florida",
            "GA": "Georgia",
            "GU": "Guam",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MH": "Marshall Islands",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "MP": "Northern Mariana Islands",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PW": "Palau",
            "PA": "Pennsylvania",
            "PR": "Puerto Rico",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VI": "Virgin Islands",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        };
    });
