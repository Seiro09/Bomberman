const socketLib = require("./sockets.js")

//stockage des joueurs en file d'attente

//classe d'informations d'un joueur en file d'attente
function client(socket, level) {
  this.socket = socket;
  this.level = level;
}

//tableau de file d'attente, 3 sous tableaux pour [débutant, intermédiaire, expert]
var attente = [[],[],[],[]];

//supprimer un client de la file d'attente avec son socket
function removeClientIfExist(socket){
  for(let i = 0; i < 4; i++){
    for(let j = 0; j < attente[i].length; j++){
      if(attente[i][j].socket.id == socket.id) {
        attente[i].splice(j,1);
        return;
      }
    }
  }
}

exports.client = client;
exports.attente = attente;
exports.removeClientIfExist = removeClientIfExist;