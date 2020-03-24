// server.js
// where your node app starts

function Piece(type, color){
  this.type = type;
  this.color = color;
}

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

function clonePlateau(){
  var clone = [[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,],[,,,,,,,]];
  for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
      clone[i][j] = (plateau[i][j] != undefined)? new Piece(plateau[i][j].type,plateau[i][j].color) : undefined;
    }
  }
  return clone;
}

class Salon {
  constructor(codeSalon){
    this.whitePlayer = undefined;
    this.blackPlayer = undefined;
    this.codeSalon = codeSalon;
    this.plateau = clonePlateau();
    console.log('creation salon : ' + codeSalon);
  }
}

var idClients = [];

var salons = [];

function getSalonByCode(code){
  for(let i = 0; i < salons.length; i++){
    if(salons[i].codeSalon == code){
      return salons[i];
    }
  }
  return undefined;
}

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

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const http = require('http');

const server = http.createServer(app);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
  idClients.push(socket.id + '');
  console.log(socket.id);
  socket.on('code', function(message){
    if(getSalonByCode(message) == undefined) {
      salons.push(new Salon(message));
      socket.emit('launched', '');
    }
  });
  
  socket.on('askColor', function(message){
    let salon = getSalonByCode(message);
    if(salon != undefined) {
      if(salon.whitePlayer == undefined){
        salon.whitePlayer = socket;
        socket.emit('giveColor', 'white');
      }
      else if(salon.blackPlayer == undefined){
        salon.blackPlayer = socket;
        socket.emit('giveColor', 'black');
      } 
      else {
        socket.emit('giveColor', 'error');
      }
    }
  });
  
  socket.on('ready', function(message){
    console.log('receive ready');
    let salon = getSalonByCode(message);
    if(salon != undefined) {
      console.log('send ready');
      salon.whitePlayer.emit('ready', '');
    }
  });
  
  socket.on('deplacement', function(message){
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) {
      update(salons[i], message, socket.id);
    }
  });
  
  socket.on('disconnect', function(message){
    for(let i = 0; i < idClients.length; i++){
      if(socket.id == idClients[i]) idClients.splice(i);
    }
    
    let i = getSalonByPlayer(socket.id);
    if(i != undefined) {
      if(salons[i].whitePlayer.id == socket.id){
        if(salons[i].blackPlayer != undefined) salons[i].blackPlayer.emit('stop','');
      }
      else if(salons[i].blackPlayer != undefined){
        if(salons[i].blackPlayer.id == socket.id){
          if(salons[i].whitePlayer != undefined) salons[i].whitePlayer.emit('stop','');
        }
      }
      salons.splice(i);
    }
  });
});

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

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
app.get("/create", (request, response) => {
  response.sendFile(__dirname + "/public/create/create.html");
});
app.get("/salon/:codeSalon", (request, response) => {
  if(getSalonByCode(request.params.codeSalon) != undefined)
    response.sendFile(__dirname + "/public/chess/chess.html");
  else {
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send("Ce salon n'existe pas : " + request.params.codeSalon);
  }
});
app.use(function(request, response, next){
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send('Page introuvable');
});

var listener = server.listen(8080, () => {
  console.log(8080); 
});
