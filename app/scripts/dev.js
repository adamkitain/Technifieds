'use strict';

angular.module('sandbox.app.dev', ['sandbox.app', 'ngMockE2E'])
    .run(['$httpBackend', function ($httpBackend) {

    var categories = [
        {
            title:"Academics",
            subcategories:[
                {title:"Textbooks", fields:{} },
                {title:"Class Materials", fields:{} },
                {title:"Tutoring", fields:{} },
                {title:"Research", fields:{} }
            ]
        },
        {
            title:"Home & Dorm",
            subcategories:[
                {title:"Furniture", fields:{} },
                {title:"Electronics", fields:{} },
                {title:"Subleasing", fields:{} },
                {title:"Services", fields:{} }
            ]
        },
        {
            title:"Personals",
            subcategories:[
                {title:"Services", fields:{} },
                {title:"asdf", fields:{} },
                {title:"asdf", fields:{} },
                {title:"asf", fields:{} }
            ]
        },
        {
            title:"Locals",
            subcategories:[
                {title:"Deals", fields:{} },
                {title:"Part-time Jobs", fields:{} },
                {title:"Events", fields:{} },
                {title:"Something", fields:{} }
            ]
        }
    ];


    $httpBackend.whenGET('/api/categories/').respond(categories);
    $httpBackend.whenGET('/api/categories2/').respond({name: "Adam"});



    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^template\//).passThrough();
    $httpBackend.whenGET(/^\/template\//).passThrough();

}]);