var q = require('q'),
    models = require('../models'),
    request = require('request'),
    reqRoot;

function configure(app) {
    reqRoot = app.get('reqRoot');
}

function map(data, key) {
    var map = {};

    for(var i = 0; i < data.length; i ++) {
        map[data[i][key]] = data[i];
    }

    return map;
}

function promiseWrap(asyncCall, handleData) {
    return function() {
        var deferred = q.defer();

        asyncCall(function(err, data) {
            if (!err) {
                if (typeof handleData === 'function') {
                    handleData(data);
                }
                deferred.resolve(data);
            } else {
                deferred.reject(err);
            }
        });

        return deferred.promise;
    }
}

function create(req, res) {
    var newProperty = req.body,
        ScrubbedProperty = models.ScrubbedProperty.model;

    promiseWrap(ScrubbedProperty.createWithChecksum.bind(null, newProperty))()
    .then(
        function() {
            res.writeHead(200);
            res.end();
        },
        function(err) {
            console.log('error creating properties', err);
        }
    );
}

function read(req, res) {
    var RawProperty = models.RawProperty.model,
        ScrubbedProperty = models.ScrubbedProperty.model,
        PropertyWrapper = models.PropertyWrapper.model;

    function wrapProperties(unwrapped) {
        for (var i = 0; i < unwrapped.length; i ++) {
            unwrapped[i] = new PropertyWrapper(unwrapped[i]);
        }
        return unwrapped;
    }

    var raw,
        scrubbed,
        properties;

    promiseWrap(
        RawProperty.find.bind(RawProperty, {}),
        function(rawProperties) {
            raw = rawProperties;
        }
    )()
    .then(promiseWrap(
        ScrubbedProperty.find.bind(ScrubbedProperty, {}),
        function(scrubbedProperties) {
            scrubbed = scrubbedProperties;
        }
    ),
        function(err) {
            console.log('finding only temporary raw failed: ', err);    
        }
    )
    .then(
        function() {
            var scrubbedMap = map(scrubbed, '_checksum');
            for (var i = 0; i < raw.length; i ++) {
                raw[i] = { tag: 'new', data: raw[i] };
                if (scrubbedMap[raw[i].data._checksum]) {
                    scrubbedMap[raw[i].data._checksum]._scrubbed = true;
                    raw[i] = { tag: 'ok', data: scrubbedMap[raw[i].data._checksum] };
                    delete scrubbedMap[raw[i].data._checksum];
                }
            }

            for (var key in scrubbedMap) {
                if (scrubbedMap.hasOwnProperty(key)) {
                    scrubbedMap[key]._scrubbed = true;
                    raw.push({ tag: 'ok', data: scrubbedMap[key] })
                }
            }

            res.writeHead(200);
            res.end(JSON.stringify(raw));
        },
        function(err) {
            console.log('finding scrubbed properties failed: ', err);
        }
    );
}


function update(req, res) {
    var RawProperty = models.RawProperty.model,
        ScrubbedProperty = models.ScrubbedProperty.model;

    promiseWrap(ScrubbedProperty.updateByChecksum.bind(null, req.body))()
    .then(
        function() {
            res.writeHead(200);
            res.end();
        },
        function(err) {
            console.log('changing to deployed false failed', err);
        }
    )
    .done();
}

function remove(req, res) {
    var id = req.params.id,
        ScrubbedProperty = models.ScrubbedProperty.model;

    promiseWrap(ScrubbedProperty.findByIdAndRemove.bind(ScrubbedProperty, id))()
    .then(
        function() {
            res.writeHead(200);
            res.end();
        }, 
        function(err) {
            console.log('removing property failed', err);
        }
    )
    .done();
}

function deploy(req, res) {
    var ScrubbedProperty = models.ScrubbedProperty.model,
        RawProperty = models.RawProperty.model,
        ProductionMap = models.ProductionMap.model,
        ArchivedProperty = models.ArchivedProperty.model,
        checksums = req.body;

    function batchCommit(deferred, properties, amount) {
        var promises = [];
        
        if (properties.length < amount) {
            amount = properties.length;
        }

        for (var i = 0; i < amount; i ++) {
            var deferredEach = q.defer(),
                property = properties.shift();

            (function(_deferred, _property) {
                ProductionMap.findByKey(_property._checksum,
                    function(err, productionMap) {
			            if (!err) {
                            buildRequest(_property, productionMap)(_deferred);
			            } else {
				            _deferred.reject(err);
			            }
                    }
                );
            })(deferredEach, property);

            promises.push(deferredEach.promise);
        }

        // async recursion
        if (properties.length == 0) {
            q.all(promises)
            .then(
                function(data) {
                    deferred.resolve();
                },
                function(err) {
                    deferred.reject(err);
                }
            );
        } else {
            q.all(promises)
            .then(
                function() {
                    batchCommit(deferred, properties, amount);
                },
                function(err) {
                    deferred.reject(err);
                }
            );
        }
    }

    function buildRequest(property, productionMap) {
        var headers = {
            'Content-Type': req.headers['content-type'],
            'Cookie': req.headers['cookie']
        };

        var options = {
            uri: reqRoot + '/api/properties/',
            headers: headers,
            body: JSON.stringify(property)
        };

        if (!productionMap) {
            options.method = 'POST';
        } else {
            options.method = 'PUT';
            options.uri = options.uri + productionMap.productionID;
        }

        return function(deferred) {
            request(options, function(pErr, pResponse, pBody) {
                if (!pErr && pResponse.statusCode === 200) {
                    var identifier = productionMap ? productionMap.productionID : JSON.parse(pBody).id;
                    ProductionMap.map(property, identifier,
                        function(pmErr) {
                            if (!pmErr) {
                                deferred.resolve();
                            } else {
                                deferred.reject(pmErr);
                            }
                        }
                            /*if (!pmErr) {
                                var _options = {
                                    uri: reqRoot + '/api/properties/' + identifier,
                                    method: 'GET',
                                    headers: headers
                                };
                                request(_options, function(gErr, gResponse, gBody) {
                                    if (!gErr && gResponse.statusCode === 200) {
                                        console.log({ _checksum: property._checksum });
                                        console.log({ contacts: gBody.contacts });
                                        ScrubbedProperty.update({ _checksum: property._checksum }, { contacts: JSON.parse(gBody).contacts },
                                            function(spErr) {
                                                if (!spErr) {
                                                    deferred.resolve();
                                                } else {
                                                    deferred.reject(spErr);
                                                }
                                            }
                                        );
                                    } else {
                                        deferred.reject(gErr || gResponse.body);
                                    }
                                });
                            } else {
                                deferred.reject(pmErr);
                            }
                        }*/
                    );
                } else {
                    deferred.reject(pErr || pResponse.body);
                }
            });
        }
    }

    var scrubbed;

    promiseWrap(
        ScrubbedProperty.findByChecksums.bind(null, checksums),
        function(_scrubbed) {
            scrubbed = _scrubbed;
        }
    )()
    .then(
        function() {
            var deferred = q.defer();
            batchCommit(deferred, scrubbed, 10);        
            deferred.promise.then(
                function() {
                    var archive = new ArchivedProperty({ data: scrubbed, archived: new Date() });
                    promiseWrap(ArchivedProperty.create.bind(ArchivedProperty, archive))()
                    .then(
                        function() {
                            promiseWrap(ScrubbedProperty.deployByChecksums.bind(null, checksums))()
                            .then(
                                function() {
                                    res.writeHead(200);
                                    res.end();
                                },
                                function(err) {
                                    console.log('deploying by checksums failed', err);
                                }
                            )
                        },
                        function(err) {
                            console.log('archiving failed', err);
                        }
                    )
                },
                function(err) {
                    console.log('batch commit failed: ', err);
                }
            )
        },
        function(err) {
            console.log('finding scrubbed properties failed', err);
        }
    );
}

function undeploy(req, res) {
    var checksum = req.params.checksum,
        ProductionMap = models.ProductionMap.model,
        headers = {
            'Content-Type': req.headers['content-type'],
            'Cookie': req.headers['cookie']
        },
        options = {
            uri: reqRoot + '/api/properties/',
            headers: headers,
            method: 'DELETE'
        };

    promiseWrap(ProductionMap.findByKey.bind(null, checksum))()
    .then(
        function(productionMap) {
            if (productionMap == null) {
                throw new Error('no production map found for property with checksum ' + checksum);
            } else {
                options.uri = options.uri + productionMap.productionID;
            }

            request(options, function(err, response, body) {
                if (err) {
                    console.log('error sending delete request', err);
                } else if (response.statusCode != 200) {
                    console.log('delete to production server not working', body);
                } else {
                    res.writeHead(200);
                    res.end();
                }
            });
        },
        function(err) {
            console.log('error finding production map', err);
        }
    )
    .done();
}

function Crud() {}

Crud.prototype.configure = configure;
Crud.prototype.read = read;
Crud.prototype.create = create;
Crud.prototype.update = update;
Crud.prototype.remove = remove;
Crud.prototype.deploy = deploy;
Crud.prototype.undeploy = undeploy;

module.exports = new Crud;
