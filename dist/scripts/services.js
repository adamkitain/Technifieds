'use strict';

angular.module('sandbox.app')
    .factory('Categories', ['$q', '$_api', '$http', 'Alerts', function ($q, $_api, $http, Alerts) {
        var categories = [];

        return {
            queryCategories: function () {
                var defer = $q.defer(),
                    self = this,
                    path = $_api.path + '/api/categories/',
                    config = angular.extend({
                        transformRequest: function (data) {
                            Alerts.setAlert({
                                type: 'info',
                                msg: 'Loading properties...'
                            });
                            return data;
                        }
                    }, $_api.config);

                $http.get(path, config).then(
                    function (response) {
                        Alerts.clear();
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject();
                    }
                );
                return defer.promise;
            },
            queryName: function () {
                var defer = $q.defer(),
                    path = $_api.path + '/api/categories2/',
                    config = angular.extend({
                        transformRequest: function (data) {
                            return data;
                        }
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
            }
        };
    }])
    .factory('$_api', ['$http', function ($http) {
        var urls = {
            dev:"http://10.0.1.75:8000",
            local:""
        };
        return {
            config:{
                headers:{'Content-Type':'application/json'},
                withCredentials:true
            },
            path: urls.local
        };
    }])
    .factory('Alerts', function () {
        var alerts = [];
        return {
            get: function () {
                return alerts;
            },
            setAlert: function (alert) {
                alerts = [alert];
            },
            addAlert: function (alert) {
                alerts.push(alert);
            },
            clear: function () {
                alerts = [];
            }
        }
    });
