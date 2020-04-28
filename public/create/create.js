//code du salon initilaisée avec un code aléatoirement généré
var codeSalon = getRandomCode();
//stocke l'id du bouton sur lequel on a cliqué
var choix = '';

let form = document.getElementById('banniereTable');

//vérifie la connexion du client
//s'il n'est pas connecté, il est redirigé vers la page de connexion
//dans le cas contraire il transmet ses informations de connexion au serveur
(function testLogin() {
  if(sessionStorage.getItem('username') == undefined) {
    form.action = '/login';
    form.submit();
  }
  else {
    var message = {
      "username" : sessionStorage.getItem('username'),
      "mdp" : sessionStorage.getItem('mdp')
    };
    setTimeout(function(){
      socket.emit('login', JSON.stringify(message));
    },1000);
  }
})();

//initialisation du socket
var socket = io.connect();

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
//et affiche le code de salon généré
(function main(){
  addEvent();
  afficheCode();
})();

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
function addEvent(){
  
  //les boutons/inputs de la page
  let input = document.getElementById('codeSalon');
  let aleatoire = document.getElementById('aleatoire');
  let retour = document.getElementById('retourAccueil');
  let launch = document.getElementById('launch');
  
  //le formulaire est validé
  form.addEventListener('submit', function(e){
    
    //l'utilisateur a choisit de choisir un code de salon personnalisé
    if(choix == 'codeSalon'){
      let code = prompt("Entrez un code de salon personnalisé"); //demande le code personnalisé
      if(code != null){
        codeSalon = formateForCode(code); //retire les caractères invalides
        afficheCode(); //affiche le nouveau code
      }
    }
    
    //générer un code aléatoire
    if(choix == 'aleatoire'){
      codeSalon = getRandomCode();
      afficheCode();
    }
    
    //demande au serveur d'ouvrir le salon avec le code indiqué, si le serveur renvoi la reponse 'launched',
    //alors le salon peut être ouvert et l'utilisateur est renvoyé vers celui-ci
    //sinon il ne se passe rien
    if(choix == 'launch'){
      socket.emit('code', codeSalon);
    }
    
    //renvoi l'utilisateur vers la page d'accueil
    if(choix == 'retourAccueil'){
      form.action = '/accueil'
      form.submit();
    }
    choix = '';
    e.preventDefault(); //ne pas quitter la page
  });
  
  //change la valeur de la variable choix pour y mettre l'id du bouton pressé
  input.onclick = changeChoix;
  aleatoire.onclick = changeChoix;
  launch.onclick = changeChoix;
  retour.onclick = changeChoix;
}

//modifie la variable choix pour savoir quel bouton a été choisit
function changeChoix(e){
  choix = e.target.id;
}

// on website : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Math/random
function getRandomCode() {
  return Math.floor(Math.random() * Math.floor(10000000000)) + 469285;
}

//affiche le code du salon actuellement choisit par l'utilisateur
function afficheCode(){
  let code = document.getElementById('afficheCode');
  code.value = '' + codeSalon;
}

//supprime les espaces et les '?' dans le code. les remplacent par des '_'
function formateForCode(code){
  code = formateCodeSpace(code);
  return formateCodeInterrogation(code);
}

//supprime les espaces
function formateCodeSpace(code){
  let split = code.split(' ');
  code = '';
  let i;
  for(i = 0; i < split.length - 1; i++){
    code += split[i] + '_';
    console.log(code);
  }
  code += split[i];
  console.log(code);
  return code;
}

//supprime les '?'
function formateCodeInterrogation(code){
  let split = code.split('?');
  code = '';
  let i;
  for(i = 0; i < split.length - 1; i++){
    code += split[i] + '_';
    console.log(code);
  }
  code += split[i];
  console.log(code);
  return code;
}

//le serveur valide la création du salon, redirection vers le salon
socket.on('launched', function(message){
  form.action = '/salon/' + codeSalon;
  form.submit();
});

//réception d'une invitation d'un ami, demande et transmet une réponse au serveur
//le serveur enverra un message pour rediriger les 2 joueurs vers un salon si l'invitation est acceptée
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