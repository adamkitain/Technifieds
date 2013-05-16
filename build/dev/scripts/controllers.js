'use strict';

angular.module('scraper.app').
    controller('MainCtrl', ['$scope', 'Properties', 'Property', 'Templates', 'Contact', 'Image', '$_api', '$http', 'loadProperties', 'TourDate', 'UnitMix', 'Portfolio',
        function ($scope, Properties, Property, Templates, Contact, Image, $_api, $http, loadProperties, TourDate, UnitMix, Portfolio) {
            $scope.properties = Properties.setProperties(loadProperties.data);
            $scope.selectedProperty = null;
            $scope.previousProperty = null;
            $scope.mainView = Templates.main;
            $scope.removedView = Templates.removedPropertyView;

            $scope.propertyStatuses = ['Marketing', 'Under Contract', 'Expired', 'Under LOI'];
            $scope.unitMixTypes = [
                '1 BR / 1 BA', '1 BR / 1.5 BA', '2 BR / 1 BA', '2 BR / 1.5 BA', '2 BR / 2 BA', '3 BR / 2 BA', '3 BR / 2.5 BA', '3 BR / 3 BA', '4 BR / 2 BA', '4 BR / 2.5 BA', '4 BR / 3 BA',
                '1 BR / 1 BA S', '1 BR / 1.5 BA S', '2 BR / 1 BA S', '2 BR / 1.5 BA S', '2 BR / 2 BA S', '3 BR / 2 BA S', '3 BR / 2.5 BA S', '3 BR / 3 BA S', '4 BR / 2 BA S', '4 BR / 2.5 BA S', '4 BR / 3 BA S',
                'AVERAGE', 'Studio'
            ];

            $scope.tags = [
                {tag: 'ok', selected: false},
                {tag: 'new', selected: false},
                {tag: 'conflict', selected: false},
                {tag: 'removed', selected: false}
            ];

            $scope.selectAll = false;

            $scope.editProperty = function (property) {
                if (property) {
                    $scope.selectedProperty = property;
                    $scope.mainView = Templates.propertyDetails;
//                    $scope.mainView = Templates[property.tag + "Property"];
//                    if (property.tag === 'conflict') {
//                        $scope.conflictProperty = Properties.getConflict(property.data._checksum);
//                    }
                }
            };

            $scope.setMainView = function (_view) {
                $scope.previous = $scope.selectedProperty;
                $scope.selectedProperty = null;
                $scope.mainView = Templates[_view];
            };

            $scope.toggleTag = function (tag) {
                tag.selected = !tag.selected;
            };

            $scope.toggleSelectAll = function () {
                $scope.selectAll = !$scope.selectAll;

                var scrubbedProperties = _.filter($scope.properties, function (value, key) {
                    return value.data._scrubbed && $scope.tagIsSelected(value.tag);
                });

                angular.forEach(scrubbedProperties, function (value, key) {
                    value.$isSelected = $scope.selectAll;
                });
            };

            $scope.tagIsSelected = function (tag) {
                // If all are false, return true
                if (_.every(_.pluck($scope.tags, 'selected'), function (value) {
                    return value === false;
                })) {
                    return true;
                } else {
                    // check to see if tag is selected
                    return _.find($scope.tags,function (value, key) {
                        return value.tag === tag;
                    }).selected;
                }
            };

            $scope.changeTag = function (_tag) {
                if (_tag === 'ok' && Properties.getConflict($scope.selectedProperty.data._id)) {
                    $scope.selectedProperty.tag = 'conflict';
                } else {
                    $scope.selectedProperty.tag = _tag;
                }
                $scope.editProperty($scope.selectedProperty);

            };

            $scope.save = function (property) {
                property.$save()
                    .then(function (response) {
                        return Property.query();
                    })
                    .then(function (response) {
                        $scope.properties = Properties.setProperties(response.data);
                        $scope.mainView = Templates.main;
                    });
            };

            $scope.deploy = function () {
                var deployProperties = _.filter($scope.properties, function (value, key) {
                        return value.$isSelected && value.data._scrubbed;
                    }),
                    deployIds = _.map(deployProperties, function (value, key) {
                        return value.data._checksum;
                    });

                Property.deploy(deployIds)
                    .then(function (response) {
                        angular.forEach(deployProperties, function (value, key) {
                            value.$isSelected = false;
                        });
                        $scope.selectAll = false;
                        return Property.query();
                    })
                    .then(function (response) {
                        $scope.properties = Properties.setProperties(response.data);
                    });
            };

            $scope.removeProperty = function (property) {
                var checksum = property.data._checksum;
                property.$remove()
                    .then(function (response) {
                        return Property.query();
                    })
                    .then(function (response) {
                        $scope.properties = Properties.setProperties(response.data);
                        $scope.editProperty(Properties.getProperty(checksum));
                    });
            };

            $scope.recoverProperty = function (property) {
                var checksum = property.data._checksum;

                property.$recover()
                    .then(function (response) {
                        return Property.query();
                    })
                    .then(function (response) {
                        $scope.properties = Properties.setProperties(response.data);
                        $scope.editProperty(Properties.getProperty(checksum));
                    });
            };

            $scope.createNewContact = function (property) {
                var newContact = new Contact({});
                property.addContact(newContact);
            };

            $scope.createNewImage = function (property) {
                var newImage = new Image({});
                property.addImage(newImage);
            };

            $scope.createNewTourDate = function (property) {
                var newTourDate = new TourDate({});
                property.addTourDate(newTourDate);
            };

            $scope.createNewUnitMix = function (property) {
                var newUnitMix = new UnitMix({});
                property.addUnitMix(newUnitMix);
            };

            $scope.createNewPortfolio = function (property) {
                var newPortfolio = new Portfolio({});
                property.addPortfolio(newPortfolio);
            }

            $scope.removeContact = function (property, id) {
                property.removeContact(id);
            };

            $scope.removeImage = function (property, id) {
                property.removeImage(id);
            };
        }])
    .controller('AppCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

    }])
    .controller('LoginCtrl', ['$scope',
        function ($scope) {
            $scope.creds = {};

            $scope.login = function () {
                $scope.$emit("auth#loginRequest", $scope.creds);
            };

        }]);