var tailleCase = 70;
var nombreCases = 8;

class Position2D {
  constructor() {
    this.x = 0;
    this.y = 0;
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
  constructor() {
    this.position = new Position2D();
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
    })
    this.position.log();
  }
  
  move(x,y){
    let td = document.getElementById('Case' + this.position.x + this.position.y);
    let child = td.removeChild(td.firstChild);
    this.position.set(x,y);
    td = document.getElementById('Case' + this.position.x + this.position.y);
    td.appendChild(child);
  }
  
  selectNewCase(pion,xp,yp){
    let td;
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        td = document.getElementById('Case' + x + y);
        td.style.color = 'cyan';
        if(!(xp == x && yp == y)){
          td.onmouseenter = function(e){
            e.target.style.backgroundColor = 'cyan';
          }
          td.onmouseout = function(e){
            if(e.target.getAttribute('class') == 'whiteCase'){
              e.target.style.backgroundColor = 'white';
            }
            else {
              e.target.style.backgroundColor = 'maroon';
            }
          }
          td.onclick = function(e){
            console.log("move to " + e.target.id);
            let td2;
            for(let sy = 0; sy < nombreCases; sy++){
              for(let sx = 0; sx < nombreCases; sx++){
                td2 = document.getElementById('Case' + sx + sy);
                td2.style.color = 'black';
                td2.onmouseenter = td2.onmouseout = td2.onclick = '';
                if(td2.getAttribute('class') == 'whiteCase'){
                  td2.style.backgroundColor = 'white';
                }
                else {
                  td2.style.backgroundColor = 'maroon';
                }
              }
            }
            let a = parseInt(e.target.id.charAt(4));
            let b = parseInt(e.target.id.charAt(5));
            pion.move(a,b);
          }
        }
        else {
          td.onmouseup = function(e){
            e.target.
          }
        }
      }
    }
  }
}

(function main(){
  plateauEchec();
  let pion = new Pion();
  pion.affiche();
})();

function plateauEchec(){
  let plateau = document.getElementById('plateau');
  let tr;
  let td;
  
  var table = document.createElement('table');
  plateau.appendChild(table);
  
  table.setAttribute('id', 'tableEchec');
  
  for(let y = 0; y < nombreCases; y++){
    
    tr = document.createElement('tr');
    tr.setAttribute('id','row' + y);
    
    for(let x = 0; x < nombreCases; x++){
      
      td = document.createElement('td');
      td.setAttribute('id', 'Case' + x + y);
      td.setAttribute('width', tailleCase + 'px');
      td.setAttribute('height', tailleCase + 'px');
      if((x + y) % 2 == 0){
        td.setAttribute('class', 'whiteCase');
      }
      else {
        td.setAttribute('class', 'blackCase');
      }
      
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}


function setSelectionnable(td){
  
}
/*
td.onmouseenter = function(e){
  e.target.style.backgroundColor = 'cyan';
}
td.onmouseout = function(e){
  if(e.target.getAttribute('class') == 'whiteCase'){
    e.target.style.backgroundColor = 'white';
  }
  else {
    e.target.style.backgroundColor = 'maroon';
  }
}
*/
