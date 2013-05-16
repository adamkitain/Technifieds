'use strict';

angular.module('sandbox.app').
    controller('MainCtrl', ['$scope',
        function ($scope) {
            $scope.inputName = "";
            $scope.testVariable = "Hello, ";
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