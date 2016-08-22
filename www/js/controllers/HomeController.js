(function() {
	angular.module('starter')
		.controller('HomeController', ['$scope', '$state', 'localStorageService', 'SocketService', HomeController]);

	function HomeController($scope, $state, localStorageService, SocketService) {

		var me = this;
		$scope.username = 'ugh'

		SocketService.on('update:rooms', function(allGames) {
      $scope.$apply(function() {
        console.log(allGames);
        me.rooms = allGames;
      })
		})

		$scope.login = function(username) {
			console.log('this should work ', username);
			$scope.username = 'shit'
			me.username = username;
			console.log(me.username);
			$state.go('rooms');
		};

		$scope.enterRoom = function(room) {
			console.log(me.username + ' is entering '+ room);
			SocketService.emit('join:room', room, $scope.username);
			$state.go('room.mainGame');
		};

	}

})();
