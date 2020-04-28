const dbLib = require("./dataBase.js");

//déconnecte tout les joueurs (en cas de problème de connexion)
dbLib.disconnectAll();
//affiche la liste des joueurs (en ligne de commande)
dbLib.logTableJoueurs();
