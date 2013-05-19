'use strict';

angular.module('technifieds.app').
    controller('MainCtrl', ['$scope', 'Categories',
        function ($scope, Categories) {
//            $scope.template = {};
            $scope.viewPath = "/views/partials/categories.html";

            Categories.queryCategories().then(function(result){
                $scope.categories = result.data;
                $scope.categories[0].selected = true;
                $scope.category = $scope.categories[0];
            });

            $scope.select = function selectCategory(_category) {
                angular.forEach($scope.categories, function(category) {
                    category.selected = false;
                });
                _category.selected = true;
                $scope.category = _category;
            };
        }])
    .controller('ListCtrl', ['$scope', '$routeParams', 'Categories', '$location',
        function($scope, $routeParams, Categories, $location){
            $scope.viewPath = "/views/partials/list.html";
            $scope.routeParams = $routeParams;
            $scope.classification = {};

            Categories.queryCategories().then(function(result){
                $scope.categories = result.data;
                $scope.classification.category = _.find($scope.categories, function(_category){
                    return $scope.routeParams.category === _category.path;
                });
                $scope.classification.subcategory = _.find($scope.classification.category.subcategories, function(_subcategory){
                    return $scope.routeParams.subcategory === _subcategory.path;
                });
            });

            Categories.queryList($scope.routeParams.category, $scope.routeParams.subcategory).then(function(result){
                $scope.list = result.data;
            });

            $scope.selectItem = function (item) {
                $location.path('/' + $scope.routeParams.category + '/' + $scope.routeParams.subcategory + '/' + item._id);
            };

        }])

    .controller('AppCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $scope.loading = true;
        });
        $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
            $scope.loading = false;
        });
        $rootScope.$on("$routeChangeError", function (event, current, previous, rejection) {
            $scope.loading = false;
        });
    }]);