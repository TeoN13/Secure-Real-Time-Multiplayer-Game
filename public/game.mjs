import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io("https://secure-real-time-multiplayer-game.onrender.com");
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const score = document.getElementById('score');

const playerIcons = ['https://cdn-icons-png.flaticon.com/512/4193/4193263.png', 'https://cdn-icons-png.flaticon.com/512/4193/4193320.png', 'https://cdn-icons-png.flaticon.com/512/4193/4193361.png', 'https://cdn-icons-png.flaticon.com/512/4193/4193297.png', 'https://cdn-icons-png.flaticon.com/512/4193/4193306.png', 'https://cdn-icons-png.flaticon.com/512/4193/4193371.png']

const playerDimension = 60 // player icon will be a square
const playerSpeed = 5

const collectibleIcons = ['https://cdn-icons-png.flaticon.com/512/9769/9769336.png', 'https://cdn-icons-png.flaticon.com/512/7169/7169860.png', 'https://cdn-icons-png.flaticon.com/512/9368/9368091.png']
const collectibleValue = [25, 50, 100]
const collectibleDimension = 40

// Randomly place player on the canvaw
const player = new Player({
  x: Math.floor(Math.random() * (canvas.width - playerDimension)),
  y: Math.floor(Math.random() * (canvas.height - playerDimension)),
  score: 0,
  id: Math.random(),//.toString(36).substr(2, 9) + Date.now(),
  size: playerDimension,
  icon: playerIcons[Math.floor(Math.random() * playerIcons.length)]
})

// VAriabled for displaying player rank
let playerRank = null
let playersNumber = null
let collided = false;
let canEmit = true;

socket.emit('New player', player)
socket.on('id', (id)=>{
  player.id = id
})


function draw(game){
  // clear window
  context.clearRect(0,0,canvas.width,canvas.height)
  // draw players
  for(let player of game.players){
    let playerIcon = new Image()
    playerIcon.src = player.icon
    context.drawImage(playerIcon, player.x, player.y, playerDimension, playerDimension)
  }

  if (game.collectible) {
    let collectibleIcon = new Image()
    collectibleIcon.src = game.collectible.icon
    context.drawImage(collectibleIcon, game.collectible.x, game.collectible.y, collectibleDimension, collectibleDimension)
  }

  score.innerHTML = `Score<br>${player.score}<br>Rank<br>${playerRank ? playerRank : playersNumber}/${playersNumber}`;
  
}

socket.on('update', (game)=>{
  // if nothing was sent
  if(!game){
    return 
  }

  // update players count for rank if needed
  playersNumber = game.players.length
  
  // update player rank if needed
  playerRank = player.calculateRank(game.players)

  // if no collectible is on the canvas, make a new one
  if(!game.collectible && canEmit){
    console.log('Creating new collectible')
    const randomIndex = Math.floor(Math.random() * collectibleIcons.length)
    let collectible = new Collectible({
      x: Math.floor(Math.random() * (canvas.width - playerDimension)),
      y: Math.floor(Math.random() * (canvas.height - playerDimension)),
      value: collectibleValue[randomIndex],
      icon: collectibleIcons[randomIndex],
      size: collectibleDimension,
      id: Math.random()
    })
    socket.emit('new collectible', collectible);
    canEmit = false;
    setTimeout(() => {
      canEmit = true;
    }, 2000);   
  }
  
  if (game.collectible && player.collision(game.collectible) && !collided){
    console.log('Collided')
    // update player score
    player.score += game.collectible.value
    socket.emit('collision', player)
    collided = true
    setTimeout(()=>{
      collided = false
    },1000)
  }
  
  draw(game)
})


// Add event listener for keydown event on the document
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  let direction = '';

  if((key == 'w' || key === 'arrowup') && player.y > 0){
    direction = 'up';
  }
  if((key == 's' || key === 'arrowdown') && player.y < (canvas.height - playerDimension)){
    direction = 'down';
  }
  if((key == 'a' || key === 'arrowleft') && player.x > 0){
    direction = 'left';
  }
  if((key == 'd' || key === 'arrowright') && player.x < (canvas.width - playerDimension)){
    direction = 'right';
  }

  if(direction){
    //console.log('Moving player!')
    player.movePlayer(direction, playerSpeed)
    socket.emit('move', player)
  }
  
});
