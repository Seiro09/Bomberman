const sqlite3 = require('sqlite3').verbose();
var sha256 = require('js-sha256').sha256;
var socketLib = require('./sockets.js');

//manipulation de la base donnée
//le mot de passe est aussi haché côté serveur

//connexion à la base de donnée
const file = "./.data/sqlite.db";
var db = new sqlite3.Database(file, (err) => {
  if(err) console.error(err.message);
  else console.log("connection à la bdd réussi");
});

//suppression des tables
function dropTable() {
  db.run(`DROP TABLE IF EXISTS Amis`,(err) => {
    if(err) console.error(err.message);
    else console.log("suppression table Amis réussi");
  });
  db.run(`DROP TABLE IF EXISTS Joueur`, (err) => {
    if(err) console.error(err.message);
    else console.log("suppression table Joueur réussi");
  });
}

//création des tables
function createTable() {
  db.run(
    `create table Joueur (
    username varchar(30) primary key,
    mdp varchar(100),
    connecte int,
    victoires int,
    defaites int)`,
  (err) => {
    if(err) console.error(err.message);
    else console.log("Création table Joueur réussi");
  });
  db.run(
    `create table Amis (
    idJoueur int,
    idAmi int,
    primary key (idJoueur, idAmi),
    foreign key (idJoueur) references Joueur (id),
    foreign key (idAmi) references Joueur (id))`,
  (err) => {
    if(err) console.error(err.message);
    else console.log("Création table Amis réussi");
  });
}

//création d'un utilisateur, si le pseudonyme n'est pas déjà pris (username dans la table)
//vérifie que le pattern du pseudo est valide (au cas ou le client change le code de la page web)
function createUser(username,mdp,socket){
  var exp = /([A-Za-z0-9_@])([A-Za-z0-9_@])+/;
  if(exp.exec(username) == null){
    socket.emit('register', 'erreur');
    return;
  }
  db.run(
    'insert into Joueur (username,mdp,connecte,victoires,defaites) values (?, ?, 0, 0, 0)',
    [username,hachage(mdp)],
    (err) => {
      if(err) {
        console.error(err.message);
        socket.emit('register', 'erreur');
      }
      else {
        console.log("Création utilisateur réussi");
        socket.emit('register', 'succes');
      }
    }
  );
}

//vérifie si les informations de connexion d'un client sont bonnes
//envoie un message au client pour confirmer la connexion
//l'attribut connecte devient = 1 si valide
function login(username,mdp,socket){
  let enclair = mdp + "";
  mdp = hachage(mdp);
  db.get(
    'select * from Joueur where username = ? and mdp = ?',
    [username,mdp],
    (err, row) => {
      if(err) {
        console.log("error login");
        socket.emit('login','false');
      }
      else if(row) {
        console.log("connexion de " + username + " réussi");
        db.get('select * from Joueur where username = ? and mdp = ?',[username,mdp],
          (err, row) => {
            if(err) {
              console.error("error");
            }
            else if(row) {
              if(row.connecte == 0){
                db.run('update Joueur set connecte = 1 where username = ? and mdp = ?',[username,mdp], (err) => {
                  socketLib.addUser(socket,username,enclair);
                });
              }
              else {
                socket.emit('login','erreur');
              }
            }
          }
        );
      }
      else {
        console.log("login non reconnu");
        socket.emit('login','false');
      }
    }
  );
}

//déconnecte le joueur
//l'attribut connecte devient = 0
function disconnect(username,mdp) {
  mdp = hachage(mdp);
  db.get(
    'select * from Joueur where username = ? and mdp = ?',
    [username,mdp],
    (err, row) => {
      if(err) {
        console.error("l'identifiant et le mot de passe ne correspondent pas");
      }
      else if(row) {
        console.log("déconnexion de " + username + " réussi");
        db.run('update Joueur set connecte = 0 where username = ? and mdp = ?',[username,mdp]);
      }
    }
  );
}

//déconnecte tout le monde
//l'attribut connecte devient = 0
function disconnectAll(){
  db.run('update Joueur set connecte = 0 where connecte = 1');
}

//ajoute une victoire ou défaite au joueur s'il est bien authentifié
function ajoutResultat(username, mdp, resultat) {
  mdp = hachage(mdp);
  if(resultat == -1) {
    db.run('update Joueur set defaites = defaites + 1 where username = ? and mdp = ?',[username,mdp]);
  }
  else {
    db.run('update Joueur set victoires = victoires + 1 where username = ? and mdp = ?',[username,mdp]);
  }
}

//envoi les informations d'un joueur à celui-ci (vérifie l'authentification)
function getJoueur(username,mdp,socket) {
  mdp = hachage(mdp);
  db.get('select * from Joueur where username = ? and mdp = ?',[username,mdp],
  (err, row) => {
      if(err) {
        console.error("l'identifiant et le mot de passe ne correspondent pas");
        socket.emit("infosJoueur",'erreur');
      }
      else if(row) {
        let message = {
          "type" : "perso",
          "username" : row.username,
          "id" : row.id,
          "victoires" : row.victoires,
          "defaites" : row.defaites
        };
        socket.emit('infosJoueur',JSON.stringify(message));
      }
    }
  );
}

//envoi la liste d'amis du joueur à celui-ci (vérifie l'authentification)
function listeAmis(username,mdp,socket){
  mdp = hachage(mdp);
  let amis = [];
  let amisConnecte = [];
  db.all(
    `select a.idAmi 
    from Amis a, Joueur j 
    where j.username = ? and j.mdp = ? and j.username = a.idJoueur`,[username,mdp],
    (err, row) => {
      if(err) console.error(err.message);
      else {
        for(let i = 0; i < row.length; i++) {
          db.get('select * from Joueur where username = ?',[row[i].idAmi],
            (err, row2) => {
              if(err) {
                console.error(err.message);
                socket.emit("infosJoueur",'erreur');
                return;
              }
              else if(row2) {
                let contenu = {
                  "connecte" : row2.connecte,
                  "username" : row2.username,
                  "victoires" : row2.victoires,
                  "defaites" : row2.defaites
                }
                if(row2.connecte == 1)
                  amisConnecte.push(contenu);
                else
                  amis.push(contenu);
                if(i == row.length - 1) {
                  for(let i = 0; i < amis.length; i++) amisConnecte.push(amis[i]);
                  let message = {
                    "type" : "amis",
                    "amis" : amisConnecte
                  };
                  socket.emit("infosJoueur", JSON.stringify(message));
                }
              }
              else {
                console.error("l'dentifiant ne correspond à aucun utilisateur");
              }
            }
          );
        }
      }  
    }
  );
}

//ajoute un ami, vérifie d'abord les attributs
function ajoutAmiVerif(username,mdp,username2,socket){
  mdp = hachage(mdp);
  db.get('select * from Joueur where username = ? and mdp = ?',[username,mdp],
  (err, row2) => {
    if(err) {
      console.log(err.message);
      socket.emit("ajoutAmi", "erreur");
    }
    else if(row2) {
      ajoutAmi(row2.username,username2,socket);
    }
    else {
      console.log("utilisateur non reconnu");
      socket.emit("ajoutAmi", "erreur");
    }
  });
}

//ajoute l'ami (appel dans ajoutAmiVerif)
function ajoutAmi(username1,username2,socket) {
  db.get('select * from Joueur where username = ?',[username2],
  (err, row) => {
    if(err) {
      console.log(err.message);
      socket.emit("ajoutAmi", "erreur");
    }
    else if(row) {
      db.run('insert into Amis (idJoueur,idAmi) values (?, ?)',[username1,username2],(err, row) => {if(err) console.log(err.message)});
      db.run('insert into Amis (idJoueur,idAmi) values (?, ?)',[username2,username1],(err, row) => {if(err) console.log(err.message)});
      console.log("amitié consolidé");
      socket.emit("ajoutAmi", "succes");
    }
    else {
      console.log("aucun résultat");
      socket.emit("ajoutAmi", "erreur");
    }
  });
}

//supprime un ami, vérifie d'abord les attributs
function supprimeAmiVerif(username,mdp,username2,socket) {
  mdp = hachage(mdp);
  db.get('select * from Joueur where username = ? and mdp = ?',[username,mdp],
  (err, row2) => {
    if(err) {
      console.log(err.message);
      socket.emit("suppAmi", "erreur");
    }
    else if(row2) {
      supprimeAmi(row2.username,username2,socket);
    }
    else {
      console.log("utilisateur non reconnu");
      socket.emit("suppAmi", "erreur");
    }
  });
}

//supprime l'ami (appel dans supprimeAmiVerif)
function supprimeAmi(username1,username2,socket) {
  db.get('select * from Joueur where username = ?',[username2],
  (err, row) => {
    if(err) {
      console.log(err.message);
      socket.emit("suppAmi", "erreur");
    }
    else if(row) {
      db.run('delete from Amis where idJoueur = ? and idAmi = ?',[username1,username2],(err, row) => {if(err) console.log(err.message)});
      db.run('delete from Amis where idJoueur = ? and idAmi = ?',[username2,username1],(err, row) => {if(err) console.log(err.message)});
      console.log("amitié retiré");
      socket.emit("suppAmi", "succes");
    }
    else {
      console.log("aucun résultat");
      socket.emit("suppAmi", "erreur");
    }
  });
}

//afficher les joueurs présents dans la base de donnée
function logTableJoueurs() {
  db.all("select * from Joueur",
    (err, row) => {
      if(err) console.error(err.message);
      else {
        console.log("Liste des joueurs : ");
        row.forEach((row) => {
          console.log(row);
        });
      }
    }
  );
}

//hachage d'une chaine de caractère
function hachage(str) {
  console.log("hachage de " + str)
  return sha256.hex(str);
}

exports.dropTable = dropTable;
exports.createTable = createTable;
exports.hachage = hachage;
exports.createUser = createUser;
exports.logTableJoueurs = logTableJoueurs;
exports.listeAmis = listeAmis;
exports.ajoutResultat = ajoutResultat;
exports.login = login;
exports.disconnect = disconnect;
exports.getJoueur = getJoueur;
exports.disconnectAll = disconnectAll;
exports.ajoutAmiVerif = ajoutAmiVerif;
exports.supprimeAmiVerif = supprimeAmiVerif;