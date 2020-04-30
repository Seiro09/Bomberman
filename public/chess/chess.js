//variable pour redimensionner le plateau en fonction de la taille de la fenêtre
var width;
var height;
var squareSize;
window.addEventListener("resize", resize);

var nombreCases = 8;//dimensions du plateau
var colorPlayer; //indique si le joueur joue les pions blancs ou noirs
var jouer; //indique si le joueur peut jouer

//tableau de pions, contient la liste des pions présent sur le plateau
var pions = undefined;

var KingJoueur; //contient le roi du joueur courant (aussi présent dans le plateau)
var KingAdverse; //contient le roi du joueur adverse (aussi présent dans le plateau)

//initialisation du socket
var socket = io.connect();

//vérifie que le joueur est connecté, dans ce cas il transmet les informations de connexion
//sinon un message s'affiche lui indiquant de se connecter
//et un lien de redirection est indiqué pour se connecter
if(sessionStorage.getItem('username') != undefined) {
  var message = {
    "username" : sessionStorage.getItem('username'),
    "mdp" : sessionStorage.getItem('mdp')
  };
  setTimeout(function(){
    socket.emit('login', JSON.stringify(message));
  },1000);
}
else {
  document.getElementById('indication').innerHTML = 'Vous devez être connecté pour jouer. Cliquez <a href = "/login">ici</a> pour vous connecter.';
}

//reception de la réponse de connexion du server et traitement
//si les informations de connexions sont invalides le client est invité à se connecter
//dans le cas contraire, un message demandant la couleur qui lui sera attribué pour jouer est envoyé au server
socket.on('login', function(message){
  if(message != 'true'){
    sessionStorage.clear();
    document.getElementById('indication').innerHTML = 'Vous devez être connecté pour jouer. Cliquez <a href = "/login">ici</a> pour vous connecter.';
  }
  else {
    //demande la couleur qui lui sera attribué pour jouer
    socket.emit('askColor', getCodeSalon());
  }
});


//récupérer le code du salon avec l'url
function getCodeSalon(){
  let url = document.location.href;
  let split = url.split('salon/');
  if(split[1] == undefined || sessionStorage.getItem('pseudo') == undefined) {
    document.getElementById('indication').innerHTML = 'Une erreur est survenu. Cliquez <a href = "/accueil">ici</a> pour revenir sur la page d\'accueil.';
  }
  let split2 = split[1].split('?');
  return split2[0];
}

//reçoit une reponse du serveur pour la couleur
socket.on('giveColor', function(message){
  colorPlayer = message;
  console.log(message);
  if(message == 'error'){ //le serveur envoie error car 2 joueurs sont déjà présents
    let plateau = document.getElementById('plateau');
    let p = document.createElement('indication');
    plateau.appendChild(p);
    p.innerHTML = 'Ce salon est complet. Cliquez <a href = "/accueil">ici</a> pour revenir sur la page d\'accueil.';
  }
  else {
    plateauEchec(); //dessine le plateau
    initPions();    //intialise les pions selon la couleur du joueur
    refreshPions(); //affiche les pions sur le plateau
    jouer = false;
    if(colorPlayer == 'white') document.getElementById('indication').innerHTML = 'En attente du joueur adverse'; //on attends le joueur noir pour commencer
    else {
      //le joueur noir préviens le serveur que le blanc peut commencer à jouer
      socket.emit('ready', getCodeSalon());
      console.log('ready');
      document.getElementById('indication').innerHTML = "C'est au tour de l'adversaire";
    }
  }
});

//après que le joueur noir ait envoyé 'ready' au server,
//le server indique au joueur blanc qu'il peut commencer à joueur
socket.on('ready', function(message){
  console.log('receive ready');
  jouer = true;
  document.getElementById('indication').innerHTML = 'A vous de jouer';
});

//le serveur émet stop car un joueur est parti donc le salon est fermé par le serveur
socket.on('stop', function(message){
  console.log('stop');
  let plateau = document.getElementById('plateau');
    let p = document.getElementById('indication');
    p.innerHTML = 'Votre adversaire a quitté, le salon a donc été fermé. Cliquez <a href = "/accueil">ici</a> pour revenir sur la page d\'accueil.';
});

//le joueur adverse a perdu et a transmit 'fin' au serveur qui transmet à son tour au joueur courant qu'il a gagné
socket.on('fin', function(message) {
  var data = {
    "username" : sessionStorage.getItem("username"),
    "mdp" : sessionStorage.getItem("mdp"),
    "resultat" : 1
  };
  socket.emit("ajoutResultat", JSON.stringify(data));
  alert('Vous avez gagné !')
  document.getElementById('indication').innerHTML = '<a href = "/accueil">Retourner à l\'accueil</a>';
});

//le salon n'existe pas, le serveur a donc indiqué au client de revenir au menu
socket.on('redirectError', function(message){
  document.getElementById('indication').innerHTML = 'Ce salon n\'existe pas. Cliquez <a href = "/accueil">ici</a> pour revenir sur la page d\'accueil.';
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
  
  setP(position){
    this.x = position.x;
    this.y = position.y;
  }
}

/**
* classe représentant un pion basique, sert de structure pour les pions du jeu
*/
class Pion {
  
  //construit le pion
  constructor(color,x,y) {
    this.position = new Position2D(x,y);
    this.src = "";
    this.color = color;
    this.type = 'pion';
    this.fakePosition = new Position2D(x,y); //position factice (pour des tests futurs)
    this.placementsPossibles = []; //liste des placements possibles du pion
  }
  
  /*
  * la photo du pion est ajouté dans la balise <td> du plateau associé à sa position
  */
  affiche(){
    let td = this.getCase();
    let piece = document.createElement('img');
    td.appendChild(piece);
    piece.src = this.src;
    piece.width = squareSize;
    piece.height = squareSize;
    piece.id = "_img" + this.position.x + this.position.y;
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
      this.fakePosition.setP(this.position);
      this.placementsPossibles = [];
    }
  }
  
  //teste si un pion adverse peut manger le pion actuel
  //utilise les positions factices pour anticiper des déplacements futurs (vérifier un échec et math)
  //retourne true si le pion peut être mangé et false sinon
  isEdible(){
    let td;
    var verif;
    let x = this.fakePosition.x;
    let y = this.fakePosition.y;
    let i;
    verif = "vide";
    
    //deplacement en ligne droite
    while (x < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x++;
    }
    i = getFakePion(x - 1, y);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Rook' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = 'vide';
    while (x >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x--;
    }
    i = getFakePion(x + 1, y);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Rook' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = 'vide';
    while (y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      y--;
    }
    i = getFakePion(x, y + 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Rook' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = 'vide';
    while (y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      y++;
    }
    i = getFakePion(x, y - 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Rook' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    //deplacement en diagonale
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif='vide';
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x++;
      y++;
    }
    i = getFakePion(x - 1, y - 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Bishop' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x--;
      y--;
    }
    i = getFakePion(x + 1, y + 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Bishop' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
        let distance = abs(pions[i].fakePosition.x - this.fakePosition.x) + abs(pions[i].fakePosition.y - this.fakePosition.y);
        if(pions[i].type == 'Pawn' && distance == 2) {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x++;
      y--;
    }
    i = getFakePion(x - 1, y + 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Bishop' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
        let distance = abs(pions[i].fakePosition.x - this.fakePosition.x) + abs(pions[i].fakePosition.y - this.fakePosition.y);
        if(pions[i].type == 'Pawn' && distance == 2) {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.fakePosition.x || y != this.fakePosition.y) verif = getFakePion(x, y) == undefined ? "vide" : "nonVide";
      x--;
      y++;
    }
    i = getFakePion(x + 1, y - 1);
    if(i != undefined){
      if(pions[i].color != this.color){
        if(pions[i].type == 'Bishop' || pions[i].type == 'Queen') {
          console.log(pions[i].type + " : " + pions[i].fakePosition.log());
          return true;
        }
      }
    }
    
    //deplacement cavalier
    x = this.fakePosition.x;
    y = this.fakePosition.y;
    i = getFakePion(x + 2, y + 1); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x + 1, y + 2); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x - 2, y - 1); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x - 1, y - 2); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x + 2, y - 1); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x + 1, y - 2); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x - 2, y + 1); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    i = getFakePion(x - 1, y + 2); if(i != undefined) if(pions[i].type == 'Knight' && pions[i].color != this.color) return true;
    
    //si les rois sont proches l'un de l'autre
    if(abs(KingAdverse.fakePosition.x - x) + abs(KingAdverse.fakePosition.y - y) == 1) return true;
    if(abs(KingAdverse.fakePosition.x - x) == 1 && abs(KingAdverse.fakePosition.y - y) == 1) return true;
    
    return false;
  }
  
  //Efface le pion de sa position, retire son image du plateau
  delete(){
    let td = this.getCase();
    let img = td.lastChild;
    if(img != undefined) td.removeChild(img);
  }
  
  /*
  * sélectionne les cases qui respectent les règles de déplacement du pion
  * sélectionne certaines cases et les ajoutent à la liste des placements possibles
  */
  selectNewCase(){
    this.placementsPossibles = [];
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        let td = document.getElementById('Case' + x + y);
        
        if(!(this.position.x == x && this.position.y == y)){ //rendre toutes les cases selectionnable sauf celle du pion
          if(abs(this.position.x - x) == abs(this.position.y - y)){
            this.placementsPossibles.push(td);
          }
        }
      }
    }
  }
  
  //retire les placements possibles sur les pions amis
  cleanMovePossible(){
    for(let i = this.placementsPossibles.length - 1; i >= 0; i--){
      if(i < this.placementsPossibles.length){
        let td = this.placementsPossibles[i]; 
        let x = parseInt(td.id.charAt(4));
        let y = parseInt(td.id.charAt(5));
        let j = getPion(x,y);
        if(j != undefined){
          if(pions[j].color == this.color){
            this.placementsPossibles.splice(i, 1);
          }
        }
      }
    }
  }
  
  //modifie la classe des balises <td> pour afficher les cases accessibles au pion sélectionné par le client
  editNewCases(){
    for(let i = 0; i < this.placementsPossibles.length; i++){
      setCaseSelectionnable(this.placementsPossibles[i],this);
    }
  }
  
  //récupérer la position du pion
  getPosition() {
    return this.position;
  }
  
  //récupérer la couleur
  getColor() {
    return this.color;
  }
  
  //récupérer le type du pion
  getType() {
    return this.type;
  }
}

//classe pour le pion Pawn
class Pawn extends Pion {
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhitePawn.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackPawn.png";
    this.firstMove = true;
    this.type = "Pawn";
    this.evolve = false;
  }
  
  //2 cases devant lui si c'est son premier déplacement
  //une case devant lui pour le reste de ses déplacements
  //ne peut manger qu'en diagonale devant lui à une distance de 1
  selectNewCase() {
    let td;
    this.placementsPossibles = [];
    td = document.getElementById("Case" + this.position.x + (this.position.y - 1));
    
    if (getPion(this.position.x, this.position.y - 1) == undefined)
      //case devant lui
      this.placementsPossibles.push(td);

    if (this.firstMove == true && getPion(this.position.x, this.position.y - 1) == undefined
       && getPion(this.position.x, this.position.y - 2) == undefined) {
      //deuxieme case devant lui
      td = document.getElementById("Case" + this.position.x + (this.position.y - 2));
      this.placementsPossibles.push(td);
    }

    if (getPion(this.position.x - 1, this.position.y - 1) != undefined) {
      // pion en haut a gauche
      td = document.getElementById("Case" + (this.position.x - 1) + (this.position.y - 1));
      this.placementsPossibles.push(td);
    }
    if (getPion(this.position.x + 1, this.position.y - 1) != undefined) {
      //pion en haut a droite
      td = document.getElementById("Case" + (this.position.x + 1) + (this.position.y - 1));
      this.placementsPossibles.push(td);
    }
  }
  
  //déplace le pion. si le pion atteint le haut du plateau,
  //il peut choisir parmi les 4 pièces (cavalier, fou, tour ou reine) et être promu.
  //il est donc remplacé par le type de pion choisit
  //un formumaire pour choisir le type est ajouté dans la page web
  move(x, y) {
    let me = this;
    super.move(x, y);
    this.firstMove = false;
    if(y == 0 && this.evolve == false){
      console.log("evolve");
      this.evolve = true;
      let formulaire = 
        '<form id = "evolve">\
          <select id = "selectEvolve">\
            <option value = "Knight">Cavalier</option>\
            <option value = "Bishop">Fou</option>\
            <option value = "Queen">Reine</option>\
            <option value = "Rook">Tour</option>\
          </select>\
          <button id = "buttonEvolve" type = "submit">Valider le nouveau type</button>\
        </form>';
      document.getElementById('indication').innerHTML = formulaire;
      let form = document.getElementById('evolve');
      form.addEventListener('submit', function(e){
        e.preventDefault(); //ne pas quitter la page
        let select = document.getElementById('selectEvolve');
        let choice = select.selectedIndex;
        evolve(me, select.options[choice].value);
      });
    }
  }
}

//classe pour le pion Bishop
class Bishop extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhiteBishop.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackBishop.png";
    this.type = "Bishop";
  }

  //déplacement en diagonale
  selectNewCase(){
    this.placementsPossibles = [];
    let td;
    var verif = "vide";
    var x = this.position.x;
    var y = this.position.y;
   
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
      y--;
    }
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
      y++;
    }
  }
}

//classe pour le pion Rook
class Rook extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhiteRook.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackRook.png";
    this.type = "Rook";
  }

  //déplacements en ligne droite
  selectNewCase() {
    this.placementsPossibles = [];
    let td;
    var verif;
    let x = this.position.x;
    let y = this.position.y;
    verif = "vide";
    while (x < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (x >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      y++;
    }
  }
}

//classe pour le pion Knight
class Knight extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhiteKnight.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackKnight.png";
    this.type = "Knight";
  }

  //déplacement en L du pion sur les 8 positions possibles
  selectNewCase() {
    this.placementsPossibles = [];
    let td;
    for (let y = 0; y < nombreCases; y++) {
      for (let x = 0; x < nombreCases; x++) {
        td = document.getElementById("Case" + x + y);

        if (!(this.position.x == x && this.position.y == y)) {
          //rendre toutes les cases selectionnable sauf celle du pion
          if (
            abs(this.position.x - x) <= 2 &&
            abs(this.position.x - x) >= 0 &&
            (abs(this.position.y - y) <= 2 && abs(this.position.y - y) >= 0) &&
            abs(this.position.y - y) + abs(this.position.x - x) == 3
          ) {
            this.placementsPossibles.push(td);
          }
        }
      }
    }
  }
}

//classe pour le pion Queen
class Queen extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhiteQueen.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackQueen.png";
    this.type = "Queen";
  }

  //déplacements en diagonale et en ligne droite
  selectNewCase() {
    this.placementsPossibles = [];
    let td;
    var verif;
    let x = this.position.x;
    let y = this.position.y;
    verif = "vide";
    
    while (x < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (x >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif='vide';
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x++;
      y--;
    }
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      this.placementsPossibles.push(td);
      x--;
      y++;
    }
  }
}

//classe pour le pion King
class King extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/WhiteKing.png";
    else this.src =
        "https://raw.githubusercontent.com/Seiro09/Chess/ImagesPieces/FinalPieces/BlackKing.png";
    this.type = "King";
  }

  //déplacement autour de lui à une distance de 1 en diagonale et en ligne droite
  selectNewCase() {
    this.placementsPossibles = [];
    let td;
    for (let y = 0; y < nombreCases; y++) {
      for (let x = 0; x < nombreCases; x++) {
        td = document.getElementById("Case" + x + y);

        if (!(this.position.x == x && this.position.y == y)) {
          //rendre toutes les cases selectionnable sauf celle du pion
          if (
            (abs(this.position.x - x) == 1 || abs(this.position.x - x) == 0) &&
            (abs(this.position.y - y) == 0 || abs(this.position.y - y) == 1)
          ) {
            this.placementsPossibles.push(td);
          }
        }
      }
    }
  }
}


//initialise les pions selon la couleur du joueur, les pions qui lui sont attribués seront en bas du plateau
function initPions(){
  console.log('initialisation des pions');
  let autrePion = (colorPlayer == 'white')? 'black' : 'white';
  pions = [
    new Pawn(autrePion, 0, 1),
    new Pawn(autrePion, 1, 1),
    new Pawn(autrePion, 2, 1),
    new Pawn(autrePion, 3, 1),
    new Pawn(autrePion, 4, 1),
    new Pawn(autrePion, 5, 1),
    new Pawn(autrePion, 6, 1),
    new Pawn(autrePion, 7, 1),
    new Pawn(colorPlayer, 0, 6),
    new Pawn(colorPlayer, 1, 6),
    new Pawn(colorPlayer, 2, 6),
    new Pawn(colorPlayer, 3, 6),
    new Pawn(colorPlayer, 4, 6),
    new Pawn(colorPlayer, 5, 6),
    new Pawn(colorPlayer, 6, 6),
    new Pawn(colorPlayer, 7, 6),
    new Bishop(autrePion, 2, 0),
    new Bishop(autrePion, 5, 0),
    new Bishop(colorPlayer, 2, 7),
    new Bishop(colorPlayer, 5, 7),
    new Knight(autrePion, 1, 0),
    new Knight(autrePion, 6, 0),
    new Knight(colorPlayer, 1, 7),
    new Knight(colorPlayer, 6, 7),
    new Rook(autrePion, 0, 0),
    new Rook(autrePion, 7, 0),
    new Rook(colorPlayer, 7, 7),
    new Rook(colorPlayer, 0, 7)
  ];
  if(colorPlayer == 'white'){
    pions.push(new Queen(autrePion, 3, 0),
    new Queen(colorPlayer, 3, 7),
    KingAdverse = new King(autrePion, 4, 0),
    KingJoueur = new King(colorPlayer, 4, 7));
  }
  else {
    pions.push(new Queen(autrePion, 4, 0),
    new Queen(colorPlayer, 4, 7),
    KingAdverse = new King(autrePion, 3, 0),
    KingJoueur = new King(colorPlayer, 3, 7));
  }
}

//supprime la photo du pion et la rajoute sur le plateau, pour refresh l'affichage
function refreshPions(){
  console.log('refresh des pions');
  if(pions != undefined){
    for(let i = 0; i < pions.length; i++) {
      if(pions[i] != undefined){
        pions[i].delete();
        pions[i].affiche();
      }
      else {
        pions.splice(i,1);
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

//retourne le pion present en position x,y, et undefined sinon
function getFakePion(x,y){
  for(let i = 0; i < pions.length; i++) {
    if(pions[i] != undefined)
      if(pions[i].fakePosition.x == x && pions[i].fakePosition.y == y) return i;
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
* crée les attributs du tableau pour faire le plateau de jeu
* chaque case aura un identifiant associé à ses coordonnées qui prends la forme "Casexy" x et y les valeurs de la position
* une classe whiteCase ou blackCase sera affectée à la case selon qu'elle soit blanche ou noir
*/
function plateauEchec(){
  console.log('chargement du plateau');
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
function setCaseSelectionnable(td,pion, check){
  //couleur de discernement de la case pour être choisit pour le déplacement (rouge si un pion se trouve déjà sur la case)
  var newClass = (td.firstChild == undefined)? 'selectCase' : 'selectCollision';
  
  if(newClass == 'selectCollision'){ //un pion est présent sur la case
    let i = getPion(parseInt(td.id.charAt(4)),parseInt(td.id.charAt(5)));
    if(i != undefined) {
      if(pions[i].color != pion.color){ //c'est un pion adverse donc on peut mettre la case en rouge sinon la case reste inchangée
        if(check == undefined) td.className = newClass;
        else {
          
        }
      }
    }
  }
  else { //s'il n'y a pas de pions
    if(check == undefined) td.className = newClass;
  }
}

//rends les couleurs d'origine à toutes les cases du plateau
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
var indice; //indice dans le plateau du pion à déplacer
var source = undefined; //position de départ du pion, indique si un pion est sélectionnée pour le déplacer
var destination = undefined; //position d'arrivée du pion

//ecoute le tableau, si une case est cliquée, différents états du plateau modifient les variables pour l'évènement 
function eventTableEchec(event){
  let x = parseInt(event.target.id.charAt(4));
  let y = parseInt(event.target.id.charAt(5));
  if(source == undefined){ //si l'on clique sur le pion , il devient sélectionné si le joueur a le droit de le déplacer
    let i = getPion(x,y);
    if(i != undefined && jouer) { //s'il peut jouer le pion la source est défini sur sa position
      if(pions[i].color == colorPlayer) {
        source = new Position2D(x,y);
        document.getElementById('Case' + source.x + source.y).className = 'selectPion'; //la case devient bleu pour voir le pion sélectionné
        pions[i].selectNewCase();
        pions[i].cleanMovePossible();
        pions[i].editNewCases();
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
      for(let i = 0; i < pions.length; i++){ //réinitialise les positions factices
        if(pions[i] != undefined) {
          pions[i].fakePosition.setP(pions[i].position);
        }
      }
      //simule le déplacement pour vérifier si le roi n'est pas en échec
      pions[indice].fakePosition.set(x,y);
      let k = getPion(x,y);
      if(k != undefined) {
        pions[k].fakePosition.set(-10,-10);
      }
      //si le roi peut être mangé le déplacement est refusé et le client reçoit l'alerte
      if(KingJoueur.isEdible() == true) {
        alert('Placement impossible, votre roi serait en Echec');
        pions[indice].fakePosition.setP(pions[indice].position);
        if(k != undefined) pions[k].fakePosition.setP(pions[k].position);
      }
      else if(event.target.className == 'selectCase'){ //la case est accessible par le pion et vide
        pions[indice].move(x,y);
        resetAllCases();
        destination = new Position2D(x,y);
        jouer = false;
        if(!(pions[indice].type == 'Pawn' && y == 0)) document.getElementById('indication').innerHTML = "C'est au tour de l'adversaire";
        else {
          pions[indice] = undefined;
        }
        socket.emit('deplacement', source.x + ',' + source.y + ',' + destination.x + ',' + destination.y); //transfert des positions relatives au déplacement du pion au serveur
        source = undefined;
      }
      else if(event.target.id == '_img' + x + y && document.getElementById('Case' + x + y).className == 'selectCollision'){ //la case contient un pion ennemi
        let j = getPion(x,y);
        if(j != undefined) {
          pions[j].delete(); //le pion est retirée de l'affichage
          pions[j] = undefined; //le pion devient indéfini dans le tableau
        }
        resetAllCases();
        pions[indice].move(x,y);
        destination = new Position2D(x,y);
        jouer = false;
        if(!(pions[indice].type == 'Pawn' && y == 0)) document.getElementById('indication').innerHTML = "C'est au tour de l'adversaire";
        else {
          pions[indice] = undefined;
        }
        socket.emit('deplacement', source.x + ',' + source.y + ',' + destination.x + ',' + destination.y); //transfert des positions relatives au déplacement du pion au serveur
        source = undefined;
      }
      refreshPions();
    }
  }
}

//on reçoit le déplacement distant
socket.on('deplacement', function(message){
  console.log('deplacement distant obtenu : '+ message);
  
  let position = message.split(',');
  source = new Position2D(parseInt(position[0]), parseInt(position[1]));
  destination = new Position2D(parseInt(position[2]), parseInt(position[3]));
  let i = getPion(source.x,source.y);
  let j = getPion(destination.x,destination.y);
  
  if(j != undefined){ //l'adversaire mange un pion
    if(pions[j].color == colorPlayer){
      pions[j].delete();
      pions[j] = undefined; 
      pions[i].move(destination.x, destination.y);
    }
  }
  else { //déplacement sur une case vide
    pions[i].move(destination.x, destination.y);
  }
  source = undefined;
  if(!(pions[i].type == 'Pawn' && pions[i].position.y == 7)) {
    jouer = true;
    document.getElementById('indication').innerHTML = 'A vous de jouer';
    for(let i = 0; i < pions.length; i++){
      if(pions[i] != undefined) {
        pions[i].fakePosition.setP(pions[i].position);
      }
    }
    //après le déplacement on vérifie si le roi est en échec
    //si c'est le cas on regarde s'il est en échec et mat
    if(KingJoueur.isEdible() == true){
      if(EchecEtMath() == true) {
        var data = {
          "username" : sessionStorage.getItem("username"),
          "mdp" : sessionStorage.getItem("mdp"),
          "resultat" : -1
        };
        socket.emit("ajoutResultat", JSON.stringify(data)); //envoi des mises à jours des résultats dans la base de donnée
        alert('Echec et Math ! Vous avez perdu');
        //indication au serveur de la fin de partie, il transmettra au gagnant qu'il a gagné, et ajoutera sa victoire à la base de donnée
        socket.emit('fin', '');
        document.getElementById('indication').innerHTML = '<a href = "/accueil">Retourner à l\'accueil</a>';
      }
      else alert("Echec !");
    }
  }
  refreshPions();
  //Envoie au server la disposition actuel des pions de l'utilisateur
  //retiré du projet en raison de problèmes non résolus de la vérification
  //socket.emit('check', StringPositionsPions());
});

//le joueur adverse a fait promouvoir un pion
//le pion est retirée du plateau et le nouveau pion est ajoutée au plateau
//le statut échec au roi (implique la vérification Echec et mat) est vérifié à nouveau 
socket.on('evolve', function(type){
  for(let i = 0; i < pions.length; i++){ //recherche du pion
    if(pions[i] != undefined){
      if(pions[i].type == 'Pawn'){
        if(pions[i].position.y == 7){
          pions[i].delete();
          let pos = pions[i].position;
          let color = pions[i].color;
          pions[i] = undefined;
          
          if(type == 'Knight'){
            pions.unshift(new Knight(color,pos.x, pos.y));
          }
          if(type == 'Rook'){
            pions.unshift(new Rook(color,pos.x, pos.y));
          }
          if(type == 'Queen'){
            pions.unshift(new Queen(color,pos.x, pos.y));
          }
          if(type == 'Bishop'){
            pions.unshift(new Bishop(color,pos.x, pos.y));
          }
          pions[0].affiche();
        }
      }
    }
  }
  document.getElementById('indication').innerHTML = 'A vous de jouer';
  jouer = true;
  for(let i = 0; i < pions.length; i++){
    if(pions[i] != undefined) {
      pions[i].fakePosition.setP(pions[i].position);
    }
  }
  //vérification du statut d'échec au roi avec la promotion du pion
  if(KingJoueur.isEdible() == true){
    if(EchecEtMath() == true) {
      socket.emit('fin', '');
      document.getElementById('indication').innerHTML = '<a href = "/accueil">Retourner à l\'accueil</a>';
      alert('Echec et Math ! Vous avez perdu');
    }
    else alert("Echec !");
  }
  console.log("fin evolution");
});

//retourne la valeur absolue de "valeur"
function abs(valeur){
  return (valeur > 0)? valeur : -valeur;
}

//pour chaque déplacement possible du joueur actuel,
//les placements possibles sont testés un par un pour vérifier s'il existe un déplacement
//qui permet au roi de ne pas être mangé, retourne true si le roi peut se libérer du statut d'échec au roi
//retourne false si le joueur courant a perdu
function EchecEtMath(){
  for(let i = 0; i < pions.length; i++){
    if(pions[i] != undefined) {
      pions[i].fakePosition.setP(pions[i].position);
    }
  }
  for(let i = 0; i < pions.length; i++){
    if(pions[i] != undefined){
      if(pions[i].color == colorPlayer){
        pions[i].selectNewCase();
        pions[i].cleanMovePossible();
        for(let j = 0; j < pions[i].placementsPossibles.length; j++){
          if(testEdible(i,j) == false) return false;
        }
      }
    }
  }
  return true;
}

//le joueur courant a fait promouvoir un pion
//le pion est retirée du plateau et le nouveau pion est ajoutée au plateau
function evolve(pawn, type){
  pawn.delete();
  let pos = pawn.position;
  let color = pawn.color;
  pawn = undefined;
  if(type == 'Knight'){
    pions.unshift(new Knight(color,pos.x, pos.y));
  }
  if(type == 'Rook'){
    pions.unshift(new Rook(color,pos.x, pos.y));
  }
  if(type == 'Queen'){
    pions.unshift(new Queen(color,pos.x, pos.y));
  }
  if(type == 'Bishop'){
    pions.unshift(new Bishop(color,pos.x, pos.y));
  }
  pions[0].affiche();
  
  socket.emit('evolve', type);
  document.getElementById('indication').innerHTML = "C'est au tour de l'adversaire";
}

//simule un certain placement possible pour un certain pion et indique si le roi est en échec
//pour simuler la prise d'un pion, sa position factice est mis hors du plateau
function testEdible(i,j){
  let td = pions[i].placementsPossibles[j];
  let x = parseInt(td.id.charAt(4));
  let y = parseInt(td.id.charAt(5));
  pions[i].fakePosition.set(x,y);
  var k = getPion(x,y);
  if(k != undefined) {
    pions[k].fakePosition.set(-10,-10);
    console.log("fake eat de " + pions[k].type + " " + pions[k].position.log());
  }
  if(KingJoueur.isEdible() == false) {
    pions[i].fakePosition.setP(pions[i].position);
    if(k != undefined) {
      pions[k].fakePosition.setP(pions[k].position);
    }
    return false;
  }
  else {
    if(k != undefined) {
      pions[k].fakePosition.setP(pions[k].position);
    }
    pions[i].fakePosition.setP(pions[i].position);
    return true;
  }
}

//retourne toutes les positions et infos des pions du joueur sous forme de string
//utilisée pour la vérification de la disposition des pièces
//retiré du projet en raison de problèmes non résolus de la vérification
function StringPositionsPions(){
  let str = "";
  let tmp;
  for (let i = 0; i<pions.length; i++) {
    if(pions[i] != undefined){
      tmp = pions[i].getPosition();
      str += tmp.x + "/" + tmp.y + "/" + pions[i].getType() + "/" + pions[i].getColor() + ";";
    }
  }
  //console.log("\n" + str);
  return str;
}