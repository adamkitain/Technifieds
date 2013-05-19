'use strict';

angular.module('technifieds.app')
//    .factory('Posting', ['Categories', '$q', '$_api', '$http', function (Categories, $q, $_api, $http) {
//            var Posting = function (post){
//                this._id = post._id;
//            };
//
//            return Posting;
//        }])
    .factory('Categories', ['$q', '$_api', '$http', function ($q, $_api, $http) {
        var categories = [];
        var Categories = {};

        Categories.queryCategories = function () {
            var defer = $q.defer(),
                self = this,
                path = $_api.path + '/api/categories/',
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
        };

        Categories.queryList = function (category, subcategory) {
            var defer = $q.defer(),
                self = this,
                path = $_api.path + '/api/categories/' + category + '/' + subcategory,
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
        };

        return Categories;
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
    }]);
