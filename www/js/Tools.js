angular.module('ionic-todo').controller('Tools', function($ionicModal, $scope, currentUser, $ionicPlatform, $cordovaTouchID, $state, $http, $ionicScrollDelegate) {
  $scope.Text_Conversation = $scope.Text_Conversation || {};
  $ionicModal.fromTemplateUrl('modals/Notes-Modal.html', {
    id: '1',
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.newNoteModal = modal;
  });
  $scope.updateTexts = function() {
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

      });
    });
  };
  $scope.updateTexts();
  $scope.viewConversation = function(text) {
    console.log(text);
    currentUser.getToken().then(function(Token) {
      $http({
        method: 'GET',
        params: {
          access_token: Token,
          client_id: 'testclient',
          client_secret: 'testpass'
        },
        url: 'https://jfsapp.com/Secure/API/Recruits/' + text.INDV_ID + '/sms/',

      }).then(function(data) {

        $scope.Text_Conversation.history = data.data;
        $scope.Text_Conversation.info = text;
        $state.go('Messages.Chat');
        $ionicScrollDelegate.scrollBottom();

      });
    });

  };
  $scope.sendText = function(message) {
    $ionicScrollDelegate.scrollBottom();
    var newMessage = {
      to: $scope.Text_Conversation.info.id_number,
      text: message,
      Recruit_ID: $scope.Text_Conversation.info.INDV_ID

    };
    currentUser.getToken().then(function(Token) {
      $http({
        method: 'POST',
        params: {
          access_token: Token,
          client_id: 'testclient',
          client_secret: 'testpass'
        },
        url: 'https://jfsapp.com/Secure/API/Text/',
        data: newMessage

      }).then(function(data) {
        $scope.Text_Conversation.history.push(data.data);
        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollBottom();
      });
    });

  };
});
