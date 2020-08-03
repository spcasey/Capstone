// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* Retrieves places based on a passed longitude and latitude */
/*function getPlaces(lat, lng){
  map.setCenter({lat: lat, lng: lng}); 
  console.log(lat + ', ' + lng);
  let radius = 1500; //some predetermined constant
  let link = '/getPlaces?lat=' + lat + '&lng=' + lng + '&radius=' + radius; 
  let infoWindow = new google.maps.InfoWindow();
 
  fetch(link).then(response => response.text()).then((output) => {
    let places_dict = JSON.parse(output);
    if (places_dict['error'] === undefined) { 
      console.log(places_dict)
      console.log(places_dict.results)
      let places_result = places_dict.results;
      if (places_result.length > 0) {
        for (let i = 0; i < places_result.length; i++) {
          if(places_result[i].business_status !== undefined){//business, not locality
            let id = places_result[i].name + ';' + places_result[i].geometry.location.lat + ',' + places_result[i].geometry.location.lng;
            let marker = new google.maps.Marker({
              position: {lat: places_result[i].geometry.location.lat, lng: places_result[i].geometry.location.lng},
              map: map,
              icon: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
              title: places_result[i].name,
              id: id
            });
            marker_dict[id] = {'place_icon': places_result[i].icon, 'place_name': places_result[i].name,
              'place_address': places_result[i].vicinity, 'place_lat': places_result[i].geometry.location.lat, 
              'place_lng': places_result[i].geometry.location.lng
            };
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                let place = marker_dict[marker.id];
                console.log(place)
                console.log(place["place_address"])
                let infowindowContent = document.getElementById('infowindow-content');
                infowindowContent.children['place-icon'].src = place["place_icon"];
                infowindowContent.children['place-name'].textContent = place["place_name"];
                infowindowContent.children['place-address'].textContent = place["place_address"];
                document.getElementById('form-place-name').textContent = place["place_name"];
                document.getElementById('form-place-address').textContent = place["place_address"];
                document.getElementById('form-lat').textContent = place["place_lat"];
                document.getElementById('form-long').textContent = place["place_lng"];
                infoWindow.setContent(infowindowContent);
                infoWindow.open(map, marker);
              }
            }
            )(marker, i));
            establishment_markers.push(marker);
          }
        }
      } else {//Google Places couldn't find places near the user, 
        console.log('no places found')
      }      
    } else {//issue with the call itself
      console.log('call failed')
    }
  });
}*/

/* Retrieves counties based on a passed longtiude and latitude */
function getCounties(){
  console.log('getCounties');
  //getPlaces(-33.00, 151.00);
  map.setCenter({lat: -33.00, lng: 151.00}); 
  getFlags(); //flags_script.js
}

/* Prints geolocation success to console */
function userLocationSuccess(latitude, longitude){
  console.log('userLocationSuccess')
  //getPlaces(latitude, longitude);
  map.setCenter({lat: latitude, lng: longitude});
  getFlags();
}
 
/* Prints geolocation failure to console */
function userLocationFail(error){ 
  //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  getCounties();
}
 
window.onload = function(){
  let time = new Date();
  if (time.getHours() >= 18) { //18: after 6:00 pm
    document.body.style.backgroundColor = '#614051';
    /*document.getElementById("home").style.color = '#614051';
    document.getElementById("about").style.color = '#614051';*/
  }
  $.ajax({
    type : 'POST',
    data: '', 
    url: "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCgozira2dGlwMHT_WgQpmg84fk3VhRglM", 
    success: function(result){
      userLocationSuccess(result.location.lat, result.location.lng);
    },
    error: function(error){
      getCounties(); 
    }}
  );
  /*
  //Use this method when working in local host
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(userLocationSuccess, userLocationFail);
  } else {
    //geolocation not supported
    getCounties();
  }*/
}
 