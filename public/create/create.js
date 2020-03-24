var codeSalon = getRandomCode();
var choix = '';

var socket = io.connect(); //io existe dans create.html, erreur normale si elle apparait

(function main(){
  addEvent();
  afficheCode();
})();

function addEvent(){
  
  let input = document.getElementById('codeSalon');
  let valider = document.getElementById('valider');
  let aleatoire = document.getElementById('aleatoire');
  let retour = document.getElementById('retourAccueil');
  let launch = document.getElementById('launch');
  let form = document.getElementById('banniereTable');
  
  //le formulaire est validé
  form.addEventListener('submit', function(e){
    
    //l'utilisateur a validé son code de salon personnalisé
    if(choix == 'valider'){
      if(input.value != '') { // si le code n'est pas vide
        input.value = formateForCode(input.value); //on supprime les espaces
        codeSalon = input.value;
        afficheCode();
      }
    }
    
    //choisit un code aléatoire
    if(choix == 'aleatoire'){
      codeSalon = getRandomCode();
      afficheCode();
    }
    
    //demande au serveur d'ouvrir le salon avec le code indiqué, si le serveur renvoi la reponse 'launched',
    //alors le salon peut être ouvert et l'utilisateur est renvoyé vers celui-ci
    if(choix == 'launch'){
      form.action = '/salon/' + codeSalon;
      socket.emit('code', codeSalon);
      socket.on('launched', function(message){
        form.submit();
      });
    }
    
    //renvoi l'utilisateur vers la page d'accueil
    if(choix == 'retourAccueil'){
      form.action = '/'
      form.submit();
    }
    choix = '';
    e.preventDefault(); //ne pas quitter la page
  });
  
  valider.onclick = changeChoix;
  aleatoire.onclick = changeChoix;
  launch.onclick = changeChoix;
  retour.onclick = changeChoix;
}

//modifie la variable choix pour savoir sur quel bouton a été choisit
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

//supprime les espaces dans le code et les remplacent par des '_'
function formateForCode(code){
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