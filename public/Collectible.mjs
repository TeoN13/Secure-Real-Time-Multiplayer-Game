class Collectible {
  constructor({x, y, value, id, icon, size=40}) {
    this.x = x
    this.y = y
    this.value = value
    this.id = id
    this.icon = icon
    this.size = 40
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
