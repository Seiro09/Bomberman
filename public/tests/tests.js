var width;
var height;
var squareSize;
window.addEventListener("resize", resize);
var nombreCases = 8;
var colorPlayer = "white"; //indique si le joueur joue les pions blancs ou noirs

//tableau de pions
var pions = undefined;

plateauEchec(); //dessine le plateau

/**
 * classe représentant une position sur un plan 2D (x,y)
 */
class Position2D {
  /**
   * affecte les valeurs x et y aux coordonnées du points.
   * dans le cas ou les valeurs ne sont pas données, la valeur sera affectée par défaut
   */
  constructor(x, y) {
    if (x == undefined) this.x = 0;
    else this.x = x;
    if (y == undefined) this.y = 0;
    else this.y = y;
  }

  //retourne une chaine de caractère représentant la position (pour afficher dans la console)
  log() {
    return "(" + this.x + "," + this.y + ")";
  }

  // définir une nouvelle position
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

//retourne le pion present en position x,y, et undefined sinon
function getPion(x, y) {
  for (let i = 0; i < pions.length; i++) {
    if (pions[i] != undefined)
      if (pions[i].position.x == x && pions[i].position.y == y) return i;
  }
  return undefined;
}

/**
 * classe représentant un pion basique, sert de structure pour les pions du jeu
 */
class Pion {
  //construit le pion
  constructor(color, x, y) {
    this.position = new Position2D(x, y);
    this.src =
      "https://cdn.glitch.com/cc360787-9153-4d34-a2e2-ddbd9bc2b9e4%2FBlackPawn.png?v=1583876671281";
    this.color = color;
    this.type = "pion";
  }

  /*
   * place le pion sur le plateau en ajoutant la photo du pion associé à l'instance du pion
   */
  affiche() {
    let td = this.getCase();
    let piece = document.createElement("img");
    td.appendChild(piece);
    piece.src = this.src;
    piece.width = squareSize;
    piece.height = squareSize;
    piece.id = "_img" + this.position.x + this.position.y;
    //piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
  }

  //return la case <td> associé au pion
  getCase() {
    return document.getElementById("Case" + this.position.x + this.position.y);
  }

  //return l'image <img> associé au pion
  getImg() {
    return this.getCase().lastChild;
  }

  /*
   * deplace le pion su la case indiqué
   */
  move(x, y) {
    if (x != this.position.x || y != this.position.y) {
      let td = this.getCase();
      let child = td.removeChild(td.lastChild);
      this.position.set(x, y);
      td = this.getCase();
      td.appendChild(child);
      console.log("pion déplacé en " + x + " " + y);
      let img = this.getImg();
      img.id = "_img" + x + y;
    }
  }

  //Efface le pion de sa position, retire son image du plateau
  delete() {
    let td = this.getCase();
    let img = td.lastChild;
    if (img != undefined) td.removeChild(img);
  }

  /*
   * modifie les cases qui respectent les règles de déplacement du pion
   * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
   * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
   */
  selectNewCase() {
    let td;
    for (let y = 0; y < nombreCases; y++) {
      for (let x = 0; x < nombreCases; x++) {
        td = document.getElementById("Case" + x + y);

        if (!(this.position.x == x && this.position.y == y)) {
          //rendre toutes les cases selectionnable sauf celle du pion
          if (abs(this.position.x - x) == abs(this.position.y - y)) {
            setCaseSelectionnable(td, this);
          }
        }
      }
    }
  }
}

//classe pour le pion Pawn
class Pawn extends Pion {
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhitePawn.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackPawn.png";
    this.firstMove = true;
    this.type = "Pawn";
  }

  selectNewCase() {
    let td;

    td = document.getElementById(
      "Case" + this.position.x + (this.position.y - 1)
    );
    if (getPion(this.position.x, this.position.y - 1) == undefined)
      //case devant lui
      setCaseSelectionnable(td, this);

    if (
      this.firstMove == true &&
      getPion(this.position.x, this.position.y - 1) == undefined
    ) {
      //deuxieme case devant lui
      td = document.getElementById(
        "Case" + this.position.x + (this.position.y - 2)
      );
      setCaseSelectionnable(td, this);
    }

    if (getPion(this.position.x - 1, this.position.y + 1) != undefined) {
      // pion en bas a gauche
      td = document.getElementById(
        "Case" + (this.position.x - 1) + (this.position.y + 1)
      );
      setCaseSelectionnable(td, this);
    }
    if (getPion(this.position.x + 1, this.position.y - 1) != undefined) {
      //pion en haut a droite
      td = document.getElementById(
        "Case" + (this.position.x + 1) + (this.position.y - 1)
      );
      setCaseSelectionnable(td, this);
    }
    if (getPion(this.position.x - 1, this.position.y - 1) != undefined) {
      //pion en haut a gauche
      td = document.getElementById(
        "Case" + (this.position.x - 1) + (this.position.y - 1)
      );
      setCaseSelectionnable(td, this);
    }
    if (getPion(this.position.x + 1, this.position.y + 1) != undefined) {
      //pion en bas a droite
      td = document.getElementById(
        "Case" + (this.position.x + 1) + (this.position.y + 1)
      );
      setCaseSelectionnable(td, this);
    }
  }

  move(x, y) {
    super.move(x, y);
    this.firstMove = false;
  }
}

//classe pour le pion Bishop
class Bishop extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteBishop.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackBishop.png";
    this.type = "Bishop";
  }

  selectNewCase(){
    let td;
    var verif = "vide";
    var x = this.position.x;
    var y = this.position.y;
   
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x--;
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
      y--;
    }
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x--;
      y++;
    }
  }
}

//classe pour le pion Bishop
class Rook extends Pion {
  //construit le pion
  constructor(color, x, y) {
    super(color, x, y);
    if (color == "white")
      this.src =
        "https://cdn.glitch.com/fff49e0e-ad22-4de8-8576-bee7f4fc6e56%2FWhiteRook.png?v=1585100879087";
    else
      this.src =
        "https://cdn.glitch.com/fff49e0e-ad22-4de8-8576-bee7f4fc6e56%2FBlackRook.png?v=1585100875416";
    this.type = "Bishop";
  }

  selectNewCase() {
    let td;
    var verif;
    let x = this.position.x;
    let y = this.position.y;
    verif = "vide";
    while (x < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (x >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
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
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteKnight.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackKnight.png";
    this.type = "Knight";
  }

  /*
   * modifie les cases qui respectent les règles de déplacement du pion
   * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
   * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
   */
  selectNewCase() {
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
            setCaseSelectionnable(td, this);
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
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/WhiteQueen.png";
    else
      this.src =
        "https://raw.githubusercontent.com/Europale98/Chess/master/ImagesPieces/BlackQueen.png";
    this.type = "Queen";
  }

  /*
   * modifie les cases qui respectent les règles de déplacement du pion
   * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
   * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
   */
  selectNewCase() {
    let td;
    var verif;
    let x = this.position.x;
    let y = this.position.y;
    verif = "vide";
    
    while (x < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (x >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = 'vide';
    while (y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif='vide';
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
      y++;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x--;
      y--;
    }
    
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
      x++;
      y--;
    }
    x = this.position.x;
    y = this.position.y;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      td = document.getElementById("Case" + x + y);
      if(x != this.position.x || y != this.position.y) verif = getPion(x, y) == undefined ? "vide" : "nonVide";
      setCaseSelectionnable(td, this);
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
        "https://cdn.glitch.com/fff49e0e-ad22-4de8-8576-bee7f4fc6e56%2FWhiteKing.png?v=1585164539251";
    else this.src =
        "https://cdn.glitch.com/fff49e0e-ad22-4de8-8576-bee7f4fc6e56%2FBlackKing.png?v=1585164538308";
    this.type = "King";
  }

  /*
   * modifie les cases qui respectent les règles de déplacement du pion
   * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
   * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
   */
  selectNewCase() {
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
            setCaseSelectionnable(td, this);
          }
        }
      }
    }
  }
}

pions = [
  new Pawn("black", 0, 1),
  new Pawn("black", 1, 1),
  new Pawn("black", 2, 1),
  new Pawn("black", 3, 1),
  new Pawn("black", 4, 1),
  new Pawn("black", 5, 1),
  new Pawn("black", 6, 1),
  new Pawn("black", 7, 1),
  new Pawn("white", 0, 6),
  new Pawn("white", 1, 6),
  new Pawn("white", 2, 6),
  new Pawn("white", 3, 6),
  new Pawn("white", 4, 6),
  new Pawn("white", 5, 6),
  new Pawn("white", 6, 6),
  new Pawn("white", 7, 6),
  new King("black", 4, 0),
  new King("white", 4, 7),
  new Queen("black", 3, 0),
  new Queen("white", 3, 7),
  new Bishop("black", 2, 0),
  new Bishop("black", 5, 0),
  new Bishop("white", 2, 7),
  new Bishop("white", 5, 7),
  new Knight("black", 1, 0),
  new Knight("black", 6, 0),
  new Knight("white", 1, 7),
  new Knight("white", 6, 7),
  new Rook("black", 0, 0),
  new Rook("black", 7, 0),
  new Rook("white", 7, 7),
  new Rook("white", 0, 7)
];

refreshPions(); //affiche les pions sur le plateau

//supprime la photo du pion et la rajoute sur le plateau, pour refresh l'affichage
function refreshPions() {
  if (pions != undefined) {
    for (let i = 0; i < pions.length; i++) {
      if (pions[i] != undefined) {
        pions[i].delete();
        pions[i].affiche();
      }
    }
  }
}

/*function getPion(x,y){
  for(let i = 0; i < pions.length; i++) {
    if(pions[i] != undefined)
      if(pions[i].position.x == x && pions[i].position.y == y) return i;
  }
  return undefined;
}*/

//Initialisation des variables width and height au début et à chaque resize de la fenêtre d'affichage
function initVal() {
  width = window.innerWidth; //Récupération de la largeur de la fenêtre
  height = window.innerHeight; ///Récupération de la hauteur de la fenêtre

  if (window.innerHeight > window.innerWidth) {
    //Si l'orientation de la fenêtre est portrait
    squareSize = (0.6 * width) / 8; //La longueur de la case est liée à width
  } else {
    squareSize = (0.6 * height) / 8;
  } //La largeur de la case est liée à height
}

/**
 * crée les attributs du tableau pour faire le plateau de jeu
 * chaque case aura un identifiant associé à ses coordonnées qui prends la forme "Casexy" x et y les valeurs de la position
 * une classe whiteCase ou blackCase sera affectée à la case selon qu'elle soit blanche ou noir
 */
function plateauEchec() {
  let plateau = document.getElementById("plateau");
  initVal();
  let tr;
  let td;

  var table = document.createElement("table");
  plateau.appendChild(table);

  table.setAttribute("id", "tableEchec");
  table.addEventListener("click", eventTableEchec);
  for (let y = 0; y < nombreCases; y++) {
    tr = document.createElement("tr");
    tr.setAttribute("id", "row" + y);

    for (let x = 0; x < nombreCases; x++) {
      td = document.createElement("td");
      td.setAttribute("id", "Case" + x + y);
      if ((x + y) % 2 == 0) {
        td.setAttribute("class", "whiteCase");
      } else {
        td.setAttribute("class", "blackCase");
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

/*Fonction appelée à chaque redimensionnement, pour adapter la taille de l'interface du jeu à la 
fenêtre d'affichage*/
function resize() {
  initVal();
  refreshPions();
}

/*
 * la case devient verte s'il n'y a pas de pion déjà présent
 * la case devient rouge si un pion ennemi est présent sur la case
 * la case reste inchangé si un pion ami est présent sur la case
 */
function setCaseSelectionnable(td, pion) {
  //couleur de discernement de la case pour être choisit pour le déplacement (rouge si un pion se trouve déjà sur la case)
  var newClass = td.firstChild == undefined ? "selectCase" : "selectCollision";

  if (newClass == "selectCollision") {
    //un pion est présent sur la case
    let i = getPion(parseInt(td.id.charAt(4)), parseInt(td.id.charAt(5)));
    if (i != undefined) {
      if (pions[i].color != pion.color) {
        //c'est un pion adverse donc on peut mettre la case en rouge sinon la case reste inchangée
        td.className = newClass;
      }
    }
  } else {
    //s'il n'y a pas de pions
    td.className = newClass;
  }
}

//rends les couleurs d'origine à toutes les cases du plateau
function resetAllCases() {
  for (let y = 0; y < nombreCases; y++) {
    for (let x = 0; x < nombreCases; x++) {
      resetCase(document.getElementById("Case" + x + y));
    }
  }
}

/*
 * la case donnée en paramètre est réinitialisée
 * avec modification de la couleur pour la couleur d'origine de la case
 */
function resetCase(td) {
  let color = parseInt(td.id.charAt(4)) + parseInt(td.id.charAt(5));
  if (color % 2 == 0) {
    td.className = "whiteCase";
  } else {
    td.className = "blackCase";
  }
}

//variable pour l'evenement
var indice; //indice dans le plateau du pion à déplacer
var source = undefined; //position de départ du pion, indique si un pion est sélectionnée pour le déplacer
var destination = undefined; //position d'arrivée du pion

//ecoute le tableau, si une case est cliquée différents états du plateau modifient les variables pour l'évènement
function eventTableEchec(event) {
  let x = parseInt(event.target.id.charAt(4));
  let y = parseInt(event.target.id.charAt(5));
  if (source == undefined) {
    //si l'on clique sur le pion , il devient sélectionné si le joueur a le droit de le déplacer
    let i = getPion(x, y);
    if (i != undefined) {
      //s'il peut jouer le pion la source est défini sur sa position
      if (pions[i].color == colorPlayer) {
        source = new Position2D(x, y);
        document.getElementById("Case" + source.x + source.y).className =
          "selectPion"; //la case devient bleu pour voir le pion sélectionné
        pions[i].selectNewCase();
        indice = i;
      }
    }
  } else {
    //si la source est déjà définit
    if (x == source.x && y == source.y) {
      //on annule la sélection du pion en cliquant à nouveau sur la source
      source = undefined;
      resetAllCases();
    } else {
      //la case n'est pas la position source
      if (event.target.className == "selectCase") {
        //la case est accessible par le pion
        pions[indice].move(x, y);
        resetAllCases();
        destination = new Position2D(x, y);
        source = undefined;
      } else if (
        event.target.id == "_img" + x + y &&
        document.getElementById("Case" + x + y).className == "selectCollision"
      ) {
        //la case contient un autre pion
        let j = getPion(x, y);
        if (j != undefined) {
          pions[j].delete(); //le pion est retirée de l'affichage
          pions[j] = undefined; //le pion devient indéfini dans le tableau
        }
        resetAllCases();
        pions[indice].move(x, y);
        destination = new Position2D(x, y);
        source = undefined;
      }
    }
  }
}

//retourne la valeur absolue de "valeur"
function abs(valeur) {
  return valeur > 0 ? valeur : -valeur;
}
