var io = require('socket.io')(3000);

var allGames = {
	'Pikachu': {
		round: 1,
		capacity: 4,
		players: [{
			username: 'lucas',
			socket: '123def',
			currentRole: 'picker',
			submissionThisRound: 'blah',
			scoreThisRound: 0
		}, {
			username: 'will',
			socket: '456abc',
			currentRole: 'player',
			submissionThisRound: 'blah',
			scoreThisRound: 0
		}, {
			username: 'evan',
			socket: 'wyxs',
			currentRole: 'player',
			submissionThisRound: 'blah',
			scoreThisRound: 0
		}],
		submissionCounter: 0,
		voteCounter: 0,
    gameStatus: 'Not started'
	},
	'Pacman': {
		round: 1,
		capacity: 2,
		players: [],
		submissionCounter: 0,
		voteCounter: 0,
    gameStatus: 'Not started'
	},
	'Mortal Kombat': {
		round: 1,
		capacity: 4,
		players: [],
		submissionCounter: 0,
		voteCounter: 0,
    gameStatus: 'Not started'
	},
	'Banana Room': {
		round: 1,
		capacity: 8,
		players: [],
		submissionCounter: 0,
		voteCounter: 0,
    gameStatus: 'Not started'
	},
}

function findPlayerIndexByKeyValuePair(room, key, value) {
	var playersArray = allGames[room].players
	var playerObj = playersArray.find(function (player) {
		return player[key] == value;
	})
	var index = playersArray.indexOf(playerObj)
	return index
}

io.on('connection', function(socket) {

	io.emit('update:rooms', allGames)

	socket.on('join:room', function(room, username) {
		// build in logic that doesn't allow to click room if full
    console.log('room', room, 'username', username);
    socket.join(room, username);
    var playerCount = io.sockets.adapter.rooms[room].length
    var playerCapacity = allGames[room].capacity

    if (playerCount === 1) {
      // if first player, add to game & assign picker role
			allGames[room].players.push({
				username: username,
				socket: socket.id,
				currentRole: 'picker',
				scoreThisRound: 0
			})
			io.in(socket.id).emit('set:role', 'picker', username, room);
		} else {
      // if not 1st player, add to game & assign player role
			allGames[room].players.push({
				username: username,
				socket: socket.id,
				currentRole: 'player',
				scoreThisRound: 0
			})
      io.in(socket.id).emit('set:role', 'player', username, room);
		}
    // if room is now full, start game
    if (playerCount === playerCapacity) {
      io.in(room).emit('start:game');
    }
    io.emit('update:rooms', allGames)
	});

	socket.on('select_word', function(data, room_name) {
		io.in(room_name).emit('selected_word', data)
	});

	socket.on('leave:room', function(room) {
		socket.leave(room); // remove socket
    var playerIndex = findPlayerIndexByKeyValuePair(room, 'socket', socket.id)
    allGames[room].players.splice(playerIndex, 1) // remove player from allGames
    io.emit('update:rooms', allGames) // update allGames
	});

	socket.on('send:definition', function(def) {
		io.in(def.room).emit('definition', def);
	});

	socket.on('updateScore', function(choice, room) {
		console.log(choice);
		io.in(room).emit('updateScore', choice)
	})
});
