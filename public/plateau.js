var width;
var height;
var squareSize;
window.addEventListener("resize", resize);
var nombreCases = 8;

/**
* classe représentant une position sur un plan 2D (x,y)
*/
class Position2D {
  
  /**
  * affecte les valeurs x et y aux coordonnées du points.
  * dans le cas ou les valeurs ne sont pas données, la valeur sera affectée par défaut
  */
  constructor(x,y) {
    if(x == undefined) this.x = 0;
    else this.x = x;
    if(y == undefined) this.y = 0;
    else this.y = y;
    
  }
  
  //retourne une chaine de caractère représentant la position (pour afficher dans la console)
  log(){
    return '(' + this.x + ',' + this.y + ')';
  }
  
  // définir une nouvelle position
  set(x,y){
    this.x = x;
    this.y = y;
  }
}

/**
* classe représentant un pion basique, sert de structure pour les pions du jeu
*/
class Pion {
  
  //construit le pion
  constructor(color,x,y) {
    this.deplace = true;
    this.position = new Position2D(x,y);
    this.src = "https://cdn.glitch.com/cc360787-9153-4d34-a2e2-ddbd9bc2b9e4%2FBlackPawn.png?v=1583876671281";
    this.color = color;
    console.log("nouveau pion en " + this.position.log());
  }
  
  /*
  * place le pion sur le plateau en ajoutant la photo du pion associé à l'instance du pion
  * active l'évènement de sélection (voir doc "setSelectable()")
  */
  affiche(){
    let td = this.getCase();
    let piece = document.createElement('img');
    td.appendChild(piece);
    piece.src = this.src;
    piece.width = squareSize;
    piece.height = squareSize;
    //piece.style.margin = '' + tailleCase/4 + 'px ' + tailleCase/4 + 'px';
    this.setSelectable();
  }
  
  //activer l'évènement permettant à l'utilisateur de le choisir pour le déplacer
  setSelectable(){
    this.deplace = true;
    let me = this; //se copier pour les fonctions ou le this n'est plus possible
    let img = this.getImg();
    if(img != undefined) img.addEventListener('click', function(e){
      me.setNonSelectable();
      me.selectNewCase();
    });
  }
  
  //retire l'évènement permettant de le déplacer
  setNonSelectable(){
    this.deplace = false;
  }
  
  //return la case <td> associé au pion
  getCase(){
    return document.getElementById('Case' + this.position.x + this.position.y);
  }
  
  //return l'image <img> associé au pion
  getImg(){
    return this.getCase().lastChild;
  }
  
  /*
  * deplace le pion su la case indiqué en retirant l'image de l'ancienne case et l'ajoute à la nouvelle
  */
  move(x,y){
    if(x != this.position.x || y != this.position.y) {
      let td = this.getCase();
      let child = td.removeChild(td.lastChild);
      this.position.set(x,y);
      td = this.getCase();
      td.appendChild(child);
    }
    
  }
  
  //Efface le pion de sa position, retire son image du plateau
  delete(){
    let td = this.getCase();
    let img = td.lastChild;
    if(img != undefined) td.removeChild(img);
  }
  
  /*
  * modifie les cases qui respectent les règles de déplacement du pion
  * sélectionne certaines cases et les modifie pour qu'elles soient accessibles au pion
  * se référer à la doc de "setCaseSelectionnable()" qui rend une case accessible au pion
  */
  selectNewCase(){
    let td;
    for(let y = 0; y < nombreCases; y++){
      for(let x = 0; x < nombreCases; x++){
        td = document.getElementById('Case' + x + y);
        
        if(!(this.position.x == x && this.position.y == y)){ //rendre toutes les cases selectionnable sauf celle du pion
          setCaseSelectionnable(td,this);
          console.log("modifPieces")
        }
        
        else { //actions sur la case du pion (fonctionne pas -_-)
          console.log("annule deplacement");
          let img = this.getImg();
          img.onmouseclick = function(e){
            
            resetAllCases();
            this.setSelectable();
          }
        }
      }
    }
  }
  
  dead(){
    let td = this.getCase();
    td.remove(td.lastChild);
  }
}

//tableau de pions
var pions = [new Pion('white',0,0), new Pion('black',1,0)];

//supprime la photo du pion et la rajoute sur le plateau, pour refresh l'affichage
function refreshPions(){
  for(let i = 0; i < pions.length; i++) {
    pions[i].delete();
    pions[i].affiche();
  }
}

function getPion(x,y){
  for(let i = 0; i < pions.length; i++) {
    if(pions[i].position.x == x && pions[i].position.y == y) return pions[i];
  }
}

//Initialisation des variables width and height au début et à chaque resize de la fenêtre d'affichage
function initVal(){
  width = window.innerWidth;//Récupération de la largeur de la fenêtre
  height = window.innerHeight;///Récupération de la hauteur de la fenêtre
  
  if (window.innerHeight > window.innerWidth) {//Si l'orientation de la fenêtre est portrait
    squareSize = (0.6 * width) / 8;//La longueur de la case est liée à width
  }
  else {squareSize = (0.6 * height) / 8;}//La largeur de la case est liée à height
}


/**
* crée les attributs du tableau pour faire l eplateau de jeu
* chaque case aura un identifiant associé à ses coordonnées qui prends la forme "Casexy" x et y les valeurs de la position
* une classe whiteCase ou blackCase sera affectée à la case selon qu'elle soit blanche ou noir
*/
function plateauEchec(){
  let plateau = document.getElementById('plateau');
  initVal();
  let tr;
  let td;
  
  var table = document.createElement('table');
  plateau.appendChild(table);
  
  table.setAttribute('id', 'tableEchec');
  
  for(let y = 0; y < nombreCases; y++){
    tr = document.createElement('tr');
    tr.setAttribute('id','row' + y);
    
    for(let x = 0; x < nombreCases; x++){
      td = document.createElement('td');
      td.setAttribute('id', 'Case' + x + y);
      if((x + y) % 2 == 0){
        td.setAttribute('class', 'whiteCase');
      }
      else {
        td.setAttribute('class', 'blackCase');
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

/*Fonction appelée à chaque redimensionnement, pour adapter la taille de l'interface du jeu à la 
fenêtre d'affichage*/
function resize(){
  initVal();
  
  refreshPions();
}

//fonction de départ du script
(function main(){
  plateauEchec();
  refreshPions();
  pions[0].setNonSelectable();
})();

/*
* la case <td> du tableau donné en parametre devient disponible pour le placement du pion
* modifie la couleur de la case afin que l'utilisateur puisses la discerner des autres cases
* ajoute des évènements comme le survolement qui insiste sur le discernement des cases
* l'évènement de click définit le choix de l'utilisateur pour le déplacement du pion
* et supprime la modification de couleurs permettant de discerner les cases et supprime les autres évènements
*/
function setCaseSelectionnable(td,pion){
  //couleur de discernement de la case pour être choisit pour le déplacement (rouge si un pion se trouve déjà sur la case)
  var newClass = (td.firstChild == undefined)? 'selectCase' : 'selectCollision';
  
  td.className = newClass; //ajoute un contour pour indiquer que la case peut être choisit
  
  td.onclick = function(e){ //si l'on sélectionne la case
    console.log("move to " + e.target.id);
    let td2;
    //la modification de couleurs et d'évènements est retirés des cases et le déplacement du pion est éffectué
    resetAllCases();
    
    //identifiant : "Casexy", récupération de x et y
    let a = parseInt(e.target.id.charAt(4)); //récupère la coordonnée x
    let b = parseInt(e.target.id.charAt(5)); //récupère la coordonnée y
    let pionExist;
    if((pionExist = getPion(a,b)) != undefined){
      pionExist.dead();
    }
    
    //déplacement du pion
    pion.move(a,b);
  }
}

//supprime les évènements et rends les couleurs d'origine à toutes les cases du plateau
function resetAllCases(){
  for(let y = 0; y < nombreCases; y++){
    for(let x = 0; x < nombreCases; x++){
      resetCase(document.getElementById('Case' + x + y));
    }
  }
}

/*
* la case donnée en paramètre est réinitialisée
* suppression des évènements s'ils existent
* et modification de la couleur pour la couleur d'origine de la case
*/
function resetCase(td) {
  td.onmouseenter = td.onmouseout = td.onclick = '';
  let color = parseInt(td.id.charAt(4)) + parseInt(td.id.charAt(5));
  if(color % 2 == 0){
    td.className = 'whiteCase';
  }
  else {
    td.className = 'blackCase';
  }
}
