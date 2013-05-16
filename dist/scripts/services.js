'use strict';

angular.module('sandbox.app')
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
        };
    });
