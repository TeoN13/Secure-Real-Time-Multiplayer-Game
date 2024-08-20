require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require("helmet");
const nocache = require("nocache");

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter({}));
app.use(nocache());

app.use(function(req, res, next) {
  res.setHeader('X-Powered-By', 'PHP 7.4.3');
  next();
});

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/public/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

let players = []
let collectible = ''
let game = {
  players, collectible
}

const io = socket(server)
io.on('connection', (socket) => {

  console.log('User connected to server with id:', socket.id)
  // socket.emit -> to a single client
  // io.emit -> to all clients

  socket.on('disconnect', () => {
    console.log('Player disconnected!')
    game.players = game.players.filter(player => player.id !== socket.id)
  })

  socket.on('New player', (player) => {
    console.log('New player joined the game')
    // Set the player id to the socket id
    player.id = socket.id
    // update the player id to socket id
    socket.emit('id', player.id)
    // add player to game players array
    game.players.push(player)
    // if they're the only player then they're automatically the leader
    if (game.players.length === 1) {
      game.leader = player
    }
    console.log('\nPlayers:', game.players)
  })

  socket.on('move', (player) => {
    for (let i = 0; i < game.players.length; i++) {
      if (game.players[i].id === player.id) {
        // update the player
        game.players[i].x = player.x
        game.players[i].y = player.y
        break // no need to check other players
      }
    }
  })

  socket.on('collision', (player) => {
    // update player score
    if (game.collectible) {
      for (let i = 0; i < game.players.length; i++) {
        if (game.players[i].id === player.id) {
          // found player that collected
          console.log('Collectible was caught:', game.collectible)
          // update their score
          game.players[i].score = player.score
          console.log('Updated player score:', game.players[i])
        }
      }
      // delete collectible
      game.collectible = ''
    }
  })
  
  socket.on('new collectible', (collectible) => {
    if(!game.collectible){
      console.log('New collectible')
      game.collectible = collectible; 
    }
  });

})

setInterval(() => {
  io.emit('update', game)
}, 100)

module.exports = app; // For testing
