(function main(){
  addEvent();
})();

var choix = '';

function addEvent(){
  
  let create = document.getElementById('create');
  let join = document.getElementById('join');
  let aleatoire = document.getElementById('aleatoire');
  let regles = document.getElementById('regles');
  let form = document.getElementById('banniereTable');
  
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
      form.action = '/create/create.html';
      form.submit();
    }
    
    //permettra de joindre 2 personnes en aleatoire dans un meme salon
    if(choix == 'aleatoire'){
      
    }
    e.preventDefault(); //ne pas quitter la page
  });
  
  create.onclick = changeChoix;
  join.onclick = changeChoix;
  aleatoire.onclick = changeChoix;
  regles.onclick = changeChoix;
}

//modifie la variable choix pour savoir quel bouton a été choisit en stockant l'id du bouton
function changeChoix(e){
  choix = e.target.id;
}