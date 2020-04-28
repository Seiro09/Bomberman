//appel aux modules express http et socket.io
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io').listen(server);

const socketLib = require("./sockets.js");
const salonLib = require("./salons.js");

//lorsqu'un client se connecte
//gestion des communications avec socket.io
io.sockets.on('connection', function(socket){
  socketLib.onConnect(socket);
});

//rendre les fichiers dans 'public' accessible
app.use(express.static("public"));

//route par défaut
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/redirect.html");
});
// route pour la page d'accueil
app.get("/accueil", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
//création d'un salon
app.get("/create", (request, response) => {
  response.sendFile(__dirname + "/public/create/create.html");
});
//le client rejoint un salon (peut être rejoint juste en tapant l'url)
app.get("/salon/:codeSalon", (request, response) => {
  if(salonLib.getSalonByCode(request.params.codeSalon) != undefined) //si le salon existe, il est renvoyé vers la page de jeu
    response.sendFile(__dirname + "/public/chess/chess.html");
  else { //sinon on lui indique que le salon n'existe pas
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send("Ce salon n'existe pas : " + request.params.codeSalon);
  }
});
//le client rejoint la salle d'attente
app.get("/attente/:level", (request, response) => {
  var level = request.params.level;
  if(level == "0" || level == "1" || level == "2")
    response.sendFile(__dirname + "/public/attente/attente.html");
  else {
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send('Page introuvable');
  }
});
//Page de connexion
app.get("/login", (request, response) => {
  response.sendFile(__dirname + "/public/login/login.html");
});
//Page d'inscription
app.get("/registration", (request, response) => {
  response.sendFile(__dirname + "/public/registration/registration.html");
});
//page de profil
app.get("/profil", (request, response) => {
  response.sendFile(__dirname + "/public/profil/profil.html");
});
//page de règles du jeu
app.get("/regles", (request, response) => {
  response.sendFile(__dirname + "/public/regles/regles.html");
});
//page inconnu
app.use(function(request, response, next){ //l'url indiqué n'est pas reconnu parmis les routes ci-dessus
    response.setHeader('Content-Type', 'text/plain');
    response.status(404).send('Page introuvable');
});

//le server est lancé sur le port 8080
var listener = server.listen(8080, () => {
  console.log(8080); 
});
