const SWITCH_HOUR = 18;

window.onload = function(){
  let time = new Date();
  if (time.getHours() >= SWITCH_HOUR) {
    document.getElementById('top_nav').className = 'navbar navbar-expand-md navbar-dark bg-dark sticky-top';
    document.getElementById('logo').src = 'images/logo.png';
    document.body.style.backgroundColor = '#614051';
    document.body.style.color = '#fff'; 
  }
}
