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

//global vars; referenced in both this script and locations_script 

let map;
let map_style;
let heatmap_data = [];
let user_lat;
let user_lng;
let DISTANCE_THRESHOLD_MILES = 15; //predetermined constant; max distance to be considered "close" to user
let EARTH_RADIUS_MILES = 3958.8;

/* Builds map object with zoom functionality. */
function generateMap() {
  let time = new Date();
  map_style = day_map_style;

  // Sets map to night mode if accessed at night
  if (time.getHours() >= 18) { 
    map_style = night_map_style;
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0}, 
    zoom: 15,
    styles: map_style
  });

  map.setOptions({
    minZoom: 12, 
    maxZoom: 18 
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
  });

  let card = document.getElementById('pac-card');
  let input = document.getElementById('pac-input');
  let types = document.getElementById('type-selector');
  let strictBounds = document.getElementById('strict-bounds-selector');
  let autocomplete = new google.maps.places.Autocomplete(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
 
  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request
  autocomplete.bindTo('bounds', map);
 
  // Set the data fields to return when the user selects a place
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
    //If place is near the user, let them submit
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
    let close = isPlaceClose(user_lat, user_lng, 
      place.geometry.location.lat(), place.geometry.location.lng());
    console.log("close? " + close)
    if(close === true && isSignedIn()){
      infowindowContent.children['report'].style.display = 'inline-block';
    }else{
      infowindowContent.children['report'].style.display = 'none';
    }
    localStorage.setItem("form-place-name", place.name);
    localStorage.setItem("form-place-address", address);
    localStorage.setItem("form-lat", place.geometry.location.lat());
    localStorage.setItem("form-long", place.geometry.location.lng());
    localStorage.setItem("form-userId", String(getUserId()));
    infowindow.open(map, marker);

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
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
 
  document.getElementById('use-strict-bounds').addEventListener('click', function() {
    console.log('Checkbox clicked! New state=' + this.checked);
    autocomplete.setOptions({strictBounds: this.checked});
  });
}
 

/* Populate the maps with flags from the data in datastore. */
async function getFlags() {
  checkLogin(); //call function to hide login/logout buttons
  deleteExpiredFlags(); //delete flags that are more 14 days old
  const response = await fetch('/data');
  const flags = await response.json();
  for (let i = 0; i < flags.length; i++) {
    createFlag(flags, i);
  }
};


/** Takes attributes such as lat and long from datastore
  * and transfer the information to the map while initializing
  * infowindows for the flags.
 */
function createFlag(flags, i) {
  var infoWindow = new google.maps.InfoWindow();
  let id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
  var myLatlng = new google.maps.LatLng(flags[i].lat,flags[i].lng);
  heatmap_data.push(myLatlng);

  let userId = flags[i].userId;
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    title: flags[i].name,
    id: id,

    contentForUserWhoFlagged: '<div class="padding"><span class="title">' + flags[i].name + 
      '</span><br>' + '<span>' + flags[i].address + '</span>' +
      '<br><br><div><button class="btn btn-outline-danger" style="text-align:right;"' 
      + 'onclick=deleteUserFlag(' + flags[i].id + ')>Delete</button></div></div>',
    content:'<div class="padding"><span class="title">' + flags[i].name + 
      '</span><br><br>' + '<span>' + flags[i].address + '</span></div>'
    });
    marker.addListener('click', function() {
      if (getUserId() === userId) {
          infoWindow.setContent(this.contentForUserWhoFlagged);
      } else {
          infoWindow.setContent(this.content);
      }
      infoWindow.open(map, marker);
    }); 
    
}

/*check if searched place is near the user (haversine formula), determines whether to let them report*/
function isPlaceClose(p1_lat, p1_lng, p2_lat, p2_lng){
  let rad = Math.PI / 180;
  let dlat = (p2_lat - p1_lat) * rad;
  let dlng = (p2_lng - p1_lng) * rad;
  let dist = 2.0 * EARTH_RADIUS_MILES * Math.asin(
    Math.sqrt(Math.sin(dlat / 2.0) * Math.sin(dlat / 2.0) + 
    Math.cos(p1_lat * rad)*Math.cos(p2_lat * rad) * 
    Math.sin(dlng / 2.0) * Math.sin(dlng / 2.0)));
  console.log("Distance (mi): " + Math.floor(dist));
  if(Math.floor(dist) <= DISTANCE_THRESHOLD_MILES){
    return true;
  }
  return false;
}

/** Delete flags after the timestamp of the flags exceed
  * 14 days from the current timestamp to ensure all the data
  * is relevant.
   */
function deleteExpiredFlags() {
    const params = new URLSearchParams;
    fetch('/delete-flag', {method: 'POST', body: params});
}

/** Delete flags that the current user reported. */
function deleteUserFlag(id) {
  const params = new URLSearchParams;
  params.append('flagId', id);
  fetch('/deleteUserFlag', {method: 'POST', body: params});
  location.reload();
}

/** Testing function for mocha lol. */
function testingMocha(A, B) {
    return A + B;
}

/** Export functions to allow Mocha and Chai testing. */
exports.testingMocha = testingMocha;
exports.isPlaceClose = isPlaceClose;
 