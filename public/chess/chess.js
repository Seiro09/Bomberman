var width;
var height;
var squareSize;
window.addEventListener("resize", resize);
var nombreCases = 8;
var colorPlayer;
var jouer;

//tableau de pions
var pions = undefined;

var socket = io.connect();

function getCodeSalon(){
  let url = document.location.href;
  let split = url.split('salon/');
  return split[1];
}

socket.emit('askColor', getCodeSalon());

socket.on('giveColor', function(message){
  colorPlayer = message;
  if(message == 'error'){
    let plateau = document.getElementById('plateau');
    let p = document.createElement('p');
    plateau.appendChild(p);
    p.innerHTML = 'Ce salon est complet. Cliquez <a href = "/">ici</a> pour revenir sur la page d\'accueil.';
  }
  else {
    plateauEchec();
    initPions();
    refreshPions();
    jouer = false;
    if(colorPlayer == 'white') document.getElementById('attenteJoueur').innerHTML = 'En attente du joueur adverse';
    else {
      console.log('send ready');
      socket.emit('ready', getCodeSalon());
    }
  }
});

socket.on('ready', function(message){
  console.log('receive ready');
  jouer = true;
  document.getElementById('attenteJoueur').innerHTML = '';
});

socket.on('stop', function(message){
  let plateau = document.getElementById('plateau');
    let p = document.createElement('p');
    plateau.appendChild(p);
    p.innerHTML = 'Votre adversaire a quitté, le salon a donc été fermé. Cliquez <a href = "/">ici</a> pour revenir sur la page d\'accueil.';
});

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
    this.type = 'pion';
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


class Pawn extends Pion {
  constructor(color,x,y){
    super(color,x,y);
    if(color=='white') this.src= "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhitePawn.png";
    else this.src="https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackPawn.png";
    this.firstMove = true;
    this.type = 'Pawn';
  }
  
  selectNewCase(){
    
    
    let td;
    
    td = document.getElementById('Case' + this.position.x + (this.position.y - 1));
    if(getPion(this.position.x, this.position.y - 1) == undefined) //case devant lui
      setCaseSelectionnable(td,this);
    
    if(this.firstMove == true && getPion(this.position.x, this.position.y - 1) == undefined){ //deuxieme case devant lui
      td = document.getElementById('Case' + this.position.x + (this.position.y - 2));
      setCaseSelectionnable(td,this);
    }
    
    if(getPion(this.position.x - 1, this.position.y + 1) != undefined){ // pion en bas a gauche
      td = document.getElementById('Case' + (this.position.x - 1) + (this.position.y + 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x + 1, this.position.y - 1) != undefined){ //pion en haut a droite
      td = document.getElementById('Case' + (this.position.x + 1) + (this.position.y - 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x - 1, this.position.y - 1) != undefined){ //pion en haut a gauche
      td = document.getElementById('Case' + (this.position.x - 1) + (this.position.y - 1));
      setCaseSelectionnable(td,this);
    }
    if(getPion(this.position.x + 1, this.position.y + 1) != undefined){ //pion en bas a droite
      td = document.getElementById('Case' + (this.position.x + 1) + (this.position.y + 1));
      setCaseSelectionnable(td,this);
    }
  }
  
  move(x,y){
    super.move(x,y);
    this.firstMove = false;
  }
}

class Bishop extends Pion {
  
  //construit le pion
  constructor(color,x,y) {
    super(color,x,y);
    if(color=='white') this.src= "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteBishop.png";
    else this.src="https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackBishop.png";
    this.type = 'Bishop';
  }
  
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

class Knight extends Pion{
  
  //construit le pion
  constructor(color,x,y) {
    super(color,x,y);
    if(color=='white') this.src= "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteKnight.png";
    else this.src="https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackKnight.png";
    this.type = 'Knight';
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
          if((abs(this.position.x - x) <= 2 && abs(this.position.x - x) >= 0) 
             && (abs(this.position.y - y) <= 2 && abs(this.position.y - y) >= 0)
             && ((abs(this.position.y - y) + abs(this.position.x - x)) == 3)){
             setCaseSelectionnable(td,this);
          }
        }
      }
    }
  }
}

class Queen extends Pion {
  
  //construit le pion
  constructor(color,x,y) {
    super(color,x,y);
    if(color=='white') this.src= "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteQueen.png";
    else this.src="https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackQueen.png";
    this.type = 'Queen';
  }
  
  /*
  * modifie les cases qui respectent les règles de déplacement du pion
  * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
  * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
  */
  selectNewCase(){
    let td;
    let td1;
    let td2;
    let td3;
    let td4;
    let position_X = this.position.x;
    let position_Y = this.position.y;
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        td = document.getElementById('Case' + x + y);
        if(!(position_X == x && position_Y == y)){ //rendre toutes les cases selectionnable sauf celle du pion
          if(abs(this.position.x - x) == abs(this.position.y - y)){
             setCaseSelectionnable(td,this);
          }
        } 
      }
    }
   
     
    for(let y = 4; y < nombreCases; y++){
    for(let x=this.position.x; x < nombreCases; x++){
       td1 = document.getElementById('Case' + this.position.x + y);
         setCaseSelectionnable(td1,this);
      }
    }
  
    
    for(let y = 0; y < 4; y++){
    for(let x=this.position.x; x < nombreCases; x++){
       td2 = document.getElementById('Case' + this.position.x + y);
         setCaseSelectionnable(td2,this);
      }
    }
     
      
    let y=this.position.y;
    for(let x=this.position.x; x >-1; x--){
       td3 = document.getElementById('Case' + x + y);
         setCaseSelectionnable(td3,this);
    }
     
     
    for(let x=this.position.x; x <nombreCases; x++){
       td3 = document.getElementById('Case' + x + y);
         setCaseSelectionnable(td3,this);
    }
  }
}


class King extends Pion {
  
  //construit le pion
  constructor(color,x,y) {
    super(color,x,y);
    if (color == 'white') this.src = "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteKing.png";
    else this.src = "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackKing.png";
    this.type = 'King';
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
          if((abs(this.position.x - x) == 1 || abs(this.position.x - x) == 0) 
             && (abs(this.position.y - y) == 0 || abs(this.position.y - y) == 1)){
             setCaseSelectionnable(td,this);
          }
        }
      }
    }
  }
}

function initPions(){
  if(colorPlayer == 'white') {
    pions = [new Pawn('black',0,1),new Pawn('black',1,1),new Pawn('black',2,1),new Pawn('black',3,1),
               new Pawn('black',4,1),new Pawn('black',5,1),new Pawn('black',6,1),new Pawn('black',7,1),
               new Pawn('white',0,6),new Pawn('white',1,6),new Pawn('white',2,6),new Pawn('white',3,6),
               new Pawn('white',4,6),new Pawn('white',5,6),new Pawn('white',6,6),new Pawn('white',7,6),
               new King('black',4,0),new King('white',4,7),new Queen('black',3,0),new Queen('white',3,7),
               new Bishop('black',2,0),new Bishop('black',5,0),new Bishop('white',2,7),new Bishop('white',5,7),
               new Knight('black',1,0),new Knight('black',6,0),new Knight('white',1,7),new Knight('white',6,7)];
  }
  else if(colorPlayer == 'black') {
    pions = [new Pawn('white',0,1),new Pawn('white',1,1),new Pawn('white',2,1),new Pawn('white',3,1),
               new Pawn('white',4,1),new Pawn('white',5,1),new Pawn('white',6,1),new Pawn('white',7,1),
               new Pawn('black',0,6),new Pawn('black',1,6),new Pawn('black',2,6),new Pawn('black',3,6),
               new Pawn('black',4,6),new Pawn('black',5,6),new Pawn('black',6,6),new Pawn('black',7,6),
               new King('white',3,0),new King('black',3,7),new Queen('white',4,0),new Queen('black',4,7),
               new Bishop('white',2,0),new Bishop('white',5,0),new Bishop('black',2,7),new Bishop('black',5,7),
               new Knight('white',1,0),new Knight('white',6,0),new Knight('black',1,7),new Knight('black',6,7)];
  }
}

//supprime la photo du pion et la rajoute sur le plateau, pour refresh l'affichage
function refreshPions(){
  if(pions != undefined){
    for(let i = 0; i < pions.length; i++) {
      if(pions[i] != undefined){
        pions[i].delete();
        pions[i].affiche();
      }
    }
  }
}

//retourne le pion present en position x,y, et undefined sinon
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
var indice;
var source = undefined;
var destination = undefined;

function eventTableEchec(event){
  let x = parseInt(event.target.id.charAt(4));
  let y = parseInt(event.target.id.charAt(5));
  if(source == undefined){ //définit la position de départ (si un pion est présent)
    let i = getPion(x,y);
    if(i != undefined && jouer) {
      if(pions[i].color == colorPlayer) {
        source = new Position2D(x,y);
        document.getElementById('Case' + source.x + source.y).className = 'selectPion';
        pions[i].selectNewCase();
        indice = i;
      }
    }
  }
  else { //si la source est déjà définit
    if(x == source.x && y == source.y){ //on annule la sélection du pion en cliquant à nouveau sur la source
      source = undefined;
      resetAllCases();
    }
    else { //la case n'est pas la position source
      if(event.target.className == 'selectCase'){ //la case est accessible par le pion
        pions[indice].move(x,y);
        resetAllCases();
        destination = new Position2D(x,y);
        /*
        transmission au serveur des positions de déplacement
        code non implémentée
        */
        
        jouer = false;
        socket.emit('deplacement', source.x + ',' + source.y + ',' + destination.x + ',' + destination.y);
        
        source = undefined;
      }
      else if(event.target.id == '_img' + x + y && document.getElementById('Case' + x + y).className == 'selectCollision'){ //la case contient un autre pion
        let j = getPion(x,y);
        if(j != undefined) {
          pions[j].delete(); //le pion est retirée de l'affichage
          pions[j] = undefined; //le pion devient indéfini dans le tableau
        }
        resetAllCases();
        pions[indice].move(x,y);
        destination = new Position2D(x,y);
        /*
        transmission au serveur des positions de déplacement
        code non implémentée
        */
        
        jouer = false;
        socket.emit('deplacement', source.x + ',' + source.y + ',' + destination.x + ',' + destination.y);
        
        source = undefined;
      }
    }
  }
}

socket.on('deplacement', function(message){
  console.log('deplacement distant obtenu : '+ message);
  let position = message.split(',');
  source = new Position2D(parseInt(position[0]), parseInt(position[1]));
  destination = new Position2D(parseInt(position[2]), parseInt(position[3]));
  let i = getPion(source.x,source.y);
  let j = getPion(destination.x,destination.y);
  console.log(i + ' ' + j);
  if(j != undefined){
    console.log(pions[j].color + ' ' + colorPlayer);
    if(pions[j].color == colorPlayer){
      console.log('pion a supprimer en ' + pions[j].position.log());
      pions[j].delete();
      pions[j] = undefined;
    }
    pions[i].move(destination.x, destination.y);
  }
  else {
    pions[i].move(destination.x, destination.y);
  }
  jouer = true;
  source = undefined;
});

//retourne la valeur absolue de "valeur"
function abs(valeur){
  return (valeur > 0)? valeur : -valeur;
}
