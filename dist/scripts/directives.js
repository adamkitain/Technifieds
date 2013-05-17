'use strict';

angular.module('technifieds.app')
    .directive('conflictField', function () {
        return {
            restrict: 'A',
            scope: {
                selected: '=',
                conflicted: '=',
                label: '@',
                link: '='
            },
            templateUrl: '/views/conflict/conflictField.html',
            link: function (scope) {
                scope.compare = function (one, two) {
                    return one === two ? '' : 'error';
                };
            }
        };
    });
