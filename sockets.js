const salonLib = require("./salons.js");
const attenteLib = require("./clientsAttente.js");
const dbLib = require("./dataBase.js");

//classe pour stocker les infos de clients connectés
function User(socket,username,mdp) {
  this.socket = socket;
  this.username = username;
  this.mdp = mdp;
}

//ajouter un client connecté
function addUser(socket,username,mdp) {
  console.log("ajout user");
  connectedUsers.push(new User(socket,username,mdp));
  socket.emit('login','true');
}

//retirer un client connecté avec son socket
function rmUser(socket) {
  for(let i = 0; i < connectedUsers.length; i++) {
    if(socket.id == connectedUsers[i].socket.id) {
      dbLib.disconnect(connectedUsers[i].username, connectedUsers[i].mdp);
      rmUser2(connectedUsers[i].username,connectedUsers[i].mdp);
      return;
    }
  }
}

//retirer un client connecté avec son pseudonyme et password
function rmUser2(username,mdp) {
  for(let i = 0; i < connectedUsers.length; i++) {
    if(username == connectedUsers[i].username && mdp == connectedUsers[i].mdp) {
      connectedUsers.splice(i,1);
      console.log("suppression user");
      rmUser2(username,mdp);
      return;
    }
  }
}

//envoyer un message à un client connecté
function sendUser(username,type,message){
  for(let i = 0; i < connectedUsers.length; i++) {
    if(username == connectedUsers[i].username) {
      console.log("username reçoit " + type);
      connectedUsers[i].socket.emit(type,message);
    }
  }
}

//liste des clients connectés
var connectedUsers = [];

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

// on website : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Math/random
//générer un nombre aléatoire pour un salon
function getRandomCode() {
  return Math.floor(Math.random() * Math.floor(10000000000)) + 469285;
}

//connexion d'un client au site web
function onConnect(socket){
  //le client se connecte, vérification par la base de donnée
  socket.on('login', function(message){
    let infos = JSON.parse(message);
    dbLib.login(infos.username,infos.mdp,socket);
  });
  
  //déconnexion du client
  socket.on('signout', function(message) {
    rmUser(socket);
  });
  
  //le client souhaite s'enregistrer
  socket.on("register", function(message) {
    let infos = JSON.parse(message);
    dbLib.createUser(infos.username,infos.mdp,socket);
  });
  
  //le client demande ses infos ou ses amis,
  //la base de donnée se charge de vérifier et envoyer un réponse
  socket.on('infosJoueur', function(message){
    let infos = JSON.parse(message);
    if(infos.type == "perso"){
      dbLib.getJoueur(infos.username, infos.mdp,socket);
    }
    else if(infos.type == "amis"){
      dbLib.listeAmis(infos.username, infos.mdp,socket);
    }
  });
  //le client demande à ajouter un ami
  socket.on("ajoutAmi", function(message) {
    let infos = JSON.parse(message);
    dbLib.ajoutAmiVerif(infos.username,infos.mdp,infos.username2,socket);
  });
  //le client demande à supprimer un ami
  socket.on("suppAmi", function(message) {
    let infos = JSON.parse(message);
    dbLib.supprimeAmiVerif(infos.username,infos.mdp,infos.username2,socket)
  });
  //le client veut envoyer une invitation à un ami
  //le joueur invité est notifié
  socket.on("invitation", function(message){
    let infos = JSON.parse(message);
    console.log(infos.username + " invite " + infos.username2)
    let data = {
      "username" : infos.username
    }
    sendUser(infos.username2,"invitation",JSON.stringify(data));
  });
  //le joueur invité a répondu, aucune réponse n'est donnée au joueur si le joueur refuse
  //sinon les deux joueur reçoivent un code de salon à rejoindre après que le salon soit créé
  socket.on("reponseInvitation", function(message){
    let infos = JSON.parse(message);
    if(infos.reponse == "true"){
      var code = getRandomCode();
      while(salonLib.getSalonByCode(message) != undefined) {
        code = getRandomCode();
      }
      salonLib.salons.push(new salonLib.Salon(code));
      let data = {
        "reponse" : "true",
        "code" : code
      }
      console.log("invite1");
      sendUser(infos.username2,'reponseInvitation',JSON.stringify(data));
      setTimeout(function(){
        console.log("invite2");
        socket.emit("reponseInvitation", JSON.stringify(data));
      },2000);
    }
    else {
      let data = {
        "reponse" : "false",
      }
      sendUser(infos.username2,'reponseInvitation',JSON.stringify(data));
    }
  });
  
  //le client envoi le code du salon qu'il veut pour ouvrir le salon
  //si aucun saon n'existe avec ce code on envoie une réponse
  socket.on('code', function(message){
    //si le salon n'existe pas on peut le créer et indiquer au client de lancer le salon en emettant 'launched', il sera donc redirigé vers le salon
    if(salonLib.getSalonByCode(message) == undefined) {
      salonLib.salons.push(new salonLib.Salon(message));
      socket.emit('launched', '');
    }
  });
  
  //le client est arrivé dans le salon et demande la couleur qui lui sera attribué en indiquant son code de salon au serveur
  socket.on('askColor', function(message){
    let salon = salonLib.getSalonByCode(message);
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
    else {
      socket.emit('redirectError','');
    }
  });
  
  //le joueur noir envoi ready au serveur qui transmet à son tour au joueur blanc le message afin qu'il puisse commencer à jouer
  socket.on('ready', function(message){
    console.log('receive ready');
    let salon = salonLib.getSalonByCode(message);
    if(salon != undefined) {
      console.log('send ready');
      salon.whitePlayer.emit('ready', '');
    }
  });
  
  //le client a envoyé son déplacement (position de départ du pion et case vers laquelle il se déplace)
  //Le server stocke le deplacement aussi les deplacements au fur et a mesure
  //cette vérification est annulé en raison de problèmes dans le code
  socket.on("deplacement", function(message) {
    let test = salonLib.getSalonByPlayer(socket.id);
    let position = message.split(",");
    if (test != undefined) {
      update(salonLib.salons[test], message, socket.id); //on modifie les coordonnées car le plateau est inversée pour le joueur noir puis on envoi à l'autre joueur
    }
    /*let sourceX;
    let sourceY;
    let destinationX;
    let destinationY;
    if (salonLib.salons[test].whitePlayer.id == socket.id) {
      sourceX = parseInt(position[0]);
      sourceY = parseInt(position[1]);
      destinationX = parseInt(position[2]);
      destinationY = parseInt(position[3]);
    } else {
      sourceX = 7 - parseInt(position[0]);
      sourceY = 7 - parseInt(position[1]);
      destinationX = 7 - parseInt(position[2]);
      destinationY = 7 - parseInt(position[3]);
    }

    let tmp = salonLib.plateau[sourceY][sourceX];
    let type = tmp.getType(); /////////////bug ici
    let check;
    console.log(type);
    if (type == "Pawn") {
      check = salonLib.checkNewCasePawn(sourceX, sourceY, destinationX, destinationY);
    } else if (type == "Bishop") {
      check = salonLib.checkNewCaseBishop(sourceX, sourceY, destinationX, destinationY);
    } else if (type == "Rook") {
      check = salonLib.checkNewCaseRook(sourceX, sourceY, destinationX, destinationY);
    } else if (type == "Queen") {
      check = salonLib.checkNewCaseQueen(sourceX, sourceY, destinationX, destinationY);
    } else if (type == "Knight") {
      check = salonLib.checkNewCaseKnight(sourceX, sourceY, destinationX, destinationY);
    } else if (type == "King") {
      check = salonLib.checkNewCaseKing(sourceX, sourceY, destinationX, destinationY);
    }

    if (check) {
      if (salonLib.salons[test].whitePlayer.id == socket.id) {
        console.log("joueur blanc: Le deplacement est possible!");
      } else {
        console.log("joueur noir: Le deplacement est possible!");
      }
    } else {
      console.log(
        "Le deplacement ne respecte pas les règle!\n Il y a peut-être triche!"
      );
      salonLib.salons[test].blackPlayer.emit("triche", "");
      salonLib.salons[test].whitePlayer.emit("triche", "");
    }

    //console.log("\n" + sourceX + " " + sourceY);
    //console.log("\n" + destinationX + " " + destinationY);

    salonLib.plateau[sourceY][sourceX] = undefined;
    salonLib.plateau[destinationY][destinationX] = tmp;
    salonLib.DetailsPlateau();*/
  });

  //Verification de la coherence de la disposition des pions entre le server et les clients
  //désactivé pour cause de bugs
  socket.on("check", function(message) {
    let test = salonLib.getSalonByPlayer(socket.id);
    console.log(message);
    let positions = message.split(";");
    let positionX, positionY;
    let color, type;
    let infos;
    console.log(positions.lenght);
    for (let i = 0; i < positions.length - 1; i++) {
      infos = positions[i].split("/");
      if (salonLib.salons[test].whitePlayer.id == socket.id) {
        positionX = infos[0];
        positionY = infos[1];
      } else {
        positionX = 7 - infos[0];
        positionY = 7 - infos[1];
      }
      type = infos[2];
      color = infos[3];

      if (
        salonLib.plateau[positionY][positionX].getType() == type && ////bug ici
        salonLib.plateau[positionY][positionX].getColor() == color
      ) {
        console.log(
          "[" +
            positionY +
            "]" +
            "[" +
            positionX +
            "]" +
            "[" +
            color +
            "] : " +
            "Verification OK!"
        );
        /*console.log(plateau[positionY][positionX].getType() + " " + type);
        console.log(plateau[positionY][positionX].getColor() + " " + color);*/
      } else {
        console.log("Incoherence des positions entre le server et le client!");
        console.log(salonLib.plateau[positionY][positionX].getType() + " " + type);
        console.log(salonLib.plateau[positionY][positionX].getColor() + " " + color);
        salonLib.salons[test].blackPlayer.emit("triche", "");
        salonLib.salons[test].whitePlayer.emit("triche", "");
      }
    }
  });
  
  //le client fait promouvoir un pion, les informations sont transmises à l'autre joueur du salon
  socket.on("evolve", function(type) {
    let test = salonLib.getSalonByPlayer(socket.id);
    let color;

    if (test != undefined) {
      if (salonLib.salons[test].whitePlayer.id == socket.id) {
        salonLib.salons[test].blackPlayer.emit("evolve", type);
        color = "white";
      } else {
        salonLib.salons[test].whitePlayer.emit("evolve", type);
        color = "black";
      }

      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (salonLib.plateau[i][j] != undefined) {
            if (salonLib.plateau[i][j].type == "Pawn") {
              if (salonLib.salons[test].whitePlayer.id == socket.id) {
                if (j == 7) {
                  salonLib.plateau[i][j] = new salonLib.Piece(type, color);
                }
              } else {
                if (j == 0) {
                  salonLib.plateau[i][j] = new salonLib.Piece(type, color);
                }
              }
            }
          }
        }
      }
    }
  });
  //la partie est terminé, le perdant envoie ce message pour que le serveur notifie le gagnant
  socket.on('fin', function(message){
    let i = salonLib.getSalonByPlayer(socket.id);
    if(i != undefined) { //le client a t-il quitté un salon ?
      if(salonLib.salons[i].whitePlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter s'il est toujours dans le salon
        if(salonLib.salons[i].blackPlayer != undefined) salonLib.salons[i].blackPlayer.emit('fin','');
      }
      if(salonLib.salons[i].blackPlayer != undefined){ //le joueur noir est-il présent dans le salon ?
        if(salonLib.salons[i].blackPlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter
          if(salonLib.salons[i].whitePlayer != undefined) salonLib.salons[i].whitePlayer.emit('fin','');
        }
      }
      console.log('suppression du salon ' + salonLib.salons[i].codeSalon);
      salonLib.salons.splice(i,1); //suppression du salon
    }
  });
  //ajoute une victoire ou une défaite au joueur dans la base de donnée
  socket.on('ajoutResultat', function(message) {
    console.log(message);
    let infos = JSON.parse(message);
    dbLib.ajoutResultat(infos.username, infos.mdp,infos.resultat);
  });
  //un joueur s'est mit en file d'attente, si 2 joueurs sont dans la file d'attente alors ces deux joueurs sont redirigés vers un salon
  socket.on("level", function(message){
    var level = parseInt(message);
    attenteLib.attente[level].push(new attenteLib.client(socket,level));
    if(attenteLib.attente[level].length > 1){
      var code = getRandomCode();
      while(salonLib.getSalonByCode(message) != undefined) {
        code = getRandomCode();
      }
      salonLib.salons.push(new salonLib.Salon(code));
      attenteLib.attente[level][0].socket.emit('adv', code);
      socket.emit('adv', code);
    }
  });
  
  //un client est parti
  //s'il est dans un salon celui-ci est fermé
  //s'il est en file d'attente, il est retiré de celle-ci
  //s'il est connecté, il est retiré de la liste des joueurs connectés
  socket.on('disconnect', function(message){
    let i = salonLib.getSalonByPlayer(socket.id);
    if(i != undefined) { //le client a t-il quitté un salon ?
      if(salonLib.salons[i].whitePlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter s'il est toujours dans le salon
        if(salonLib.salons[i].blackPlayer != undefined) salonLib.salons[i].blackPlayer.emit('stop','');
      }
      else if(salonLib.salons[i].blackPlayer != undefined){ //le joueur noir est-il présent dans le salon ?
        if(salonLib.salons[i].blackPlayer.id == socket.id){ //oui car il était joueur blanc, on indique au joueur noir de quitter
          if(salonLib.salons[i].whitePlayer != undefined) salonLib.salons[i].whitePlayer.emit('stop','');
        }
      }
      console.log('suppression du salon ' + salonLib.salons[i].codeSalon);
      salonLib.salons.splice(i,1); //suppression du salon
    }
    attenteLib.removeClientIfExist(socket);
    rmUser(socket);
  });
}

exports.onConnect = onConnect;
exports.addUser = addUser;
exports.rmUser = rmUser;