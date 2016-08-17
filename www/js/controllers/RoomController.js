(function() {
  angular.module('starter')
    .controller('RoomController', ['$scope', '$state', 'localStorageService', 'SocketService', 'moment', '$ionicScrollDelegate', RoomController]);

  function RoomController($scope, $state, localStorageService, SocketService, moment, $ionicScrollDelegate) {

    var me = this;

    me.messages = [];

    $scope.humanize = function(timestamp) {
      return moment(timestamp).fromNow();
    };

    me.current_room = localStorageService.get('room');

    var current_user = localStorageService.get('username');

    $scope.isNotCurrentUser = function(user) {

      if (current_user != user) {
        return 'not-current-user';
      }
      return 'current-user';
    };


    $scope.sendTextMessage = function() {

      var msg = {
        'room': me.current_room,
        'user': current_user,
        'text': me.message,
        'time': moment()
      };


      me.messages.push(msg);
      $ionicScrollDelegate.scrollBottom();

      me.message = '';

      SocketService.emit('send:message', msg);
    };


    $scope.leaveRoom = function() {

      var msg = {
        'user': current_user,
        'room': me.current_room,
        'time': moment()
      };

      SocketService.emit('leave:room', msg);
      $state.go('rooms');

    };

    localStorageService.set('player_data.score', 0);
    localStorageService.set('player_data.currentRole', "player");


    SocketService.on('first_player', function(msg) {
      console.log("firing set localStorageService");
      localStorageService.set('player_data.currentRole', "picker");
    });

    SocketService.on('message', function(msg) {
      me.messages.push(msg);
      $ionicScrollDelegate.scrollBottom();
    });


  }

})();
