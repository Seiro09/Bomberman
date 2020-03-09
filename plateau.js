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
    this.src = "https://library.kissclipart.com/20181007/wq/kissclipart-pawn-chess-sprite-clipart-chess-piece-pawn-fb6e2722e253d586.jpg";
    console.log("nouveau pion en " + this.position.log());
  }
  
  //place le pion sur le plateau
  affiche(){
    let td = this.getCase();
    let piece = document.createElement('img');
    td.appendChild(piece);
    let me = this; //se copier pour les fonctions ou le this n'est plus possible
    piece.src = this.src;
    piece.width = tailleCase/2;
    piece.height = tailleCase/2;
    piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
    this.setSelectionnable();
  }
  
  //rendre le pion sélectionnable
  setSelectionnable(){
    let me = this;
    this.getImg().addEventListener('click', function(e){
      me.selectNewCase();
    })
  }
  
  setNonSelectionnable(){
    this.getImg().removeEventListener('click');
  }
  
  //return la case <td> associé au pion
  getCase(){
    return document.getElementById('Case' + this.position.x + this.position.y);
  }
  
  //return l'image <img associé au pion>
  getImg(){
    return this.getCase().firstElementChild;
  }
  
  //deplace le pion su la case indiqué
  move(x,y){
    if(x != this.position.x || y != this.position.y) {
      let td = document.getElementById('Case' + this.position.x + this.position.y);
      let child = td.removeChild(td.firstChild);
      this.position.set(x,y);
      td = document.getElementById('Case' + this.position.x + this.position.y);
      td.appendChild(child);
    }
  }
  
  //rendre les cases disponibles a la selection
  selectNewCase(){
    let td;
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        td = document.getElementById('Case' + x + y);
        
        if(!(this.position.x == x && this.position.y == y)){ //rendre toutes les cases selectionnable sauf celle du pion
          setCaseSelectionnable(td,this);
        }
        
        else { //actions sur la case du pion
          //setCaseSelectionnable(td,this);
        }
      }
    }
  }
}

(function main(){
  plateauEchec();
  let pion = new Pion();
  pion.affiche();
  pion.getImg();
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


//la case td du tableau donné en parametre devient disponible pour le placement du pion
function setCaseSelectionnable(td,pion){
  td.onmouseenter = function(e){ //la case devient bleu si elle est survolée
    e.target.style.backgroundColor = 'cyan';
  }
  td.onmouseout = function(e){ //la case redevient de sa couleur d'origine
    if(e.target.getAttribute('class') == 'whiteCase'){
      e.target.style.backgroundColor = 'white';
    }
    else {
      e.target.style.backgroundColor = 'maroon';
    }
  }
  td.style.color = 'cyan';
  
  td.onclick = function(e){ //si l'on sélectionne la case
    console.log("move to " + e.target.id);
    let td2;
    for(let sy = 0; sy < nombreCases; sy++){
      for(let sx = 0; sx < nombreCases; sx++){
        resetCase(document.getElementById('Case' + sx + sy));
      }
    }
    let a = parseInt(e.target.id.charAt(4));
    let b = parseInt(e.target.id.charAt(5));
    pion.move(a,b);
  }
}

function resetCase(td){
  td.style.color = 'black';
  td.onmouseenter = td.onmouseout = td.onclick = '';
  if(td.getAttribute('class') == 'whiteCase'){
    td.style.backgroundColor = 'white';
  }
  else {
    td.style.backgroundColor = 'maroon';
  }
}
