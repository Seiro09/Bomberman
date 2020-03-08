var board = Array(6);

function render() {
  var div=document.querySelector('#plateau');
  div.innerHTML = '';
  var table = document.createElement("table");
  div.appendChild(table);
  for (var i = 0; i < 8; i++) {
    var tr=document.createElement("tr");
    table.appendChild(tr);
    for (var j = 0; j < 8; j++) {
      var td=document.createElement("td");
      if ((i+j)%2==0) {
        td.className="white";
      }
      else {
        td.className="black";
      }
      tr.appendChild(td);
    }
  }
}

render();
