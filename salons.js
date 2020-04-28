//objet piece pour stocker le plateau côté serveur afin de vérifier les données qui sont reçu par les clients
//la vérification n'est pas conservé en raison de problèmes dans le code
class Piece {
  constructor(type, color) {
    this.type = type;
    this.color = color;
    if (type == "Pawn") {
      this.firstMove = true;
    } else {
      this.firstMove = false;
    }
  }

  getType() {
    return this.type;
  }

  getColor() {
    return this.color;
  }

  getFirstMove() {
    return this.firstMove;
  }

  setFirstMove() {
    this.firstMove = false;
  }
}

//variable contenant le plateau sans déplacement, sert à être copié pour générer des plateaux en début de partie
var plateau = [
  [new Piece('Rook', 'black'), new Piece('Knight', 'black'), new Piece('Bishop', 'black'), new Piece('Queen', 'black'), new Piece('King', 'black'), new Piece('Bishop', 'black'), new Piece('Knight', 'black'), new Piece('Rook', 'black')],
  [new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black'), new Piece('Pawn', 'black')],
  [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
  [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
  [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
  [undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined],
  [new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white'), new Piece('Pawn', 'white')],
  [new Piece('Rook', 'white'), new Piece('Knight', 'white'), new Piece('Bishop', 'white'), new Piece('Queen', 'white'), new Piece('King', 'white'), new Piece('Bishop', 'white'), new Piece('Knight', 'white'), new Piece('Rook', 'white')]
];


//clone le plateau ci-dessus et retourne la copie
function clonePlateau(){
  var clone = [[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,]];
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      clone[i][j] = (plateau[i][j] != undefined)? new Piece(plateau[i][j].type,plateau[i][j].color) : undefined;
    }
  }
  return clone;
}

//objet contenant les infos d'un salon
class Salon {
  constructor(codeSalon){
    this.whitePlayer = undefined;
    this.blackPlayer = undefined;
    this.codeSalon = codeSalon;
    this.plateau = clonePlateau();
    console.log('creation salon : ' + codeSalon);
  }
}

//tableau contenant l'ensemble des salons existant
var salons = [];

//récupérer un salon dans le tableau avec son code
function getSalonByCode(code){
  for(let i = 0; i < salons.length; i++){
    if(salons[i].codeSalon == code){
      return salons[i];
    }
  }
  return undefined;
}

//récupérer le salon (donne l'indice dans le tableau du salon) à partir de l'identifiant d'un client
function getSalonByPlayer(id){
  for(let i = 0; i < salons.length; i++){
    if(salons[i].whitePlayer != undefined) {
        if(salons[i].whitePlayer.id == id){
        return i;
      }
    }
    if(salons[i].blackPlayer != undefined) {
        if(salons[i].blackPlayer.id == id){
        return i;
      }
    }
  }
  return undefined;
}
  
  //la vérification est désactivée en raison de problèmes dans le code
  //Verifie que le deplacement recu est faisable pour le fou
  function checkNewCaseBishop(sourceX, sourceY, positionX, positionY) {
    var nombreCases = 8;
    let td;
    var verif = "vide";
    var x = sourceX;
    var y = sourceY;

    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == positionX && y == positionY) {
          return true;
        }
      }
      x++;
      y++;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == positionX && y == positionY) {
          return true;
        }
      }
      x--;
      y--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == positionX && y == positionY) {
          return true;
        }
      }
      x++;
      y--;
    }
    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == positionX && y == positionY) {
          return true;
        }
      }
      x--;
      y++;
    }
    return false;
  }

  //Verifie que le deplacement est faisable pour le fou
  function checkNewCaseRook(sourceX, sourceY, destinationX, destinationY) {
    var verif;
    var nombreCases = 8;
    let x = sourceX;
    let y = sourceY;
    verif = "vide";
    while (x < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x++;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      y--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      y++;
    }
    return false;
  }

  //Verifie que le deplacement est faisable pour la reine
  function checkNewCaseQueen(sourceX, sourceY, destinationX, destinationY) {
    var verif;
    var nombreCases = 8;
    let x = sourceX;
    let y = sourceY;
    verif = "vide";
    while (x < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x++;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      y--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      y++;
    }

    x = sourceX;
    y = sourceY;
    while (x < nombreCases && y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x++;
      y++;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x--;
      y--;
    }

    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x < nombreCases && y >= 0 && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x++;
      y--;
    }
    x = sourceX;
    y = sourceY;
    verif = "vide";
    while (x >= 0 && y < nombreCases && verif != "nonVide") {
      if (x != sourceX || y != sourceY) {
        verif = plateau[y][x] == undefined ? "vide" : "nonVide";
        if (x == destinationX && y == destinationY) {
          return true;
        }
      }
      x--;
      y++;
    }
    return false;
  }

  //retourne la valeur absolue de "valeur"
  function abs(valeur) {
    return valeur > 0 ? valeur : -valeur;
  }

  //Verifie que le deplacement est faisable pour le cavalier
  function checkNewCaseKnight(sourceX, sourceY, destinationX, destinationY) {
    var nombreCases = 8;
    for (let y = 0; y < nombreCases; y++) {
      for (let x = 0; x < nombreCases; x++) {
        if (!(sourceX == x && sourceY == y)) {
          //rendre toutes les cases selectionnable sauf celle du pion
          if (
            abs(sourceX - x) <= 2 &&
            abs(sourceX - x) >= 0 &&
            (abs(sourceY - y) <= 2 && abs(sourceY - y) >= 0) &&
            abs(sourceY - y) + abs(sourceX - x) == 3
          ) {
            if (x == destinationX && y == destinationY) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  //Verifie que le deplacement est faisable pour le roi
  function checkNewCaseKing(sourceX, sourceY, destinationX, destinationY) {
    var nombreCases = 8;
    for (let y = 0; y < nombreCases; y++) {
      for (let x = 0; x < nombreCases; x++) {
        if (!(sourceX == x && sourceY == y)) {
          //rendre toutes les cases selectionnable sauf celle du pion
          if (
            (abs(sourceX - x) == 1 || abs(sourceX - x) == 0) &&
            (abs(sourceY - y) == 0 || abs(sourceY - y) == 1)
          ) {
            if (x == destinationX && y == destinationY) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  //Verifie que le deplacement est faisable pour le pion
  function checkNewCasePawn(sourceX, sourceY, destinationX, destinationY) {
    //case devant lui
    if (
      sourceX == destinationX &&
      plateau[destinationY][destinationX] == undefined
    ) {
      if (plateau[sourceY][sourceX].getColor() == "white") {
        if (sourceY - 1 == destinationY) {
          return true;
        }
      } else {
        if (sourceY + 1 == destinationY) {
          return true;
        }
      }
    }

    //deuxieme case devant lui
    if (
      plateau[sourceY][sourceX].getFirstMove() == true &&
      plateau[sourceY - 1][sourceX] == undefined &&
      plateau[destinationY][destinationX] == undefined
    ) {
      if (plateau[sourceY][sourceX].getColor() == "white") {
        if (sourceY - 2 == destinationY && sourceX == destinationX) {
          plateau[sourceY][sourceX].setFirstMove();
          return true;
        }
      }
    } else {
      if (sourceY + 2 == destinationY && sourceX == destinationX) {
        plateau[sourceY][sourceX].setFirstMove();
        return true;
      }
    }

    //Du cote des pions noirs
    if (plateau[sourceY][sourceX].getColor() == "black") {
      //pion en haut a droite
      if (
        sourceY + 1 == destinationY &&
        sourceX - 1 == destinationX &&
        plateau[destinationY][destinationX] != undefined
      ) {
        return true;
      }

      //pion en haut a gauche
      if (
        sourceY + 1 == destinationY &&
        sourceX + 1 == destinationX &&
        plateau[destinationY][destinationX] != undefined
      ) {
        return true;
      }
      //Du cote des pions blancs
    } else {
      //pion en haut a droite
      if (
        sourceY - 1 == destinationY &&
        sourceX + 1 == destinationX &&
        plateau[destinationY][destinationX] != undefined
      ) {
        return true;
      }

      //pion en haut a gauche
      if (
        sourceY - 1 == destinationY &&
        sourceX - 1 == destinationX &&
        plateau[destinationY][destinationX] != undefined
      ) {
      return true;
    }
  }
  return false;
}

//Affiche l'emplacement des pions sur le plateau
function DetailsPlateau() {
  let string = "\n";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (plateau[i][j] == undefined) {
        string += "vide  ";
      } else {
        string +=
          "[" +
          i +
          "]" +
          "[" +
          j +
          "]" +
          plateau[i][j].getType() +
          " " +
          plateau[i][j].getColor() +
          "    ";
      }
    }
    string += "\n";
  }
  console.log(string);
}

exports.Piece = Piece;
exports.plateau = plateau;
exports.clonePlateau = clonePlateau;
exports.Salon = Salon;
exports.salons = salons;
exports.getSalonByCode = getSalonByCode;
exports.getSalonByPlayer = getSalonByPlayer;
exports.checkNewCaseBishop = checkNewCaseBishop;
exports.checkNewCaseRook = checkNewCaseRook;
exports.checkNewCaseQueen = checkNewCaseQueen;
exports.checkNewCaseKnight = checkNewCaseKnight;
exports.checkNewCaseKing = checkNewCaseKing;
exports.checkNewCasePawn = checkNewCasePawn;
exports.DetailsPlateau = DetailsPlateau;