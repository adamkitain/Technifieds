'use strict';

if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

angular.module('technifieds.app', ['ui.bootstrap', 'ui']);

angular.module('technifieds.app')
    .config(['$routeProvider', '$httpProvider', '$locationProvider',
        function ($routeProvider, $httpProvider, $locationProvider) {
            $locationProvider.html5Mode(true).hashPrefix('#');
            $routeProvider
                .when('/', {
                templateUrl: '/views/app.html',
                controller: 'MainCtrl'
            })
                .when('/:category/:subcategory', {
                templateUrl: '/views/app.html',
                controller: 'ListCtrl'
            })
                .when('/:category/:subcategory/:id', {
                templateUrl: '/views/app.html',
                controller: 'PostingCtrl'
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

                    $('#Loading').hide();
                    $('#Loading-Details').hide();
                    return $q.reject(response);
                };

                promise.then(resolve, reject);

                return promise;
            };
        }]);
