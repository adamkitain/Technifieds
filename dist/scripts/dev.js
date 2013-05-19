'use strict';

angular.module('technifieds.app.dev', ['technifieds.app', 'ngMockE2E'])
    .run(['$httpBackend', function ($httpBackend) {

    var categories = [
        {
            title:"Academics",
            path:"academics",
            subcategories:[
                {title:"Textbooks", path:"textbooks", fields:{} },
                {title:"Class Materials", path:"classmaterials", fields:{} },
                {title:"Tutoring", path:"tutoring", fields:{} },
                {title:"Research", path:"research", fields:{} }
            ]
        },
        {
            title:"Home & Dorm",
            path:"homeanddorm",
            subcategories:[
                {title:"Furniture", path:"furniture", fields:{} },
                {title:"Electronics", path:"electronics", fields:{} },
                {title:"Subleasing", path:"sublease", fields:{} },
                {title:"Services", path:"services", fields:{} }
            ]
        },
        {
            title:"Personals",
            path:"personals",
            subcategories:[
                {title:"Services", path:"services", fields:{} },
                {title:"asdf", path:"asdf", fields:{} },
                {title:"fdsf", path:"fdsf", fields:{} },
                {title:"Something", path:"something", fields:{} }
            ]
        },
        {
            title:"Locals",
            path:"locals",
            subcategories:[
                {title:"Deals", path:"deals", fields:{} },
                {title:"Part-time Jobs", path:"jobs", fields:{} },
                {title:"Events", path:"events", fields:{} },
                {title:"Something", path:"something", fields:{} }
            ]
        }
    ];

    var postings = {
        academics: {
            textbooks: [
                {_id:0, title: "Calculus Textbook - Like NEW", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://www.math.missouri.edu/courses/math1700/math1700.jpg", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:1, title: "Different book", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://www.math.missouri.edu/courses/math-courses/math1360.jpg", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:2, title: "English Textbook", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://2.bp.blogspot.com/_GgX4S7W-eI8/S8T0otQx4eI/AAAAAAAABlI/v9b7CJR3tBE/s1600/Math+textbook.JPG", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:3, title: "Calculus Textbook - Like NEW", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://g.christianbook.com/g/ebooks/covers/w185/8/84997_w185.png", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:4, title: "Calculus Textbook - Like NEW", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://ww2.bths201.org/east/departments/science/files/physics%20book.jpg", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:5, title: "Calculus Textbook - Like NEW", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://ecx.images-amazon.com/images/I/51z%2BOyD1FPL._BO2,204,203,200_PIsitb-sticker-arrow-click,TopRight,35,-76_AA300_SH20_OU01_.jpg", datePosted: "05/13/2013", userID: "ACC32442B5"},
                {_id:6, title: "Calculus Textbook - Like NEW", name: "McGraw Henry Calculus Edition 3", price: 35, description: "I used this book briefly for CALC 1502. No marks or damages, the book is like new", imgURL: "http://pleasanton.k12.ca.us/avhsweb/barnettdreyfuss/Pictures/Glencoe.jpeg", datePosted: "05/13/2013", userID: "ACC32442B5"}

            ],
            classmaterials: [

            ],
            tutoring: [

            ],
            research: [

            ]
        },
        homeanddorm: {
            furniture: [

            ],
            electronics: [

            ],
            sublease: [

            ],
            services: [

            ]
        },
        personals: {
            services: [

            ],
            asdf: [

            ],
            fdsf: [

            ],
            something: [

            ]
        },
        locals: {
            deals: [

            ],
            jobs: [

            ],
            events: [

            ],
            something: [

            ]
        }
    };


    $httpBackend.whenGET('/api/categories/').respond(categories);
    $httpBackend.whenGET(/\/api\/categories\/[a-z].*\/[a-z].*/).respond(function(method, url, data){
        var pieces = url.split('/'),
            category = pieces[3],
            subcategory = pieces[4];
        return [200, postings[category][subcategory], {}];

    });

    $httpBackend.whenGET(/^\/views\//).passThrough();
    $httpBackend.whenGET(/^template\//).passThrough();
    $httpBackend.whenGET(/^\/template\//).passThrough();

}]);