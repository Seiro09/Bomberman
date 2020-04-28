//inputs et formulaire de la page
let username = document.getElementById('username');
let password = document.getElementById('password');
let form = document.getElementById('form');

//vérifie si le client est connecté
//dans le cas contraire il est redirigé vers la page de connexion
if(sessionStorage.getItem('username') != undefined) {
  form.action = '/accueil';
  form.submit();
}

//initialisation du socket
var socket = io.connect();

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
(function main(){
  addEvent();
})();

//stocke l'identifiant du bouton pressé
var choix = '';

//ajoute l'evènement pour manipuler l'évènement 'submit' du formulaire
function addEvent(){
  
  //les boutons/inputs de la page
  let valider = document.getElementById('valider');
  
  //le formulaire est validé
  form.addEventListener('submit', function(e){
    //le client valide le formulaire de connexion
    //on envoie les informations de connexion au serveur pour qu'il valide la connexion
    if(choix == 'valider'){
      var message = {
        "username" : username.value,
        "mdp" : hex_sha256(password.value) //le mot de passe est haché avec sha256 (voir public/lib/sha256.js)
      };
      socket.emit('login', JSON.stringify(message));
    }
    
    e.preventDefault(); //ne pas quitter la page
  });
  
   //mettre l'id des boutons dans la variable choix
  valider.onclick = changeChoix;
}

//modifie la variable choix pour savoir quel bouton a été choisit en stockant l'id du bouton
function changeChoix(e){
  choix = e.target.id;
}

//le serveur répond suite à la demande de connexion du client
//si la connexion n'est pas bonne, le client est notifié par texte
//sinon le pseudonyme du client et son mot de passe (haché) sont stocké dans sessionStorage
socket.on('login', function(message){
  console.log("tentative de connexion : " + message);
  let loginResult = document.getElementById('loginResult');
  if(message == 'false')
    loginResult.innerHTML = "Les informations de connexion ne correspondent à aucun compte.";
  else if(message == 'erreur')
    loginResult.innerHTML = "Une erreur est survenu durant la tentative de connexion.";
  else if(message == 'true') {
    sessionStorage.setItem('username', username.value);
    sessionStorage.setItem('mdp', hex_sha256(password.value));
    form.action = '/accueil';
    form.submit();
  }
});