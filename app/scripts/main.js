'use strict';

require({
    shim: {
        'app': {
            deps: [
                'lib/angular/angular',
                'lib/angular/angular-mocks',
                'lib/underscore-min',
                'lib/angular-ui/ui-bootstrap-0.2.0',
                'lib/angular-ui/angular-ui',
                'lib/jquery',
                'lib/jquery-ui.min'
            ]
        },
        'lib/angular-ui/angular-ui': {
            deps: ['lib/angular/angular', 'lib/jquery-ui.min', 'lib/jquery']
        },
        'lib/jquery-ui.min': {
            deps: ['lib/jquery']
        },
        'lib/angular/angular-mocks': {
            deps: ['lib/angular/angular']
        },
        'lib/angular-ui/ui-bootstrap-0.2.0': {
            deps: ['lib/angular/angular']
        },
        'services': {
            deps: ['app']
        },
        'directives': {
            deps: ['app', 'lib/jquery-ui.min', 'lib/jquery', 'lib/underscore-min', 'lib/angular/angular']
        },
        'controllers': {
            deps: ['app', 'services']
        },
        'dev': {
            deps: ['app', 'lib/angular/angular-mocks']
        },
        'bootstrap': {
            deps: ['app']
        }
    }
}, ['require', 'lib/jquery-ui.min', 'controllers', 'services', 'directives', 'dev'], function (require) {
    return require(['bootstrap']);
});
