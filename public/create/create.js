var codeSalon;
var choix = '';

var socket = io.connect(); //io existe dans create.html, erreur normale

(function main(){
  addEvent();
  codeSalon = getRandomCode();
  afficheCode();
})();

function addEvent(){
  
  let input = document.getElementById('codeSalon');
  let valider = document.getElementById('valider');
  let aleatoire = document.getElementById('aleatoire');
  let retour = document.getElementById('retourAccueil');
  let launch = document.getElementById('launch');
  let form = document.getElementById('banniereTable');
  
  form.addEventListener('submit', function(e){
    
    if(choix == 'valider'){
      if(input.value != '') {
        codeSalon = input.value;
        afficheCode();
      }
    }
    
    if(choix == 'aleatoire'){
      codeSalon = getRandomCode();
      afficheCode();
    }
    
    if(choix == 'launch'){
      form.action = '/salon/' + codeSalon;
      socket.emit('code', codeSalon);
      socket.on('launched', function(message){
        form.submit();
      });
    }
    
    if(choix == 'retourAccueil'){
      form.action = '/'
      form.submit();
    }
    
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

function afficheCode(){
  let code = document.getElementById('afficheCode');
  code.value = '' + codeSalon;
}