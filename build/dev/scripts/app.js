'use strict';

angular.module('scraper.app', ['ui.bootstrap', 'ui']);

angular.module('scraper.app')
    .config(['$routeProvider', '$httpProvider', '$locationProvider',
        function ($routeProvider, $httpProvider, $locationProvider) {
            $locationProvider.html5Mode(true).hashPrefix('#');
            $routeProvider.when('/', {
                templateUrl: '/views/app.html',
                controller: 'MainCtrl',
                resolve: {
                    loadProperties: function ($http, $q, $_api, Property, $rootScope) {
                        $http.defaults.useXDomain = true;
                        return $rootScope.ping().then(Property.query);
                    }
                }
            })
                .when('/login', {
                    templateUrl: '/views/login.html',
                    controller: 'LoginCtrl',
                    resolve: {
                        checkStatus: function ($rootScope, $location, $q) {
                            var defer = $q.defer;
                            $rootScope.ping(function (response) {
                                defer.resolve();
                            }, function (response) {
                                defer.reject();
                            });

                            return defer.promise;
                        }
                    }
                });

            $httpProvider.responseInterceptors.push('Interceptor');
        }])
    .run(['$rootScope', '$_api', '$location', '$q', '$http',
        function ($rootScope, $_api, $location, $q, $http) {

            /**
             * Holds all the requests which failed due to 401 response.
             */
            $rootScope.requests401 = [];
            $http.defaults.useXDomain = true;

            $rootScope.ping = function () {
                var defer = $q.defer();

                var path = $_api.path + '/api/auth/check',
                    config = angular.extend({
                    }, $_api.config);

                $http.get(path, config).then(function (response) {
                    $rootScope.$broadcast('auth#loginConfirmed');
                    defer.resolve();
                }, function (response) {
                    $rootScope.$broadcast('auth#loginRequired');
                    defer.reject();
                });

                return defer.promise;
            };

            /**
             * On 'event:loginConfirmed', resend all the 401 requests.
             */
            $rootScope.$on('auth#loginConfirmed', function () {
                function retry(req) {
                    $http(req.config).then(function (response) {
                        req.deferred.resolve(response);
                    });
                }

                var i, requests = $rootScope.requests401;
                for (i = 0; i < requests.length; i++) {
                    retry(requests[i]);
                }
                $rootScope.requests401 = [];

                $location.path('/');
            });

            /**
             * On 'event:loginRequest' send credentials to the server.
             */
            $rootScope.$on('auth#loginRequest', function (event, creds) {
                var path = $_api.path + '/api/auth/login/',
                    config = angular.extend({
                    }, $_api.config),
                    body = JSON.stringify(creds);

                $http.post(path, body, config).then(function (response) {
                    $rootScope.$broadcast('auth#loginConfirmed');
                }, function (response) {
                    $rootScope.$broadcast('auth#loginRequired');
                });
            });

            $rootScope.$on('auth#loginRequired', function () {
                $location.path('/login');
            });
            /**
             * On 'logoutRequest' invoke logout on the server and broadcast 'event:loginRequired'.
             */
            $rootScope.$on('auth#logoutRequest', function () {
                var path = $_api.path + '/api/auth/logout',
                    config = angular.extend({
                    }, $_api.config);

                $http.get(path, config).then(function (response) {
                    $rootScope.ping();
                }, function (response) {
                    $rootScope.ping();
                });
            });
        }])
    .factory('Interceptor', ['$q', '$rootScope', '$timeout',
        function ($q, $rootScope, $timeout) {
            return function (promise) {
                var resolve = function (response) {
                    $('#Loading').hide();
                    $('#Loading-Details').hide();

                    // Local simulate loading
                    $timeout(function () {
                        $('#Loading').hide();
                        $('#Loading-Details').hide();
                    }, 250);

                }, reject = function (response) {
                    var status = response.status;
                    if (status === 401) {
                        var defer = $q.defer(),
                            req = {
                                config: response.config,
                                deferred: defer
                            };

                        $rootScope.requests401.push(req);
                        $rootScope.$broadcast('auth#loginRequired');

                        return defer.promise;
                    } else if (status === 201) {
                        $rootScope.$broadcast('auth#loginRequired');
                    }

                    $('#Loading').hide();
                    $('#Loading-Details').hide();
                    return $q.reject(response);
                };

                promise.then(resolve, reject);

                return promise;
            };
        }]);
