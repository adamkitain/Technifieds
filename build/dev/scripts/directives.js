'use strict';

angular.module('scraper.app')
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
                    return one == two ? '' : 'error';
                }
            }
        };
    })
    .directive('conflictParagraph', function () {
        return {
            restrict: 'A',
            scope: {
                selected: '=',
                conflicted: '=',
                label: '@'
            },
            templateUrl: '/views/conflict/conflictParagraph.html',
            link: function (scope) {
                scope.compare = function (one, two) {
                    return one == two ? '' : 'error';
                }
            }
        };
    })
    .directive('conflictModelRow', ['Contact', 'Image',
        function (Contact, Image) {
            return {
                scope: {
                    conflictProperty: '=',
                    selectedProperty: '=',
                    conflictModel: '=',
                    selectedModel: '='
                },
                templateUrl: '/views/conflict/conflictModelRow.html',
                link: function (scope, element, attrs) {

                    scope.getKeys = function (model) {
                        return model ? _.without(_.keys(model), '_id', '_checksum', '$$hashKey') : undefined;
                    };

                    scope.remove = function () {
                        if (scope.selectedModel instanceof Contact) {
                            scope.selectedProperty.removeContact(scope.selectedModel._id);
                        } else if (scope.selectedModel instanceof Image) {
                            scope.selectedProperty.removeImage(scope.selectedModel._id);
                        }
                    };

                    scope.copyModelFromConflicted = function () {
                        var model = {};
                        angular.copy(scope.conflictModel, model);
                        if (scope.conflictModel instanceof Contact) {
                            scope.selectedProperty.addContact(new Contact(model));
                        } else if (scope.conflictModel instanceof Image) {
                            scope.selectedProperty.addImage(new Image(model));
                        }
                    };

                    scope.compare = function (one, two) {
                        return one == two ? '' : 'error';
                    };
                }
            };
        }])
    .directive('inputField', ['States', function (States) {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                disabled: '=',
                label: '@',
                link: '='
            },
            templateUrl: '/template/inputField.html',
            link: function (scope, element, attrs) {
                scope.compare = function (one, two) {
                    return one == two ? '' : 'error';
                };

                if (attrs.hasOwnProperty('state')) {
                    scope.$watch('model', function (newVal) {
                        if (newVal) {
                            var state = (newVal).replace(/\s+/g, '').toUpperCase();
                            if (States.hasOwnProperty(state)) {
                                scope.model = States[state];
                            }
                        }
                    });
                }
            }
        };
    }])
    .directive('inputParagraph', function () {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                disabled: '=',
                label: '@'
            },
            templateUrl: '/template/inputParagraph.html',
            link: function (scope) {
                scope.compare = function (one, two) {
                    return one == two ? '' : 'error';
                };
            }
        };
    })
    .directive('propertyRow', function () {
        return {
            restrict: 'C',
            link: function (scope, element, attrs) {
                scope.rowColor = function (tag) {
                    switch (tag) {
                        case 'ok':
                            return 'info';
                        case 'removed':
                            return 'error';
                        case 'conflict':
                            return 'warning';
                        case 'new':
                            return 'success';
                    }
                };
            }
        };
    })
    .directive('badge', function () {
        return {
            restrict: 'C',
            link: function (scope, element, attrs) {
                scope.badgeColor = function (tag) {
                    switch (tag) {
                        case 'ok':
                            return 'badge-info';
                        case 'removed':
                            return 'badge-important';
                        case 'conflict':
                            return 'badge-warning';
                        case 'new':
                            return 'badge-success';
                    }
                };
            }
        };
    })
    .directive('staticAlert', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                tag: '='
            },
            transclude: true,
            template: '<div class="alert" ng-class="alertColor(tag)" ng-transclude></div>',
            link: function (scope, element, attrs) {
                scope.alertColor = function (tag) {
                    switch (tag) {
                        case 'ok':
                            return 'alert-info';
                        case 'removed':
                            return 'alert-important';
                        case 'conflict':
                            return 'alert-warning';
                        case 'new':
                            return 'alert-success';
                    }
                };
            }
        };
    })
    .directive('progress', function () {
        return {
            restrict: 'C',
            scope: {
                percentage: '='
            },
            template: '<div class="bar" style="width: {{percentage}}%"></div>',
            link: function (scope, element, attrs) {
                var bar = element.find('.bar');
                scope.$watch('percentage', function (newVal, oldVal) {
                    element.removeClass('progress-success', 'progress-info', 'progress-warning', 'progress-info');
                    bar.css({width: newVal + '%'});
                    if (newVal > 90) {
                        element.addClass('progress-success');
                    } else if (newVal > 75) {
                        element.addClass('progress-info');
                    } else if (newVal > 50) {
                        element.addClass('progress-warning');
                    } else {
                        element.addClass('progress-danger');
                    }
                });
            }
        };
    })
    .directive('inputDate', function () {
        return {
            restrict: 'E',
            templateUrl: '/template/inputDate.html',
            scope: {
                model: '=',
                label: '@',
                disabled: '='
            }
        };
    })
    .directive('inputSelect', function () {
        return {
            restrict: 'E',
            templateUrl: '/template/inputSelect.html',
            scope: {
                model: '=',
                label: '@',
                disabled: '=',
                options: '='
            }
        };
    })
    .directive('stateAbbreviation', ['States', function (States) {
        return {
            require: '^ngModel',
            link: function (scope, element, attrs, ModelCtrl) {
                ModelCtrl.$parsers.unshift(function (val) {
                    console.log(val);
                });
                scope.$watch('model', function (newVal) {
                    var state = (newVal).replace(/\s+/g, '').toUpperCase();
                    if (States.hasOwnProperty(state)) {
                        scope.model = States[state];
                    }
                });
            }
        };
    }]);
