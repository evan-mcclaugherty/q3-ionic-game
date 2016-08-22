(function() {
  angular.module('starter')
    .controller('RoomController', ['$scope', '$state', 'localStorageService', 'SocketService', 'WordService', RoomController]);

  function RoomController($scope, $state, localStorageService, SocketService, $ionicScrollDelegate, WordService) {

    var me = this;
    console.log(this);

    me.messages = [];
    me.definitions = [];
    me.scores = [];
    $scope.view = {
      choice: 'test'
    }
    $scope.waiting = true;
    me.results = [];

    SocketService.on('set:role', function(role, username, room) {
      console.log(username);
      me.currentRole = role
      me.username = username
      me.currentRoom = room
    });

    // $scope.view.choice = 'test'

    $scope.selected = true;
    // me.current_room = localStorageService.get('room');
    // var current_user = localStorageService.get('username');
    // $scope.user = current_user

    $scope.isNotCurrentUser = function(user) {
      if (current_user != user) {
        return 'not-current-user';
      }
      return 'current-user';
    };
    $scope.selectWord = function() {
      SocketService.emit('select_word', $scope.data, me.current_room);
      $scope.selected = false;
    };

    $scope.getWord = function() {
      return WordService.getWord().then(function(word) {
        $scope.data = word.data
      })
    }

    $scope.sendDefinition = function() {
      $scope.toggleInput = false;
      var def = {
        'room': me.current_room,
        'user': current_user,
        'definition': me.definition
      };
      SocketService.emit('send:definition', def);
    }

    $scope.playerChoice = function(choice) {
      SocketService.emit('updateScore', choice, me.current_room)
      $scope.choiceMade = true;
    }

    $scope.leaveRoom = function() {
      console.log('leaving room', me.currentRoom);
      SocketService.emit('leave:room', me.currentRoom);
      $state.go('rooms');
    };

    // localStorageService.set('player_data.score', 0);
    // localStorageService.set('player_data.currentRole', "player");

    SocketService.on('selected_word', function(data) {
      var def = {
        definition: data.meaning,
        word: data.word
      }
      me.definitions.push(def)
      $scope.toggleInput = true;
      $scope.word = data.word;
    })

    SocketService.on('start:game', function() {
      WordService.getWord().then(function(data) {
        $scope.data = data.data;
      })
      $scope.waiting = false;
      $scope.currentRole = localStorageService.get('player_data.currentRole');
    });


    SocketService.on('receive:score', function(score) {
      me.results.push(score);
    })

    SocketService.on('definition', function(def) {
      me.definitions.push(def);
    });

    SocketService.on('room_full', function(msg) {
      alert(msg);
      $state.go('rooms');
    })

    SocketService.on('updateScore', function(choice) {
      me.scores.push(choice)
      if (me.scores.length === 3) {
        var score = localStorageService.get('player_data.score')
        me.scores.forEach(function(name) {
          if (current_user == name) {
            score++
          }
          if (localStorageService.get('player_data.currentRole') == 'picker') {
            if (name == null) {
              score++
            }
          }
        })
        localStorageService.set('player_data.score', score)
      }
    })

    $scope.sendScore = function() {
      var playerScore = localStorageService.get('player_data.score');
      var score = {
        'room': me.current_room,
        'user': current_user,
        'score': playerScore
      };

      me.results.push(score);
      SocketService.emit('send:score', score);
    };


  }

})();
