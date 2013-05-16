'use strict';

angular.module('sandbox.app').
    controller('MainCtrl', ['$scope', 'Categories',
        function ($scope, Categories) {

            Categories.queryCategories().then(function(result){
                $scope.categories = result.data;
                $scope.categories[0].selected = true;
                $scope.subcategories = $scope.categories[0].subcategories;
            });

            $scope.select = function selectCategory(_category) {
                angular.forEach($scope.categories, function(category) {
                    category.selected = false;
                });
                _category.selected = true;
                $scope.subcategories = _category.subcategories;
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