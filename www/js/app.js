// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('ionic-todo', ['dropbox', 'ionic', 'LocalStorageModule', 'chart.js', 'ngCordova','angular.filter']);

app.run(function($ionicPlatform, $cordovaTouchID, $state) {
    $ionicPlatform.ready(function() {
        //End Touch ID//

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

            StatusBar.styleDefault();
            //StatusBar.overlaysWebView(true);
            // StatusBar.style(1); //Light

            //StatusBar.style(2); //Black, transulcent
            //StatusBar.style(3); //Black, opaque
        }


    });
});
app.filter('cmdate', [
    '$filter',
    function($filter) {
        return function(input, format) {
            if (input === null) return '';
            else return $filter('date')(new Date(input), format);
        };
    }
]);
app.directive('preview', function() {
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs) {
            attrs.$observe(
                "src",
                function() {
                    //console.log(attrs.src);
                    //console.log(element.attr('src'));
                    var url = element.attr('src');
                    var type = attrs.type;
                    element.html("");
                    element.append('<object style="height:100%;width:100%;" data="' + url + '"></object>');



                });
        }
    };
});
app.directive('alert', function () {
	return {
		restrict: 'EA',
		controller: 'IonicAlertController',
		template: '<div class=\"card\" role=\"alert\"><a class=\"item item-text-wrap item-icon-right\" ng-class=\"\'alert-\' + type\" href=\"#\"><div ng-transclude></div><i ng-show=\"closeable\" class=\"icon ion-close\" ng-click=\"close()\"></i></a></div>',
    // template: 'templates/alert.html',
		transclude: true,
		replace: true,
		scope: {
			type: '@',
			close: '&'
		}
	};
});
app.config(function(localStorageServiceProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.swipeBackEnabled(false);

    localStorageServiceProvider
        .setPrefix('JFS');
    $stateProvider
        .state('Login', {
            url: '/Login',
            templateUrl: 'templates/Login.html',
            controller: 'login'
        })
        .state('Home', {
            url: '/Home',
            templateUrl: 'templates/Home.html',
            controller: 'main'
        })
        .state('Dashboard', {
            url: '/Dashboard',
            templateUrl: 'templates/Dashboard.html',
            controller: 'main'
        })
        .state('RecruitList', {
            url: '/RecruitList',
            templateUrl: 'templates/RecruitList.html',
            controller: 'RecruitsCtrl'
        })
        .state('RecruitView', {
            url: '/RecruitView',
            templateUrl: 'templates/RecruitView.html',
            params: {
                currentRecruit: null,
                RecruitInfo: null
            },
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
        })
        .state('Files', {
            url: "/Files",
            templateUrl: "templates/FileBrowser.html",
            controller: "main"
        })
         .state('Tools', {
            url: "/Tools",
            templateUrl: "templates/Tools/index.html",
            controller: "Tools"
        })
        .state('Tools.Dashboard', {
            url: "/Tools.Dashboard",
            templateUrl: "templates/Tools/dashboard.html",
            controller: "Tools"
        })
        .state('Messages', {
            url: "/Messages",
            templateUrl: "templates/Messages/index.html",
            controller: "Tools"
        })
        .state('Messages.List', {
            url: "/Messages.List",
            templateUrl: "templates/Messages/list.html",
        })
        .state('Messages.Chat', {
            url: "/Messages.Chat",
            templateUrl: "templates/Messages/chat.html"
        });


    $urlRouterProvider.otherwise('/Login');
});
app.factory('uuid2', [
	function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}

		return {

			newuuid: function() {
				// http://www.ietf.org/rfc/rfc4122.txt
				var s = [];
				var hexDigits = "0123456789abcdef";
				for (var i = 0; i < 36; i++) {
					s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
				}
				s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
				s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
				s[8] = s[13] = s[18] = s[23] = "-";
				return s.join("");
			},
			newguid: function() {
				return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
					s4() + '-' + s4() + s4() + s4();
			}
		};

	}
]);
app.factory('JFSfunctions', function($http, $q,$rootScope) {
	var myFunctions = {};
	var observerCallbacks = [];
	var TextMessages = [];
	var notifyObservers = function(data) {
		angular.forEach(observerCallbacks, function(callback) {
			callback(data);
		});
	};
	var notification = window.Notification || window.mozNotification || window.webkitNotification;
	var conn = new WebSocket('wss://jfsapp.com/WebSocket');
	conn.onopen = function(e) {
		console.log("Connection established!");
	};
	conn.onmessage = function(event) {
		notifyObservers(event);
		var temp = angular.fromJson(event.data);
		console.log(temp);
		if(angular.isDefined(temp.browsernotification)){
		myFunctions.browserNotify(temp.browsernotification.Title, temp.browsernotification.Body, temp.browsernotification.Icon);
		}
		if(angular.isDefined(temp.event)){
			if(temp.event=='newsms'){
				TextMessages.push(temp.data);
			}
			$rootScope.$apply();
		}
	};
	return myFunctions;
});
app.factory('currentUser', function($http, $q, $state, $ionicLoading, localStorageService) {
    var currentUser = {};
    var loggedin;
    var User;
    var UserInfo = {};
    if (localStorageService.get('UserData')) {
        UserInfo = localStorageService.get('UserData');
    }
    currentUser.login = function(UserName, Password) {
        $ionicLoading.show({
            template: "Authenticating<ion-spinner icon='lines' class='spinner-energized'></ion-spinner></div>"
        });

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'https://jfsapp.com/Secure/OAUTH/getToken/',
            data: {
                grant_type: 'password',
                client_id: 'testclient',
                client_secret: 'testpass',
                username: UserName,
                password: Password
            }
        }).success(function(data, status, headers, config) {
            // Store your data or what ever....
            // Then resolve
            UserInfo = data;
            UserInfo.date = new Date();
            localStorageService.set('UserData', UserInfo);
            deferred.resolve(data);
            $ionicLoading.hide();
            $state.go('Home');
        }).error(function(data, status, headers, config) {
            console.log("Error: request returned status " + status);
            $ionicLoading.hide();
            deferred.reject("Error: request returned status " + status);
        });
        return deferred.promise;
    };
    currentUser.getUser = function() {
        var deferred = $q.defer();
        if (angular.isDefined(User)) {
            deferred.resolve(User);
        } else {
            currentUser.getToken().then(function(token) {
                $http({
                    method: 'GET',
                    params: {
                        access_token: token,
                        client_id: 'testclient',
                        client_secret: 'testpass'
                    },
                    url: 'https://jfsapp.com/Secure/API/User/',
                }).then(function(data) {
                    User = data.data;
                    deferred.resolve(data.data);
                });
            });
        }
        return deferred.promise;
    };
    currentUser.refreshToken = function() {
        $ionicLoading.show({
            template: "Authenticating<ion-spinner icon='lines' class='spinner-energized'></ion-spinner></div>"
        });

        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'https://jfsapp.com/Secure/OAUTH/getToken/',
            data: {
                grant_type: 'refresh_token',
                refresh_token: UserInfo.refresh_token,
                client_id: 'testclient',
                client_secret: 'testpass'
            }
        }).success(function(data, status, headers, config) {
            // Store your data or what ever....
            // Then resolve
            UserInfo = data;
            UserInfo.date = new Date();
            localStorageService.set('UserData', UserInfo);
            //console.log(UserInfo);
            deferred.resolve(data);
            $ionicLoading.hide();
        }).error(function(data, status, headers, config) {
            console.log("Error: request returned status " + status);
            $ionicLoading.hide();
            deferred.reject("Error: request returned status " + status);
        });
        return deferred.promise;
    };
    currentUser.getToken = function() {
        var deferred = $q.defer();
        if (angular.isDate(UserInfo.date) & UserInfo.date >= moment().subtract(UserInfo.expires_in, 'seconds')) {
            console.log('na');
            deferred.resolve(UserInfo.access_token);
        } else {
            console.log('refresh');
            currentUser.refreshToken().then(function(data) {
                deferred.resolve(UserInfo.access_token);
            });
        }
        return deferred.promise;
    };
    currentUser.isLoggedIn = function() {
        if (angular.isDefined(UserInfo.refresh_token) & moment(UserInfo.date).isAfter(moment().subtract(14, 'days'))) {
            return true;
        } else {

            return false;
        }
    };
    currentUser.AssignColorQuizNotes = function(data) {
    		var deferred = $q.defer();
    		currentUser.getToken().then(function(Token) {
    			$http({
    				method: 'post',
    				url: 'https://jfsapp.com/Secure/API/assignColorQuiz/',
    				params: {
    					'access_token': Token,
    					client_id: 'testclient',
    					client_secret: 'testpass'

    				},
    				data: data
    			}).then(function(data) {
    				console.log(data.data);
    				deferred.resolve(data.data);
    			}, function(error) {
    				deferred.reject(error);
    			});
    		});
    		return deferred.promise;
    	};

    return currentUser;
});
app.controller('login', function($scope, currentUser, $ionicPlatform, $cordovaTouchID, $state) {
    $scope.currentUser = currentUser;
    //console.log(currentUser.isLoggedIn());
    document.addEventListener("deviceready", function() {
        //Touch ID//
        if (currentUser.isLoggedIn()) {
            $cordovaTouchID.checkSupport().then(function() {
                $cordovaTouchID.authenticate("").then(function() {
                    currentUser.refreshToken().then(function(data) {
                        $state.go('Home');
                    }, function(data) {
                        alert('Please Login Again');
                    });
                }, function() {
                    alert('Please Login Again');
                });
            }, function(error) {
                alert('title', 'error', 'why');
                    //alert(error);
            });

        }
    }, false);

});
app.controller('main', function($cordovaInAppBrowser, Dropbox, $scope, $sce, $window, $ionicModal, localStorageService, $http, $ionicScrollDelegate, currentUser, $ionicLoading) {
    //store the entities name in a variable
    currentUser.getUser().then(function(data) {});
    $scope.resizeScroll = function() {
            $ionicScrollDelegate.resize();
        };
        //$scope.currentUser = currentUser;
    $scope.dimensions = {
        width: $window.innerWidth,
        height: $window.innerHeight
    };
    $scope.test = function(UserName, Password) {
            $http({
                method: 'POST',
                url: 'https://jfsapp.com/Secure/API/getToken/',
                data: {
                    client_id: 'testclient',
                    client_secret: 'testpass',
                    username: UserName,
                    password: Password
                }
            }).success(function(data) {
                // Store your data or what ever....
                // Then resolve
                deferred.resolve(data);
            }).error(function(data, status, headers, config) {
                deferred.reject("Error: request returned status " + status);
            });

        };
        //currentUser.login('Cody','skiutah4969')

    $scope.updateRecruits = function() {

        $http.get('https://jfsapp.com/Test/getProspectsLiscenced.php').success(function(data) {

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
        window.open('tel:' + number, '_system');
    };
    $scope.sendEmail = function(email) {
        //if(window.plugins && window.plugins.email) {console.log('yes');}
        //console.log('here')
        //console.log(number);
        //number =number.replace(/[^0-9a-z]/gi, '');
        //console.log(number);
        window.open('mailto:' + email, '_system');
    };

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
        };
        //initialize the tasks scope with empty array
    $scope.tasks = [];

    //initialize the task scope with empty object
    $scope.task = [];

    //configure the ionic modal before use


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
app.controller('RecruitsCtrl', function($ionicPopup,uuid2,$ionicHistory, $cordovaInAppBrowser, Dropbox, $sce, $window, $filter, $ionicActionSheet, $scope, $ionicModal, localStorageService, $http, $ionicScrollDelegate, currentUser, $ionicLoading, $state, $stateParams,JFSfunctions) {
    $scope.usersLiscenced = [];
    $scope.currentRecruit = {};
    $scope.isDefined = function(value){
      if(value===null){return false;}
      else{return true;}
    };
    //console.log($stateParams);
    console.log('before');
    $scope.$on('$ionicView.enter', function(event, data) {
        //$state.reload();
        console.log(data);
        $scope.stateParams = data.stateParams;
        if (angular.isDefined($scope.stateParams.currentRecruit)) {
            $scope.currentRecruit = $scope.stateParams.currentRecruit;
            $scope.RecruitInfo = $scope.stateParams.RecruitInfo;
            console.log('close');
            console.log($scope.stateParams);
        }
    });
    console.log($scope.RecruitInfo);
    currentUser.getUser().then(function(data) {
        $scope.currentUser = data;
        //console.log(data)
    });
    $scope.updateRecruits = function() {
        //if (localStorageService.get(taskData)) {
        //$scope.usersLiscenced =localStorageService.get(recruitList);
        //}
        $scope.show = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        currentUser.getToken().then(function(Token) {
            $http({
                method: 'GET',
                params: {
                    access_token: Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                url: 'https://jfsapp.com/Secure/API/Recruits/',

            }).then(function(data) {
                //localStorageService.set(recruitList, data.data);
                $scope.usersLiscenced = data.data;
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };
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
    $ionicModal.fromTemplateUrl('modals/new-task-modal.html', {
        id: '2',
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newTaskModal = modal;
    });
    $scope.openTaskModal = function() {
        $scope.newTaskModal.show();
    };

    $scope.closeTaskModal = function() {
        $scope.newTaskModal.hide();
    };
    $scope.openNoteModal = function(Recruit) {
        $ionicLoading.show({
            template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"
        });


        currentUser.getToken().then(function(Token) {
            $http({
                method: 'GET',
                params: {
                    access_token: Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                url: 'https://jfsapp.com/Secure/API/Recruits/' + Recruit.INDV_ID + '/',

            }).then(function(data) {
                $scope.RecruitInfo = data.data;
                $scope.newNoteModal.show();
                $scope.currentRecruit = Recruit;
                $ionicLoading.hide();
            });
        });
    };
    $scope.openRecruitView = function(Recruit) {
        $ionicLoading.show({
            template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"
        });


        currentUser.getToken().then(function(Token) {
            $http({
                method: 'GET',
                params: {
                    access_token: Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                url: 'https://jfsapp.com/Secure/API/Recruits/' + Recruit.INDV_ID + '/',

            }).then(function(data) {

                $scope.RecruitInfo = data.data;
                $scope.currentRecruit = Recruit;
                $ionicLoading.hide();
                console.log($scope.currentRecruit);
                $state.go('RecruitView', {
                    RecruitInfo: data.data,
                    currentRecruit: Recruit
                });

            });
        });
    };

    $scope.openToDoModal = function(Recruit) {
        $ionicLoading.show({
            template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"
        });

        currentUser.getToken().then(function(Token) {
            $http({
                method: 'GET',
                params: {
                    access_token: Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                url: 'https://jfsapp.com/Secure/API/Recruits/' + Recruit.INDV_ID + '/',

            }).then(function(data) {
                $scope.RecruitInfo = data.data;
                $scope.newToDoModal.show();
                $scope.currentRecruit = Recruit;
                $ionicLoading.hide();
            });
        });
    };
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
            buttons: [{
                text: 'View Profile'
            }, {
                text: 'View Notes'
            }, {
                text: 'View ToDo'
            }],
            destructiveText: 'Delete',
            titleText: 'Options',
            cancelText: 'Cancel',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 2) {
                    $scope.openToDoModal(recruit);
                    hideSheet();
                }
                if (index == 1) {
                    $scope.openNoteModal(recruit);
                    hideSheet();
                }
                if (index == 0) {
                    $scope.openRecruitView(recruit);
                    hideSheet();
                }
            }
        });
    };
    $scope.addNote = function(newNote) {
        //console.log('here')

        var Note = {
                userid: $scope.currentUser.id,
                userName: $scope.currentUser.display_name,
                userPhoto: $scope.currentUser.display_photo,
                applicantid: 1,
                parentid: 0,
                text: newNote,
                datetime: Date()
            };
            // console.log(Note)
        $scope.RecruitInfo.Notes.push(Note);
        $scope.updateRecruit(null, $scope.RecruitInfo);
        $scope.newTaskModal.hide();

    };
    $scope.completeTask = function() {
        var NextStep = $filter('filter')($scope.RecruitInfo.Task, {
            completed: 'false'
        })[0];
        var scheduled;
        if (angular.isUndefined(NextStep.scheduled)) {
            scheduled = null;
        } else {
            scheduled = NextStep.scheduled;
        }
        var Recruit = {
            NextStep: NextStep.title,
            NextStepScheduled: scheduled
        };

        $scope.updateRecruit(Recruit, $scope.RecruitInfo);


    };
    $scope.updateRecruit = function(recruit, info) {
        var formData = {
            Recruit: recruit,
            Detail: {
                Info: JSON.stringify($scope.RecruitInfo)
            }
        };

        var postData = JSON.stringify(formData);
        currentUser.getToken().then(function(Token) {
            $http({
                method: 'PATCH',
                url: 'https://jfsapp.com/Secure/API/Recruits/' + $scope.currentRecruit.INDV_ID + '/All/',
                params: {
                    'access_token': Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                data: postData,

            }).then(function(data) {}, function(error) {
                alert('Last Note Failed To Sync');
            });
        });
    };
    $scope.showDoc = function(document) {
        $ionicLoading.show({
            template: "<ion-spinner icon='lines' class='spinner-energized'></ion-spinner>"
        });
        $scope.Preview = {};
        var options = {
            location: 'no',
            clearcache: 'no',
            toolbar: 'yes'
        };
        var filePath = '/recruitDocuments/' + document.fileName;
        if (['page_white_word', 'page_white_excel', 'page_white_powerpoint'].indexOf(document.fileIcon) !== -1) {
            Dropbox.preview(filePath, {
                blob: true
            }).then(function(data) {
                var url = $window.URL || $window.webkitURL;
                var temp = url.createObjectURL(data.data);
                $scope.Preview.fileUrl = $sce.trustAsResourceUrl(temp);
                window.open($scope.Preview.fileUrl, '_blank', 'EnableViewPortScale=yes,location=no,toolbar=yes');
                $ionicLoading.hide();
            });
        } else if (document.fileIcon == 'page_white_acrobat') {

            Dropbox.readFile(filePath, {
                blob: true
            }).then(function(data) { //var url = $window.URL || $window.webkitURL; $scope.fileUrl = url.createObjectURL(data);

                var url = $window.URL || $window.webkitURL;
                var temp = url.createObjectURL(data.data);
                $scope.Preview.fileUrl = $sce.trustAsResourceUrl(temp);
                window.open($scope.Preview.fileUrl, '_blank', 'EnableViewPortScale=yes,location=no,toolbar=yes');
                $ionicLoading.hide();
            });
        } else {
            Dropbox.thumbnailUrl(filePath, {
                blob: true
            }, 'l').then(function(data) {
                var url = $window.URL || $window.webkitURL;
                var temp = url.createObjectURL(data.data);
                $scope.Preview.fileUrl = $sce.trustAsResourceUrl(temp);
                window.open($scope.Preview.fileUrl, '_blank', 'EnableViewPortScale=yes,location=no,toolbar=yes');
                $ionicLoading.hide();
            });
        }

    };
    $scope.sendColor = function() {
		var testdata = {
			Recruit_ID: $scope.currentRecruit.INDV_ID,
			Test_Token: uuid2.newuuid(),
			User_ID: 1,
			Date_Assigned: new Date()
		};
		var formData = {
			to: {Email:$scope.currentRecruit.EMAIL,fname:$scope.currentRecruit.FNAME},
			from: $scope.currentUser,
			subject: 'Color Test',
			Test_Token: testdata.Test_Token
		};
		var postData = 'datas=' + JSON.stringify(formData);
		currentUser.AssignColorQuizNotes(testdata).then(function(data) {
			$http({
				method: 'POST',
				url: 'https://jfsapp.com/Admin/ManagmentPortal/AngularApp/Partials/Emails/php/SendColorTest.php',
				data: postData,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}).then(function(data) {
        var alertPopup = $ionicPopup.alert({
     title: 'Color Test Sent',
   });
				//var message = $scope.CurrentRecruitLiscence.fname + ",\n This is Scott Johnson it was great talking with you today. I've emailed you the color test we talked about. If you don't see it please check your spam folder"
				//$scope.sendText(message);
			//	toastr.success('Color Test Sent');
			});
		});

	};
});
