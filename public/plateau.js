var width;
var height;
var squareSize;
window.addEventListener("resize", resize);
var nombreCases = 8;

/**
* classe représentant une position sur un plan 2D (x,y)
*/
class Position2D {
  
  /**
  * affecte les valeurs x et y aux coordonnées du points.
  * dans le cas ou les valeurs ne sont pas données, la valeur sera affectée par défaut
  */
  constructor(x,y) {
    if(x == undefined) this.x = 0;
    else this.x = x;
    if(y == undefined) this.y = 0;
    else this.y = y;
    
  }
  
  //retourne une chaine de caractère représentant la position (pour afficher dans la console)
  log(){
    return '(' + this.x + ',' + this.y + ')';
  }
  
  // définir une nouvelle position
  set(x,y){
    this.x = x;
    this.y = y;
  }
}

/**
* classe représentant un pion basique, sert de structure pour les pions du jeu
*/
class Pion {
  
  //construit le pion
  constructor(color,x,y) {
    this.position = new Position2D(x,y);
    this.src = "https://cdn.glitch.com/cc360787-9153-4d34-a2e2-ddbd9bc2b9e4%2FBlackPawn.png?v=1583876671281";
    this.color = color;
    console.log("nouveau pion en " + this.position.log());
  }
  
  /*
  * place le pion sur le plateau en ajoutant la photo du pion associé à l'instance du pion
  */
  affiche(){
    let td = this.getCase();
    let piece = document.createElement('img');
    td.appendChild(piece);
    piece.src = this.src;
    piece.width = squareSize;
    piece.height = squareSize;
    piece.id = "_img" + this.position.x + this.position.y;
    //piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
  }
  
  //return la case <td> associé au pion
  getCase(){
    return document.getElementById('Case' + this.position.x + this.position.y);
  }
  
  //return l'image <img> associé au pion
  getImg(){
    return this.getCase().lastChild;
  }
  
  /*
  * deplace le pion su la case indiqué
  */
  move(x,y){
    if(x != this.position.x || y != this.position.y) {
      let td = this.getCase();
      let child = td.removeChild(td.lastChild);
      this.position.set(x,y);
      td = this.getCase();
      td.appendChild(child);
      console.log("pion déplacé en " + x + ' ' + y);
      let img = this.getImg();
      img.id = '_img' + x + y;
    }
  }
  
  //Efface le pion de sa position, retire son image du plateau
  delete(){
    let td = this.getCase();
    console.log("suppresion de l'image sur " + td.id);
    let img = td.lastChild;
    if(img != undefined) td.removeChild(img);
  }
  
  /*
  * modifie les cases qui respectent les règles de déplacement du pion
  * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
  * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
  */
  selectNewCase(){
    let td;
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        td = document.getElementById('Case' + x + y);
        
        if(!(this.position.x == x && this.position.y == y)){ //rendre toutes les cases selectionnable sauf celle du pion
          if(abs(this.position.x - x) == abs(this.position.y - y)){
             setCaseSelectionnable(td,this);
          }
        }
      }
    }
  }
}

class pionBasique extends Pion {
  constructor(color,x,y){
    super(color,x,y);
    this.firstMove = true;
  }
  
  selectNewCase(){
    
    
    let td;
    
    td = document.getElementById('Case' + this.position.x + (this.position.y - 1));
    if(getPion(this.position.x, this.position.y - 1) == undefined) setCaseSelectionnable(td,this);
    if(this.firstMove == true && getPion(this.position.x, this.position.y - 1) == undefined){
      td = document.getElementById('Case' + this.position.x + (this.position.y - 2));
      setCaseSelectionnable(td,this);
    }
    
    if(getPion(this.position.x - 1, this.position.y + 1) != undefined){
      td = document.getElementById('Case' + (this.position.x - 1) + (this.position.y + 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x + 1, this.position.y - 1) != undefined){
      td = document.getElementById('Case' + (this.position.x + 1) + (this.position.y - 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x - 1, this.position.y - 1) != undefined){
      td = document.getElementById('Case' + (this.position.x - 1) + (this.position.y - 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x + 1, this.position.y + 1) != undefined){
      td = document.getElementById('Case' + (this.position.x + 1) + (this.position.y + 1));
      setCaseSelectionnable(td,this);
    }
  }
  
  move(x,y){
    super.move(x,y);
    this.firstMove = false;
  }
}

//tableau de pions
var pions = [new Pion('white',2,0), new pionBasique('black',4,7)];

//supprime la photo du pion et la rajoute sur le plateau, pour refresh l'affichage
function refreshPions(){
  for(let i = 0; i < pions.length; i++) {
    if(pions[i] != undefined){
      pions[i].delete();
      pions[i].affiche();
    }
  }
}

function getPion(x,y){
  for(let i = 0; i < pions.length; i++) {
    if(pions[i] != undefined)
      if(pions[i].position.x == x && pions[i].position.y == y) return i;
  }
  return undefined;
}

//Initialisation des variables width and height au début et à chaque resize de la fenêtre d'affichage
function initVal(){
  width = window.innerWidth;//Récupération de la largeur de la fenêtre
  height = window.innerHeight;///Récupération de la hauteur de la fenêtre
  
  if (window.innerHeight > window.innerWidth) {//Si l'orientation de la fenêtre est portrait
    squareSize = (0.6 * width) / 8;//La longueur de la case est liée à width
  }
  else {squareSize = (0.6 * height) / 8;}//La largeur de la case est liée à height
}


/**
* crée les attributs du tableau pour faire l eplateau de jeu
* chaque case aura un identifiant associé à ses coordonnées qui prends la forme "Casexy" x et y les valeurs de la position
* une classe whiteCase ou blackCase sera affectée à la case selon qu'elle soit blanche ou noir
*/
function plateauEchec(){
  let plateau = document.getElementById('plateau');
  initVal();
  let tr;
  let td;
  
  var table = document.createElement('table');
  plateau.appendChild(table);
  
  table.setAttribute('id', 'tableEchec');
  table.addEventListener('click',eventTableEchec);
  for(let y = 0; y < nombreCases; y++){
    tr = document.createElement('tr');
    tr.setAttribute('id','row' + y);
    
    for(let x = 0; x < nombreCases; x++){
      td = document.createElement('td');
      td.setAttribute('id', 'Case' + x + y);
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

/*Fonction appelée à chaque redimensionnement, pour adapter la taille de l'interface du jeu à la 
fenêtre d'affichage*/
function resize(){
  initVal();
  
  refreshPions();
}

//fonction de départ du script
(function main(){
  plateauEchec();
  refreshPions();
})();

/*
* la case devient verte s'il n'y a pas de pion déjà présent
* la case devient rouge si un pion ennemi est présent sur la case
* la case reste inchangé si un pion ami est présent sur la case
*/
function setCaseSelectionnable(td,pion){
  //couleur de discernement de la case pour être choisit pour le déplacement (rouge si un pion se trouve déjà sur la case)
  var newClass = (td.firstChild == undefined)? 'selectCase' : 'selectCollision';
  
  if(newClass == 'selectCollision'){
    let i = getPion(parseInt(td.id.charAt(4)),parseInt(td.id.charAt(5)));
    if(i != undefined) {
      if(pions[i].color != pion.color){
        td.className = newClass;
      }
    }
  }
  else {
    td.className = newClass;
  }
}

//supprime les évènements et rends les couleurs d'origine à toutes les cases du plateau
function resetAllCases(){
  for(let y = 0; y < nombreCases; y++){
    for(let x = 0; x < nombreCases; x++){
      resetCase(document.getElementById('Case' + x + y));
    }
  }
}

/*
* la case donnée en paramètre est réinitialisée
* avec modification de la couleur pour la couleur d'origine de la case
*/
function resetCase(td) {
  let color = parseInt(td.id.charAt(4)) + parseInt(td.id.charAt(5));
  if(color % 2 == 0){
    td.className = 'whiteCase';
  }
  else {
    td.className = 'blackCase';
  }
}

//variable pour l'evenement
var pion_a_deplacer = undefined;
var source = undefined;
var destination = undefined;

function eventTableEchec(event){
  let x = parseInt(event.target.id.charAt(4));
  let y = parseInt(event.target.id.charAt(5));
  if(source == undefined){ //définit la position de départ (si un pion est présent)
    let i = getPion(x,y);
    if(i != undefined) pion_a_deplacer = pions[i];
    if(pion_a_deplacer != undefined){
      source = new Position2D(x,y);
      pion_a_deplacer.selectNewCase();
    }
  }
  else { //si la source est déjà définit
    if(x == source.x && y == source.y){ //on annule la sélection du pion en cliquant à nouveau sur la source
      source = undefined;
      resetAllCases();
    }
    else { //la case n'est pas la position source
      if(event.target.className == 'selectCase'){ //la case est accessible par le pion
        pion_a_deplacer.move(x,y);
        resetAllCases();
        destination = new Position2D(x,y);
        /*
        transmission au serveur des positions de déplacement
        code non implémentée
        */
        source = undefined;
      }
      else if(event.target.id == '_img' + x + y && document.getElementById('Case' + x + y).className == 'selectCollision'){ //la case contient un autre pion
        let j = getPion(x,y);
        if(j != undefined) {
          pions[j].delete(); //le pion est retirée de l'affichage
          pions[j] = undefined; //le pion devient indéfini dans le tableau (si vous savez comment le retirer du tableau pions[] n'hésitez pas a modifier cette ligne)
        }
        resetAllCases();
        pion_a_deplacer.move(x,y);
        destination = new Position2D(x,y);
        /*
        transmission au serveur des positions de déplacement
        code non implémentée
        */
        source = undefined;
      }
    }
  }
}

//retourne la valeur absolue de "valeur"
function abs(valeur){
  return (valeur > 0)? valeur : -valeur;
}