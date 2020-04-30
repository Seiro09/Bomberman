let form = document.getElementById('form');

//expiration de session au bout de 5 min
setTimeout(function(){
  sessionStorage.clear();
  alert("Votre session a expiré. veuillez vous reconnecter ");
  window.location.host = window.location.host + "/login";
},300*1000);

//vérifie si le joueur est connecté dans ce cas, il transmet ses informations de connexion au server.
//dans le cas contraire il est renvoyé vers la page de connexion
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

//obtention du level et transmission au server de son level pour être mis en file d'attente
(function main(){
  var level = getLevel();
  socket.emit("level",level);
})();

//récupérer le level présent dans l'url
function getLevel(){
  let url = document.location.href;
  let split = url.split('attente/');
  let split2 = split[1].split('?'); 
  if(split[1] == 'attente.html') {
    let form = document.getElementById('form');
    form.action = '/accueil';
    form.submit();
  }
  return split2[0];
}

//le server transmet ce message au client pour qu'il soit redirigé vers un salon
//avec un autre joueur dans la file d'attente
socket.on('adv', function(message){
  console.log('redirect')
  var form = document.getElementById('form');
  form.action = '/salon/' + message;
  form.submit();
}); 