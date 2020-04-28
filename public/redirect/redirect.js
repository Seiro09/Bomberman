let form = document.getElementById('form');

if(sessionStorage.getItem("username") == undefined) {
  form.action = "/login";
  form.submit();
}
else {
  form.action = '/accueil';
  form.submit();
}