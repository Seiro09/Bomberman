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
    if(choix == 'join'){
      let codeSalon = prompt("Entrez le code de salon à rejoindre");
      if(codeSalon != null){
        form.action = '/salon/' + codeSalon;
        form.submit();
      }
    }
    
    if(choix == 'create'){
      form.action = '/create/create.html';
      form.submit();
    }
    
    if(choix == 'aleatoire'){
      
    }
    
    e.preventDefault(); //ne pas quitter la page
  });
  
  create.onclick = changeChoix;
  join.onclick = changeChoix;
  aleatoire.onclick = changeChoix;
  regles.onclick = changeChoix;
}

//modifie la variable choix pour savoir sur quel bouton a été choisit
function changeChoix(e){
  choix = e.target.id;
}