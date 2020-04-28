//formulaire et table d'ami de la page
let formAmi = document.getElementById('formAmi');
let table = document.getElementById("amis");
//réinitialiser le contenu de la table d'amis
var saveTable =
    `<thead>
      <th>Statut</th>
      <th>Nom de votre ami</th>
      <th>Victoires</th>
      <th>Défaites</th>
      <th>Invitation</th>
      <th>Supprimer</th>
    </thead>`;

//initialiser le socket
var socket = io.connect();

//vérifie si le client est connecté
//sinon il est renvoyé vers la page de connexion
//s'il est connecté on demande les informations du joueur et ses amis
//les informations de connexions sont vérifiés par le serveur
(function testLogin() {
    if(sessionStorage.getItem('username') == undefined) {
    formAmi.action = '/login';
    formAmi.submit();
  }
  else {
    getSession();
    getAmis();
    var message = {
      "username" : sessionStorage.getItem('username'),
      "mdp" : sessionStorage.getItem('mdp')
    };
    setTimeout(function(){
      socket.emit('login', JSON.stringify(message));
    },1000);
  }
})();

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
(function main(){
  addEvent();
})();

//stocke l'identifiant du bouton pressé
var choix = '';

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
function addEvent(){
  
  //les boutons/inputs de la page
  let pseudoSearch = document.getElementById('pseudoSearch');
  let rechercher = document.getElementById('rechercher');
  rechercher.onclick = changeChoix;
  
  //le formulaire est validé
  formAmi.addEventListener('submit', function(e){
    //le client recherche un joueur à ajouter à ses amis
    if(choix == 'rechercher') {
      var message = {
        "username" : sessionStorage.getItem("username"),
        "mdp" : sessionStorage.getItem("mdp"),
        "username2" : pseudoSearch.value,
      }
      socket.emit("ajoutAmi",JSON.stringify(message));
    }
    
    e.preventDefault(); //ne pas quitter la page
    
  });
}

//modifie la variable choix pour savoir quel bouton a été choisit en stockant l'id du bouton
function changeChoix(e){
  choix = e.target.id;
}

//obtenir les infos du joueur. demande au serveur
//les informations de connexions sont transmises au serveur pour vérifier leur validité
function getSession(){
  var message = {
    "type" : "perso",
    "username" : sessionStorage.getItem('username'),
    "mdp" : sessionStorage.getItem('mdp')
  }
  socket.emit('infosJoueur', JSON.stringify(message));
}

//demander la liste d'ami du joueur au serveur
function getAmis(){
  var message = {
    "type" : "amis",
    "username" : sessionStorage.getItem('username'),
    "mdp" : sessionStorage.getItem('mdp')
  }
  socket.emit('infosJoueur', JSON.stringify(message));
}

//le serveur a validé les informations de connexion du joueur
//les informations du joueur sont transmises et la liste d'ami est ajouté au tableau
//dans le cas contraire, il est redirigé vers la page de connexion pour se reconnecter
socket.on('infosJoueur', function(message) {
  if(message == "erreur"){
    sessionStorage.clear();
    formAmi.action = '/login';
    formAmi.submit();
  }
  else {
    let infos = JSON.parse(message);
    if(infos.type == "perso"){
      sessionStorage.setItem("victoires", infos.victoires);
      sessionStorage.setItem("defaites", infos.defaites);
      var string = "Profil de " + infos.username + "</br>";
      string += 'Victoires : ' + infos.victoires + "</br>";
      string += 'Défaites : ' + infos.defaites;
      document.getElementById('infoSession').innerHTML = string;
    }
    else if(infos.type = "amis") {
      for(let i = 0; i < infos.amis.length; i++){
        ajoutAmis(table,infos.amis[i]);
      }
    }
  }
});

//ajoute les informations d'un ami dans le tableau
function ajoutAmis(table, ami) {
  let tr = document.createElement('tr');
  
  let tdConnecte = document.createElement('td');
  if(ami.connecte == 1) tdConnecte.setAttribute('class', 'amiConnecte');
  else tdConnecte.setAttribute('class', 'amiDeconnecte');
  tr.appendChild(tdConnecte);
  
  let tdPseudo = document.createElement('td');
  tdPseudo.innerHTML = ami.username;
  tr.appendChild(tdPseudo);
  
  let tdVictoires = document.createElement('td');
  tdVictoires.innerHTML = ami.victoires;
  tr.appendChild(tdVictoires);
  
  let tdDefaites = document.createElement('td');
  tdDefaites.innerHTML = ami.defaites;
  tr.appendChild(tdDefaites);
  
  let tdInvite = document.createElement('td');
  if(ami.connecte == 1){
    let buttonInvite = document.createElement('button');
    buttonInvite.innerHTML = 'Inviter';
    buttonInvite.setAttribute('class', 'invite');
    buttonInvite.onclick = function(){
      inviteAmi(sessionStorage.getItem("username"), sessionStorage.getItem("mdp"), ami.username);
    }
    tdInvite.appendChild(buttonInvite);
  }
  else {
    tdInvite.innerHTML = "";
  }
  tr.appendChild(tdInvite);
  
  let tdsupp = document.createElement('td');
  let buttonSupp = document.createElement('button');
  buttonSupp.setAttribute('class', 'suppB');
  buttonSupp.onclick = function(){
    supprimeAmi(sessionStorage.getItem("username"), sessionStorage.getItem("mdp"), ami.username);
  }
  tdsupp.appendChild(buttonSupp);
  tr.appendChild(tdsupp);
  
  table.appendChild(tr);
}

//le serveur réponds suite à la demande d'ajout d'un ami
//si l'ajout est validé la liste d'amis est mis à jour
socket.on("ajoutAmi", function(message) {
  console.log("creation ami : " + message);
  if(message == "erreur") {
    alert("Impossible d'ajouter cet utilisateur.");
  }
  else if(message == "succes") {
    refreshAmis();
  }
});

//vide la table et demande au serveur les amis du joueur
function refreshAmis() {
  table.innerHTML = saveTable + "";
  getAmis();
}

//ajoute l'évènement vider la table et demander la lsite d'amis au serveur
document.getElementById('actualiser').onclick = function(){
  refreshAmis();
}

//une croix a été préssé pour retirer un ami, la demande est envoyé au serveur
function supprimeAmi(username, mdp, ami){
  var message = {
    'username' : username,
    'mdp' : mdp,
    'username2' : ami
  };
  socket.emit("suppAmi", JSON.stringify(message));
}

//une invitation est demandé vers un joueur, le serveur transmet l'invitation à l'ami
function inviteAmi(username, mdp, ami){
  var message = {
    'username' : username,
    'username2' : ami
  };
  socket.emit("invitation", JSON.stringify(message));
}

//un ami a été retiré, la liste d'amis est mis à jour
socket.on('suppAmi', function (message) {
  refreshAmis();
});

//réception d'une invitation d'un ami
//le joueur réponds et transmet sa réponse au serveur 
socket.on('invitation', function(message){
  let infos = JSON.parse(message);
  console.log("invitation de " + infos.username)
  let rep = confirm("Vous avez reçu une invitation pour jouer avec " + infos.username + ". Souhaitez vous rejoindre la partie ?");
  if(rep == true){
    console.log('redirect');
    var data = {
      "reponse" : "true",
      "username" : sessionStorage.getItem("username"),
      "username2" : infos.username
    };
    socket.emit("reponseInvitation", JSON.stringify(data));
  } else {
    var data = {
      "reponse" : "false",
      "username" : sessionStorage.getItem("username"),
      "username2" : infos.username
    };
    socket.emit("reponseInvitation", JSON.stringify(data));
  }
});

//le serveur indique au joueur le salon vers lequel aller
//--> l'invitation d'un joueur précède cette action
socket.on('reponseInvitation', function(message){
  let infos = JSON.parse(message);
  if(infos.reponse == "true"){
    formAmi.action = '/salon/' + infos.code;
    formAmi.submit();
  }
});
