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

let map;
let map_style;
let establishments = [];
let establishment_markers = [];
let marker_dict = {};

/* Builds map object with zoom functionality */
function generateMap() {
  let time = new Date();
  map_style = day_map_style;
  if (time.getHours() >= 18) { //after 6:00 pm
    map_style = night_map_style;
  }
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0}, 
    zoom: 15,
    styles: map_style
  });
  map.setOptions({
    minZoom: 12, 
    maxZoom: 18 //whats the max allowed by google maps??
  });
  //map.clearOverlays(); //clear markers
  let card = document.getElementById('pac-card');
  let input = document.getElementById('pac-input');
  let types = document.getElementById('type-selector');
  let strictBounds = document.getElementById('strict-bounds-selector');
  let autocomplete = new google.maps.places.Autocomplete(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
  ['address_components', 'geometry', 'icon', 'name']);

  let infowindow = new google.maps.InfoWindow();
  let infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  let marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    let place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed
      window.alert('No details available for input: \'' + place.name + '\'');
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

    let address = '';
    
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
    infowindowContent.children['location'].textContent = place.geometry.location;
    document.getElementById('form-place-name').textContent = place.name;
    document.getElementById('form-place-address').textContent = address;
    document.getElementById('form-location').textContent = place.geometry.location;
    infowindow.open(map, marker);
  });

  // Sets a listener on a radio button to change the filter type on Places Autocomplete
  function setupClickListener(id, types) {
    let radioButton = document.getElementById(id);
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
              'place_address': places_result[i].vicinity, 'geometry': {"lat": places_result[i].geometry.location.lat, 
              "lng": places_result[i].geometry.location.lng}
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
                document.getElementById('form-location').textContent = JSON.stringify(place["geometry"]);
                infoWindow.setContent(infowindowContent);
                infoWindow.open(map, marker);
              }
            })(marker, i));
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
}

/* Retrieves counties based on a passed longtiude and latitude */
function getCounties(){
  console.log('getCounties');
  getPlaces(-33.00, 151.00);
}

/* Prints geolocation success to console */
function userLocationSuccess(latitude, longitude){
  console.log('userLocationSuccess')
  getPlaces(latitude, longitude);
}

/* Prints geolocation failure to console */
function userLocationFail(error){ 
  //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  getCounties();
}


window.onload = function(){
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

