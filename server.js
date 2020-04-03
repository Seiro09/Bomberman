//objet piece pour stocker le plateau côté serveur afin de vérifier les données qui sont reçu par les clients 
function Piece(type, color){
  this.type = type;
  this.color = color;
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

//récupérer le salon (via l'indice pour le tableau) à partir de l'identifiant d'un client
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

//appel aux modules express http et socket.io
const express = require("express");
const app = express();
const http = require('http');

const server = http.createServer(app);

var io = require('socket.io').listen(server);


//lorsqu'un client se connecte
io.sockets.on('connection', function(socket){
  
  //le client envoi le code du salon dans create.html/js
  socket.on('code', function(message){
    //si le salon n'existe pas on peut le créer et indiquer au client de lancer le salon en emettant 'launched', il sera donc redirigé vers le salon
    if(getSalonByCode(message) == undefined) {
      salons.push(new Salon(message));
      socket.emit('launched', '');
    }
  });
  
  //le client est arrivé dans le salon et demande la couleur qui lui sera attribué en indiquant son code de salon au serveur
  socket.on('askColor', function(message){
    let salon = getSalonByCode(message);
    console.log('demande couleur vers ' + message);
    if(salon != undefined) { //on vérifie que le salon existe bien
      if(salon.whitePlayer == undefined){ //le joueur blanc n'est pas défini donc le client recevra la couleur white
        salon.whitePlayer = socket;
        socket.emit('giveColor', 'white');
        console.log('white');
      }
      else if(salon.blackPlayer == undefined){ //le joueur noir n'est pas défini donc le client recevra la couleur black
        salon.blackPlayer = socket;
        socket.emit('giveColor', 'black');
        console.log('black');
      } 
      else { //les 2 couleurs white/black ont déjà été attribués donc le salon est plein, on envoi 'error' au lieu d'une couleur
        socket.emit('giveColor', 'error');
        console.log('error');
      }
    }
  });
  
  //le joueur noir envoi ready au serveur qui transmet à son tour au joueur blanc le message afin qu'il puisse commencer à jouer
  socket.on('ready', function(message){
    console.log('receive ready');
    let salon = getSalonByCode(message);
    if(salon != undefined) {
      console.log('send ready');
      salon.whitePlayer.emit('ready', '');
    }
  });
  
  //le client a envoyé son déplacement (position de départ du pion et case vers laquelle il se déplace)
  socket.on('deplacement', function(message){
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) {
      update(salons[i], message, socket.id); //on modifie les coordonnées car le plateau est inversée pour le joueur noir puis on envoi à l'autre joueur
    }
  });
  
  socket.on('evolve', function(message){
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) {
      if(salons[i].whitePlayer.id == socket.id){
        salons[i].blackPlayer.emit('evolve', message);
      }
      else {
        salons[i].whitePlayer.emit('evolve', message);
      }
    }
  });
  
  socket.on('fin', function(message){
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) { //le client a t-il quitté un salon ?
      if(salons[i].whitePlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter s'il est toujours dans le salon
        if(salons[i].blackPlayer != undefined) salons[i].blackPlayer.emit('fin','');
      }
      if(salons[i].blackPlayer != undefined){ //le joueur noir est-il présent dans le salon ?
        if(salons[i].blackPlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter
          if(salons[i].whitePlayer != undefined) salons[i].whitePlayer.emit('fin','');
        }
      }
      console.log('suppression du salon ' + salons[i].codeSalon);
      salons.splice(i,1); //suppression du salon
    }
  });
  
  //un client est parti
  socket.on('disconnect', function(message){
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) { //le client a t-il quitté un salon ?
      if(salons[i].whitePlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter s'il est toujours dans le salon
        if(salons[i].blackPlayer != undefined) salons[i].blackPlayer.emit('stop','');
      }
      else if(salons[i].blackPlayer != undefined){ //le joueur noir est-il présent dans le salon ?
        if(salons[i].blackPlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter
          if(salons[i].whitePlayer != undefined) salons[i].whitePlayer.emit('stop','');
        }
      }
      console.log('suppression du salon ' + salons[i].codeSalon);
      salons.splice(i,1); //suppression du salon
    }
  });
});

//modifie les positions envoyés par le clients (inverse) pour les envoyer à l'autre joueur
function update(salon,message, id){
  let position = message.split(',');
  for(let i = 0; i < 4; i++){
    position[i] = parseInt(position[i]);
    position[i] = 7 - position[i];
  }
  if(salon.whitePlayer.id == id){
    salon.blackPlayer.emit('deplacement', position[0] + ',' + position[1] + ',' + position[2] + ',' + position[3]);
  }
  else {
    salon.whitePlayer.emit('deplacement', position[0] + ',' + position[1] + ',' + position[2] + ',' + position[3]);
  }
}

//rendre les fichiers dans 'public' accessible
app.use(express.static("public"));

// route par défaut
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
//création d'un salon
app.get("/create", (request, response) => {
  response.sendFile(__dirname + "/public/create/create.html");
});
//le client rejoint un salon (peut être rejoint juste en tapant l'url)
app.get("/salon/:codeSalon", (request, response) => {
  if(getSalonByCode(request.params.codeSalon) != undefined) //si le salon existe, il est renvoyé vers la page de jeu
    response.sendFile(__dirname + "/public/chess/chess.html");
  else { //sinon on lui indique que le salon n'existe pas
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send("Ce salon n'existe pas : " + request.params.codeSalon);
  }
});
//faire des tests
app.get("/test", (request, response) => {
  response.sendFile(__dirname + "/public/tests/tests.html");
});
app.use(function(request, response, next){ //l'url indiqué n'est pas reconnu parmis les routes ci-dessus
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send('Page introuvable');
});

//le server est lancé sur le port 8080
var listener = server.listen(8080, () => {
  console.log(8080); 
});
