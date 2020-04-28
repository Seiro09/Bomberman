//boutons/inputs/meter et formulaire de la page
let username = document.getElementById('username');
let password1 = document.getElementById('password1');
let password2 = document.getElementById('password2');
let form = document.getElementById('form');
let registerResult = document.getElementById('registerResult');
var meter = document.getElementById('meter');
var force = document.getElementById('force');
//mots clés pour indiquer la force du mot de passe entré
var strong = ["Aucune","Faible","Moyenne", "Forte", "Très forte"]; 

//indique à l'utilisateur des conseils pour améliorer son mot de passe
var aide = 'Conseils pour améliorer la force de votre mot de passe :\n\
- Augmenter la longueur de votre mot de passe\n\
- Varier les caractères\n\
- Eviter des suites logiques\n\
- Ajouter des lettres en majuscules et en minuscules\n\
- Ajouter des chiffres\n\
- Ajouter des caractères spéciaux';

//ajout de l'aide visible lorsque l'utilisateur place la souris sur l'objet
document.getElementById("aide").title = aide;
password1.setAttribute('title', aide);

//initialise le socket
var socket = io.connect();

//ajoute la manipulation de l'évènement 'submit' du formulaire
(function main(){
  addEvent();
})();

//stocke l'identifiant du bouton pressé
var choix = '';

//ajoute la manipulation de l'évènement 'submit' du formulaire
function addEvent(){
  
  //bouton valider de la page
  let valider = document.getElementById('valider');
  
  //le formulaire est validé
  form.addEventListener('submit', function(e){
    //le client valide ses informations d'inscription et les envoient au serveur
    if(choix == 'valider'){
      //le mot de passe doit correspondre avec le champs de confirmation de mot de passe
      //la force du mot de passe doit être au moins moyenne
      //le mot de passe doit contenir au moins 8 caractères
      if(password1.value == password2.value && meter.value > 1 && password1.value.length > 7) {
        var message = {
          "username" : username.value,
          "mdp" : hex_sha256(password1.value) //haché avec sha256 (voir /public/lib/sha256.js)
        };
        socket.emit('register', JSON.stringify(message));
      }
      //le champs de vérification de mot de passe et le mot de passe ne sont pas identiques
      else if(password1.value != password2.value) {
        console.log("disagree");
        registerResult.innerHTML = "Les mots de passes ne correspondent pas";
      }
      //il n'y pas au moins 8 caractères dans le mot de passe
      else if(password1.value.length < 8) {
        registerResult.innerHTML = "Veuillez choisir un mot de passe avec au moins 8 caractères.";
      }
      //la force du mot de passe n'est pas suffisante
      else {
        registerResult.innerHTML = "Veuillez choisir un mot de passe au moins de force moyenne.";
      }
    }
    e.preventDefault(); //ne pas quitter la page
  });
  
  //change la valeur de la variable choix pour y mettre l'id du bouton pressé
  valider.onclick = changeChoix;
}

//modifie la variable choix pour savoir quel bouton a été choisit
function changeChoix(e){
  choix = e.target.id;
}

//la valeur du mot de passe est modifié, on recalcule la force obtenue
//on met à jour le <meter> et le texte pour indiquer au client la force obtenue
password1.addEventListener('input', function(e){
  //voir https://css-tricks.com/password-strength-meter/
  var result = zxcvbn(password1.value);
  // Update the password strength meter
  meter.value = result.score;
  force.innerHTML = strong[meter.value];
});

//le serveur réponds à la demande d'inscription du client
//si l'inscription a réussi, il est redirigé vers la page de connexion
socket.on("register", function(message) {
  if(message == 'erreur') {
    registerResult.innerHTML = "La création du compte a échoué";
  }
  else {
    registerResult.innerHTML = "La création du compte a réussi";
    setTimeout(function(){
      form.action = '/login';
      form.submit();
    },2000);
    
  }
});