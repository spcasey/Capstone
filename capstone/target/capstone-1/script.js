// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
let map;
/* Builds a map object with zoom functionality */
function generateMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0}, 
    zoom: 9,
  });
}
function getPlaces(lat, lng){
  map.setCenter({lat: lat, lng: lng}); 
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