const SWITCH_HOUR = 18;

window.onload = function(){
  let time = new Date();
  if (time.getHours() >= SWITCH_HOUR) {
    document.body.style.backgroundColor = '#614051';
    document.body.style.color = '#fff';  
  }
}
