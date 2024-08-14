class Player {
  constructor({x, y, score, id, icon, size=60}) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
    this.icon = icon
    this.size = size
  }

  movePlayer(dir, speed) {
    switch(dir){
      case 'up':
        this.y -= speed
        break
      case 'down':
        this.y += speed
        break
      case 'left':
        this.x -= speed
        break
      case 'right':
        this.x += speed
        break
      default:
        // do nothing
    }
  }

  collision(item) {
    // check if player collided with the collectible item
    if (this.x < item.x + item.size &&
    this.x + this.size > item.x &&
    this.y < item.y + item.size &&
    this.y + this.size > item.y) {
      return true
    } else return false
    
  }

  calculateRank(arr) {
    const scores = arr.sort((a, b) => b.score - a.score);
    for(let i=0; i<scores.length; i++){
      if(scores[i].id === this.id) return i+1
    }
  }
}

export default Player;
