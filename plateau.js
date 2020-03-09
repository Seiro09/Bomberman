var tailleCase = 70;
var nombreCases = 8;

class Position2D {
  constructor(x,y) {
    if(x == undefined) x = 0;
    if(y == undefined) y = 0;
    this.x = x;
    this.y = y;
  }
  
  log(){
    return '(' + this.x + ',' + this.y + ')';
  }
  
  move(x, y){
    this.x += x;
    this.y += y;
  }
  
  set(x,y){
    this.x = x;
    this.y = y;
  }
}

class Pion {
  constructor(x,y) {
    this.position = new Position2D(x,y);
    console.log("nouveau pion en " + this.position.log());
  }
  
  affiche(){
    let td = document.getElementById('Case' + this.position.x + this.position.y);
    let piece = document.createElement('img');
    td.appendChild(piece);
    let me = this;
    piece.src = 'https://library.kissclipart.com/20181007/wq/kissclipart-pawn-chess-sprite-clipart-chess-piece-pawn-fb6e2722e253d586.jpg';
    piece.width = tailleCase/2;
    piece.height = tailleCase/2;
    piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
    piece.addEventListener('click', function(e){
      me.selectNewCase(me,me.position.x,me.position.y);
