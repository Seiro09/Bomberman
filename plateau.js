var width;
var height;
var squareSize;
var pion;
window.addEventListener("resize", resize);
var nombreCases = 8;


//Initialisation des variables width and height au début et à chaque resize de la fenêtre d'affichage
function initVal(){
  width = window.innerWidth;//Récupération de la largeur de la fenêtre
  height = window.innerHeight;///Récupération de la hauteur de la fenêtre
  
  if (window.innerHeight > window.innerWidth) {//Si l'orientation de la fenêtre est portrait
    squareSize = (0.6 * width) / 8;//La longueur de la case est liée à width
  }
  else {squareSize = (0.6 * height) / 8;}//La largeur de la case est liée à height
}

function plateauEchec(){
  let plateau = document.getElementById('plateau');
  initVal();
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
      /*td.setAttribute('width', squareSize + 'px');
      td.setAttribute('height', squareSize + 'px');*/
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



class Position2D {
  constructor(x,y) {
    if(x == undefined) this.x = 0;
    else this.x = x;
    if(y == undefined) this.y = 0;
    else this.y = y;
    
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
    this.src = "https://cdn.glitch.com/cc360787-9153-4d34-a2e2-ddbd9bc2b9e4%2FBlackPawn.png?v=1583876671281";
    console.log("nouveau pion en " + this.position.log());
  }
  
  //place le pion sur le plateau
  affiche(){
    let td = this.getCase();
    let piece = document.createElement('img');
    td.appendChild(piece);
    let me = this; //se copier pour les fonctions ou le this n'est plus possible
    piece.src = this.src;
    piece.width = squareSize;
    piece.height = squareSize;
    //piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
    this.setSelectable();
  }
  
  //rendre le pion sélectionnable
  setSelectable(){
    let me = this;
    this.getImg().addEventListener('click', function(e){
      me.selectNewCase();
    })
  }
  
  setNonSelectable(){
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
  
  //Efface le pion de sa position
  delete(){
    let img =document.getElementById('Case' + this.position.x + this.position.y);
    while (img.firstChild) {
      img.removeChild(img.lastChild);
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

/*Fonction appelée à chaque redimensionnement, pour adapter la taille de l'interface du jeu à la 
fenêtre d'affichage*/
function resize(){
  initVal();
  
  pion.delete();
  pion.affiche();
  pion.getImg();
}

(function main(){
  plateauEchec();
  pion = new Pion();
  pion.affiche();
  pion.getImg();
})();




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
      e.target.style.backgroundColor = 'black';
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
    td.style.backgroundColor = 'black';
  }
}
