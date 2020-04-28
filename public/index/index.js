let form = document.getElementById('form');

//initialisation du socket
var socket = io.connect();

//vérifie si le client est connecté
//s'il n'est pas connecté, il est renvoyé vers la page de connexion
//dans le cas contraire, on envoie les informations de connexion
//une demande des infos du joueur sont demandés au serveur et reçu si la connexion est valide
(function testLogin() {
  if(sessionStorage.getItem('username') == undefined) {
    form.action = '/login';
    form.submit();
  }
  else {
    getSession();
    setTimeout(function(){
      var message = {
        "username" : sessionStorage.getItem('username'),
        "mdp" : sessionStorage.getItem('mdp')
      }
      socket.emit('login', JSON.stringify(message));
    },1000);
  }
})();

//ajoute la manipulation de l'évènement 'submit' du formulaire
(function main(){
  addEvent();
})();

//stocke l'identifiant du bouton pressé
var choix = '';

//ajoute la manipulation de l'évènement 'submit' du formulaire
function addEvent(){
  
  // boutons/inputs de page
  let create = document.getElementById('create');
  let join = document.getElementById('join');
  let aleatoire = document.getElementById('aleatoire');
  let regles = document.getElementById('regles');
  let disconnect = document.getElementById('disconnect');
  let profil = document.getElementById('profil');
  
  //le formulaire est validé
  form.addEventListener('submit', function(e){
    
    //l'utilisateur clique sur rejoindre, on lui demande le code du salon
    if(choix == 'join'){
      let codeSalon = prompt("Entrez le code de salon à rejoindre");
      if(codeSalon != null){
        form.action = '/salon/' + codeSalon;
        form.submit();
      }
    }
    
    //l'utilisateur décide de créer un salon, il est redirigé vers la page de création
    if(choix == 'create'){
      form.action = '/create';
      form.submit();
    }
    
    //le client souhaite voir son profil, il est redirigé vers la page de profil
    if(choix == 'profil'){
      form.action = '/profil';
      form.submit();
    }
    
    //rejoint la file d'attente, le niveau voulu est indiqué dans le formulaire
    if(choix == 'aleatoire') {
      let select = document.getElementById('level-select');
      let choice = select.selectedIndex;
      let level = select.options[choice].value;
      form.action = '/attente/' + level;
      form.submit();
    }
    
    //le joueur veut se déconnecter, les valeurs de sessions sont retirés
    if(choix == 'disconnect') {
      sessionStorage.clear();
      form.action = '/login';
      form.submit();
    }
    
    e.preventDefault(); //ne pas quitter la page
  });
  
  //mettre l'id des boutons dans la variable choix
  create.onclick = changeChoix;
  join.onclick = changeChoix;
  aleatoire.onclick = changeChoix;
  regles.onclick = changeChoix;
  disconnect.onclick = changeChoix;
  profil.onclick = changeChoix;
}

//modifie la variable choix pour savoir quel bouton a été choisit en stockant l'id du bouton
function changeChoix(e){
  choix = e.target.id;
}

//vérifie les informations de connexion du client
function getSession(){
  var message = {
    "type" : "perso",
    "username" : sessionStorage.getItem('username'),
    "mdp" : sessionStorage.getItem('mdp')
  }
  socket.emit('infosJoueur', JSON.stringify(message));
}

//le serveur indique si les informations de connexions sont valides
//dans ce cas on affiche bienvenue au client sur la page
socket.on('infosJoueur', function(message) {
  if(message == "erreur"){
    sessionStorage.clear();
    form.action = '/login';
    form.submit();
  }
  else {
    let infos = JSON.parse(message);
    var string = "Bienvenue " + infos.username;
    document.getElementById('infoSession').innerHTML = string;
  }
});

//réception d'une invitation d'un ami
//le joueur réponds et transmet sa réponse au serveur 
socket.on('invitation', function(message){
  let infos = JSON.parse(message);
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
    form.action = '/salon/' + infos.code;
    form.submit();
  }
});