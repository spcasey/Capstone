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

/* Builds map object with zoom functionality */
function generateMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0}, 
    zoom: 15,
  });

  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');
  var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');
  var autocomplete = new google.maps.places.Autocomplete(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
  ['address_components', 'geometry', 'icon', 'name']);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindow.open(map, marker);
  });

  // Sets a listener on a radio button to change the filter type on Places Autocomplete
  function setupClickListener(id, types) {
    var radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);

  document.getElementById('use-strict-bounds')
  .addEventListener('click', function() {
    console.log('Checkbox clicked! New state=' + this.checked);
    autocomplete.setOptions({strictBounds: this.checked});
  });
}

/* Retrieves places based on a passed longitude and latitude */
function getPlaces(lat, lng){
  map.setCenter({lat: lat, lng: lng}); 
  console.log(lat + ", " + lng);
  let radius = 1500; //some predetermined constant
  let link = '/getPlaces?lat=' + lat + '&lng=' + lng + '&radius=' + radius; 
  fetch(link).then(response => response.text()).then((output) => {
     console.log(output);
  });
}

/* Retrieves counties based on a passed longtiude and latitude */
function getCounties(){
  console.log("getCounties");
  getPlaces(-33.00, 151.00);
}

/* Prints geolocation success to console */
function userLocationSuccess(location){
  console.log("userLocationSuccess")
  getPlaces(location.coords.latitude, location.coords.longitude);
}

/* Prints geolocation failure to console */
function userLocationFail(error){ 
  //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  getCounties();
}


window.onload = function(){
  let establishments = [];
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(userLocationSuccess, userLocationFail);
  } else {
    //geolocation not supported
    getCounties();
  }
}
