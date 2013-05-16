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
                'lib/jquery-ui/ui/jquery.ui.core',
                'lib/jquery-ui/ui/jquery.ui.datepicker'
            ]
        },
        'lib/jquery-ui/ui/jquery.ui.core': {
            deps: ['lib/jquery']
        },
        'lib/jquery-ui/ui/jquery.ui.datepicker': {
            deps: ['lib/jquery', 'lib/jquery-ui/ui/jquery.ui.core']
        },
        'lib/angular-ui/angular-ui': {
            deps: ['lib/angular/angular', 'lib/jquery-ui/ui/jquery.ui.core', 'lib/jquery', 'lib/jquery-ui/ui/jquery.ui.datepicker']
        },
        'lib/angular/angular-mocks': {
            deps: ['lib/angular/angular']
        },
        'lib/angular-ui/ui-bootstrap-0.2.0': {
            deps: ['lib/angular/angular', 'lib/jquery-ui/ui/jquery.ui.datepicker']
        },
        'services': {
            deps: ['app']
        },
        'directives': {
            deps: ['app']
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
}, ['require', 'controllers', 'services', 'directives', 'dev', 'lib/jquery-ui/ui/jquery.ui.datepicker'], function (require) {
    return require(['bootstrap']);
});
