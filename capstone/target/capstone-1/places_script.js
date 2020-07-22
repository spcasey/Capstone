function getPlaces(lat, lng){
  console.log(lat + ", " + lng);
  let radius = 1500; //some predetermined constant
  let link = '/getPlaces?lat=' + lat + '&lng=' + lng + '&radius=' + radius; 
  fetch(link).then(response => response.text()).then((output) => {
     console.log(output);
  });
}
//input textbox of local counties
function getCounties(){
  console.log("getCounties");
  getPlaces(-33.00, 151.00);
}
function userLocationSuccess(location){
  console.log("userLocationSuccess")
  getPlaces(location.coords.latitude, location.coords.longitude);
}
function userLocationFail(error){ //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  getCounties();
}
window.onload = function(){
  let establishments = [];
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(userLocationSuccess, userLocationFail);
  }else{
    //geolocation not supported
    getCounties();
  }
}