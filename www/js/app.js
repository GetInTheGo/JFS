// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('ionic-todo', ['ionic', 'LocalStorageModule', 'chart.js', 'ngCordova'])

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {

        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            //StatusBar.styleDefault();
            StatusBar.overlaysWebView(true);
            StatusBar.style(1); //Light
            //StatusBar.style(2); //Black, transulcent
            //StatusBar.style(3); //Black, opaque       
        }
    });
});

app.config(function(localStorageServiceProvider, $stateProvider, $urlRouterProvider) {
    localStorageServiceProvider
        .setPrefix('ionic-todo');
    $stateProvider
        .state('Login', {
            url: '/Login',
            templateUrl: 'templates/Login.html',
            controller: 'main'
        })
        .state('RecruitList', {
            url: '/RecruitList',
            templateUrl: 'templates/RecruitList.html',
            controller: 'main'
        })
        .state('user', {
            url: "/users/:userId",
            templateUrl: "templates/user.html",
            controller: "main"
        })
        .state('Notes', {
            url: "/Notes",
            templateUrl: "templates/Notes.html",
            controller: "main"
        });


    $urlRouterProvider.otherwise('/Login');
});

app.controller('main', function($scope, $ionicModal, localStorageService, $http, $ionicScrollDelegate) {
    //store the entities name in a variable
    $scope.resizeScroll = function() {
        $ionicScrollDelegate.resize()
    }
    $scope.updateRecruits = function() {
        $http.get('http://johnsonfinancialservice.com/Test/getProspectsLiscenced.php').success(function(data) {

            $scope.usersLiscenced = data;
            localStorageService.set(taskData, data);
            $scope.MaxIDLiscenced = Math.max.apply(Math, data.map(function(o) {
                return o.ID;
            }));
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.dialNumber = function(number) {
        //console.log(number);
        number = number.replace(/[^0-9a-z]/gi, '');
        console.log(number);
        window.open('tel:' + number, '_system');
    }
    $scope.sendEmail = function(email) {
        //if(window.plugins && window.plugins.email) {console.log('yes');}

        //console.log(number);
        //number =number.replace(/[^0-9a-z]/gi, '');
        //console.log(number);
        window.open('mailto:' + email, '_system');
    }

    $scope.updateRecruits();
    var taskData = 'task';
    $scope.toggleItem = function(recruit) {
        if (recruit.shown) {
            recruit.shown = false;
        } else {
            recruit.shown = true;
        }
        $ionicScrollDelegate.resize();
    };
    $scope.isItemShown = function(recruit) {
            $ionicScrollDelegate.resize();
            return recruit.shown;
        }
        //initialize the tasks scope with empty array
    $scope.tasks = [];

    //initialize the task scope with empty object
    $scope.task = [];

    //configure the ionic modal before use
    $ionicModal.fromTemplateUrl('modals/new-task-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newTaskModal = modal;
    });

    $scope.getTasks = function() {
        //fetches task from local storage
        if (localStorageService.get(taskData)) {
            $scope.tasks = localStorageService.get(taskData);
        } else {
            $scope.tasks = [];
        }
    };

    $scope.createTask = function() {
        //creates a new task
        $scope.tasks.push($scope.task);
        localStorageService.set(taskData, $scope.tasks);
        $scope.task = {};

        //close new task modal
        $scope.newTaskModal.hide();
    };

    $scope.removeTask = function(index) {
        //removes a task
        $scope.tasks.splice(index, 1);
        localStorageService.set(taskData, $scope.tasks);
    };


    $scope.completeTask = function() {
        //updates a task as completed
        if (index !== -1) {
            $scope.tasks[index].completed = true;
        }

        localStorageService.set(taskData, $scope.tasks);

    };
    $scope.notes = [{
        "userid": 3,
        "userName": "Scott Johnson",
        "userPhoto": "Scottdisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Cody, This is amazing you're clearly my favorite and most talented child",
        "datetime": "2016-04-10T23:26:37.861Z"
    }, {
        "userid": 2,
        "userName": "Sherry Johnson",
        "userPhoto": "SherryDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "I agree he's always been my favorite",
        "datetime": "2016-04-10T23:42:16.724Z"
    }, {
        "userid": 1,
        "userName": "Cody Johnson",
        "userPhoto": "CodyDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Ah Shucks",
        "datetime": "2016-04-11T06:12:03.047Z"
    }, {
        "userid": 5,
        "userName": "Dave Moultrie",
        "userPhoto": "DaveDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Notes",
        "datetime": "2016-04-12T00:30:03.735Z"
    }, {
        "userid": 5,
        "userName": "Dave Moultrie",
        "userPhoto": "DaveDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Test",
        "datetime": "2016-04-12T01:03:16.061Z"
    }, {
        "userid": 1,
        "userName": "Cody Johnson",
        "userPhoto": "CodyDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Did I Break it Yet",
        "datetime": "2016-04-14T18:38:36.325Z"
    }, {
        "userid": 1,
        "userName": "Cody Johnson",
        "userPhoto": "CodyDisplay.png",
        "applicantid": 1,
        "parentid": 0,
        "text": "Nope",
        "datetime": "2016-04-14T18:38:50.156Z"
    }]
    $scope.openTaskModal = function() {
        $scope.newTaskModal.show();
    };

    $scope.closeTaskModal = function() {
        $scope.newTaskModal.hide();
    };
});