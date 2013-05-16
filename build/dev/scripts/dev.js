'use strict';

angular.module('scraper.app.dev', ['scraper.app', 'ngMockE2E'])
    .run(['$httpBackend', function ($httpBackend) {
        var NUM_DATA = 1;

        function randomTag() {
            var tagMap = ['new', 'ok'];
            return tagMap[parseInt(Math.random() * 2)];
        }

        var props = [];
        for (var i = 0; i < NUM_DATA; i++) {
            var prop = {};
            prop.tag = randomTag();
            if (i % 4 === 0) {
                prop.data = {
                    _temp: false,
                    _id: i,
                    _checksum: i,
                    title: 'Property ' + i,
                    site: 'site' + i + '.com',
                    broker: 'broker' + i,
                    address: {
                        street1: '1234 Main St.',
                        street2: '',
                        city: 'Atlanta',
                        state: 'GA',
                        zip: '12345'
                    },
                    numUnits: '100',
                    yearbuilt: '1999',
                    contacts: [
                        {
                            _checksum: i * 1000,
                            name: 'John Doe',
                            phone: '123-456-7890',
                            email: 'john.doe@gmail.com'
                        },
                        {
                            _checksum: i * 1001,
                            name: 'John Doe 2',
                            phone: '123-456-7890',
                            email: 'john.doe2@gmail.com'
                        }
                    ],
                    images: [
                        {
                            _checksum: i * 1000,
                            link: 'site1.com/link1',
                            caption: 'Caption 1'
                        },
                        {
                            _checksum: i * 1001,
                            link: 'site1.com/link2',
                            caption: 'Caption 1'
                        },
                        {
                            _checksum: i * 1002,
                            link: 'site1.com/link3',
                            caption: 'Caption 1'
                        }
                    ]
                }
            } else {
                prop.data = {
                    _id: i,
                    _temp: false,
                    _checksum: i,
                    title: 'Property ' + i,
                    site: 'site' + i + '.com',
                    broker: 'broker' + i,
                    address: {
                        street1: '1234 Main St.',
                        street2: '',
                        city: 'Atlanta',
                        state: 'GA',
                        zip: '3013'
                    },
                    numUnits: '100',
                    yearbuilt: '1999',
                    contacts: [
                        {
                            _checksum: i * 1000,
                            name: 'John Doe',
                            phone: '123-641-3132',
                            email: 'john@gmail.com'
                        },
                        {
                            _checksum: i * 1001,
                            name: 'John Doe 2',
                            phone: '123-456-7681',
                            email: ''
                        }
                    ],
                    images: [
                        {
                            _checksum: i * 1000,
                            link: 'site1.com/link1',
                            caption: '123'
                        },
                        {
                            _checksum: i * 1001,
                            link: 'site1.com/link2',
                            caption: ''
                        },
                        {
                            _checksum: i * 1002,
                            link: 'site1.com/link3',
                            caption: ''
                        }
                    ]
                }
            }

            props.push(prop);
        }

//        for (var i = 100; i < 150; i++) {
//            var prop = {};
//            var conflictProp = {}
//            prop.tag = 'conflict';
//            prop.data = {
//                _temp: false,
//                _id: i,
//                _checksum: i,
//                title: 'Property ' + i,
//                site: 'site' + i + '.com',
//                broker: 'broker' + i,
//
//                numUnits: '100',
//                yearbuilt: '1999',
//                address: {
//                    street1: '1234 Main St.',
//                    street2: '',
//                    city: 'Atlanta',
//                    state: 'GA',
//                    zip: '12345'
//                },
//                contacts: [
//                    {
//                        _checksum: i * 1000,
//                        name: 'John Doe',
//                        phone: '123-456-7890',
//                        email: 'john.doe@gmail.com'
//                    },
//                    {
//                        _checksum: i * 1001,
//                        name: 'John Doe 2',
//                        phone: '123-456-7890',
//                        email: 'john.doe2@gmail.com'
//                    }
//                ],
//                images: [
//                    {
//                        _checksum: i * 1000,
//                        link: 'site1.com/link1',
//                        caption: 'Caption 1'
//                    },
//                    {
//                        _checksum: i * 1001,
//                        link: 'site1.com/link2',
//                        caption: 'Caption 1'
//                    },
//                    {
//                        _checksum: i * 1002,
//                        link: 'site1.com/link3',
//                        caption: 'Caption 1'
//                    }
//                ]
//            }
//
//            conflictProp.tag = 'conflict';
//
//            if (i % 3 === 0) {
//                conflictProp.data = {
//                    _id: i,
//                    _temp: true,
//                    _checksum: i,
//                    title: 'Property ' + i,
//                    site: 'site' + i + '.com',
//                    broker: 'broker' + i,
//                    numUnits: '100',
//                    yearbuilt: '2000',
//                    address: {
//                        street1: '1234 Main St.',
//                        street2: '',
//                        city: 'Atlanta',
//                        state: 'GA',
//                        zip: '12345'
//                    },
//                    contacts: [
//                        {
//                            _checksum: i * 1000,
//                            name: 'John Doe',
//                            phone: '123-456-7890',
//                            email: 'john.doe@gmail.com'
//                        }
//                    ],
//                    images: [
//                        {
//                            _checksum: i * 1000,
//                            link: 'site1.com/link1',
//                            caption: 'Caption 1'
//                        },
//                        {
//                            _checksum: i * 1001,
//                            link: 'site1.com/link2',
//                            caption: 'Caption 1'
//                        }
//                    ]
//                };
//            } else {
//                conflictProp.data = {
//                    _id: i,
//                    _temp: true,
//                    _checksum: i,
//                    title: 'Property ' + i,
//                    site: '',
//                    broker: '',
//                    numUnits: '',
//                    yearbuilt: '',
//                    address: {
//                        street1: '1234 Main St.',
//                        street2: '',
//                        city: 'Atlanta',
//                        state: '',
//                        zip: ''
//                    },
//                    contacts: [
//                        {
//                            _checksum: i * 1000,
//                            name: 'John Doe',
//                            phone: '123-456-7890',
//                            email: 'john.doe@gmail.com'
//                        }
//                    ],
//                    images: [
//                        {
//                            _checksum: i * 1000,
//                            link: 'site1.com/link1',
//                            caption: 'Caption 1'
//                        }
//                    ]
//                };
//            }
//
//            props.push(prop);
//            props.push(conflictProp);
//        }

        $httpBackend.whenGET('/api/properties/').respond(props);
        $httpBackend.whenGET('/api/auth/check').respond({user: "asdf"});
        $httpBackend.whenGET(/\/api\/properties\/[0-9]/).respond(function (method, url) {
            for (var i = 0; i < props.length; i++) {
                if (props[i].data._id == url.split('/')[2]) {
                    return [200, props[i], {}];
                }
            }
        });
        $httpBackend.whenDELETE(/\/api\/properties\/[0-9]/).respond(function (method, url, data) {
//            var _checksum = url.split('/')[2];

            console.log("hello");
//            var backProp = _.find(props, function (value, key) {
//                return value.data._id == property._id && value.data._temp === false;
//            });
//            backProp.data._scrubbed = true;
//            backProp.data.tag = _.find(props, function (value) {
//                return value.data._temp === true && value.data._id === property._id
//            }) ? 'conflict' : 'ok';
//            return [200, {}, {}];
        });

        $httpBackend.whenPUT(/\/api\/properties\/[0-9]/).respond(function (method, url, data) {
            var property = JSON.parse(data);
            var backProp = _.find(props, function (value, key) {
                return value.data._id == property._id && value.data._temp === false;
            });
            backProp.data = property;
            backProp.data._scrubbed = true;
            console.log(backProp);
            return [200, {}, {}];
        });

        $httpBackend.whenPOST(/\/api\/properties\/[0-9]/).respond(function (method, url, data) {
            var _checksum = url.split('/')[3];
            console.log(_checksum);
            var backProp = _.find(props, function (value, key) {
                return value.data._checksum === _checksum;
            });
            console.log(backProp);
            backProp.data._scrubbed = true;
            backProp.data.tag = _.find(props, function (value) {
                return value.data._temp === true && value.data._checksum === _checksum
            }) ? 'conflict' : 'ok';

            return [200, {}, {}];
        });


        $httpBackend.whenGET(/^\/views\//).passThrough();
        $httpBackend.whenGET(/^template\//).passThrough();
        $httpBackend.whenGET(/^\/template\//).passThrough();
    }]);