angular.module('ionic-todo').controller('Tools', function($scope, currentUser, $ionicPlatform, $cordovaTouchID, $state,$http) {
    $scope.updateTexts = function(){
    currentUser.getToken().then(function(Token) {
            $http({
                method: 'GET',
                params: {
                    access_token: Token,
                    client_id: 'testclient',
                    client_secret: 'testpass'
                },
                url: 'https://jfsapp.com/Secure/API/Recruits/sms/summary/',

            }).then(function(data) {

                $scope.Text_Summary = data.data;
                $scope.$broadcast('scroll.refreshComplete');

            })
        })
        };
        $scope.updateTexts()
    
})