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
            controller: 'RecruitsCtrl'
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
app.factory('currentUser', function($http, $q,$state,$ionicLoading) {
	var currentUser={};
	var loggedin;
	var UserInfo = {access_token:''};
	currentUser.login = function(UserName,Password) {
		 $ionicLoading.show({
      template: "Authenticating<ion-spinner icon='lines' class='spinner-energized'></ion-spinner></div>"
    });

		var deferred = $q.defer();
		$http({
			method: 'POST',
			url: 'http://johnsonfinancialservice.com/Secure/OAUTH/getToken/',
			data: {grant_type:'password',client_id:'testclient',client_secret:'testpass',username:UserName,password:Password}
		}).success(function(data, status, headers, config) {
			// Store your data or what ever.... 
			// Then resolve
			UserInfo.access_token = data.access_token;
			console.log(UserInfo);
			deferred.resolve(data);
			$ionicLoading.hide();
			$state.go('RecruitList');
		}).error(function(data, status, headers, config) {
			console.log("Error: request returned status " + status);
			$ionicLoading.hide();
			deferred.reject("Error: request returned status " + status);
		});
		return deferred.promise;
     }	
     currentUser.getToken = function(){
	     return UserInfo.access_token;
     }
	currentUser.getCurrent = function() {
		var deferred = $q.defer();
		$http.get('/phpscripts/getSessionData.php').success(function(data) {
			// Store your data or what ever.... 
			// Then resolve
			deferred.resolve(data);
		}).error(function(data, status, headers, config) {
			deferred.reject("Error: request returned status " + status);
		});
		loggedin = deferred.promise;
		return deferred.promise;
	};
		return currentUser;
});
app.controller('main', function($scope, $ionicModal, localStorageService, $http, $ionicScrollDelegate,currentUser,$ionicLoading) {
    //store the entities name in a variable
    $scope.resizeScroll = function() {
        $ionicScrollDelegate.resize()
    }
    $scope.currentUser = currentUser;
    $scope.test =function(UserName,Password){
	    $http({
			method: 'POST',
			url: 'http://johnsonfinancialservice.com/Secure/API/getToken/',
			data: {client_id:'testclient',client_secret:'testpass',username:UserName,password:Password}
		}).success(function(data) {
			// Store your data or what ever.... 
			// Then resolve
			deferred.resolve(data);
		}).error(function(data, status, headers, config) {
			deferred.reject("Error: request returned status " + status);
		});

    }
    //currentUser.login('Cody','skiutah4969')
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
        $scope.openTaskModal = function() {
        $scope.newTaskModal.show();
    };

    $scope.closeTaskModal = function() {
        $scope.newTaskModal.hide();
    };
});
app.controller('RecruitsCtrl', function($ionicActionSheet,$scope, $ionicModal, localStorageService, $http, $ionicScrollDelegate,currentUser,$ionicLoading) {
	$scope.usersLiscenced=[];
	$scope.currentRecruit ={};
	$scope.updateRecruits = function(){ 
		$scope.show = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  	$http({
			method: 'GET',
			params:{access_token:currentUser.getToken(),client_id:'testclient',client_secret:'testpass'},
			url: 'http://johnsonfinancialservice.com/Secure/API/Recruits/',

		}).then(function(data){ $scope.usersLiscenced = data.data;
			$scope.$broadcast('scroll.refreshComplete');
		})};
	$scope.updateRecruits();
	$ionicModal.fromTemplateUrl('modals/Notes-Modal.html', {
        id: '1',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newNoteModal = modal;
    });
    $ionicModal.fromTemplateUrl('modals/ToDo-Modal.html', {
        id: '2',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newToDoModal = modal;
    });
    $scope.openNoteModal = function(Recruit) {
	    $ionicLoading.show({template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"});

	    
	    $http({
			method: 'GET',
			params:{access_token:currentUser.getToken(),client_id:'testclient',client_secret:'testpass'},
			url: 'http://johnsonfinancialservice.com/Secure/API/Recruits/'+Recruit.INDV_ID+'/',

		}).then(function(data){ $scope.RecruitInfo = data.data;$scope.newNoteModal.show();
			$scope.currentRecruit =Recruit;
			$ionicLoading.hide();
		})};
	 $scope.openToDoModal = function(Recruit) {
	    $ionicLoading.show({
      template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"
    	});

	    
	    $http({
			method: 'GET',
			params:{access_token:currentUser.getToken(),client_id:'testclient',client_secret:'testpass'},
			url: 'http://johnsonfinancialservice.com/Secure/API/Recruits/'+Recruit.INDV_ID+'/',

		}).then(function(data){ $scope.RecruitInfo = data.data;$scope.newToDoModal.show();
			$scope.currentRecruit =Recruit;
			$ionicLoading.hide();
		})};
	$scope.moveItem = function(item, fromIndex, toIndex) {
    //Move the item in the array
    $scope.items.splice(fromIndex, 1);
    $scope.items.splice(toIndex, 0, item);
  };
	$scope.closeNoteModal = function() {
        $scope.newNoteModal.hide();
    };
    $scope.closeToDoModal = function() {
        $scope.newToDoModal.hide();
    };
    $scope.RecruitActionSheet = function(recruit) {
		   // Show the action sheet
		   var hideSheet = $ionicActionSheet.show({
		   buttons: 
		   [
		   	{ text: 'Share Contact Info' },
		   	{ text: 'View Profile' },
		   	{ text: 'View Notes' },
		   	{ text: 'View ToDo' }
		   ],
     destructiveText: 'Delete',
     titleText: 'Modify your album',
     cancelText: 'Cancel',
     cancel: function() {},
     buttonClicked: function(index) {if(index==3){$scope.openToDoModal(recruit);hideSheet();}
     								if(index==2){$scope.openNoteModal(recruit);hideSheet();}	
     									}
   });
   }





 });