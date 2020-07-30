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
//referenced in both this script and locations_script
let map;
let map_style;
let establishment_markers = [];
let marker_dict = {};
let flag_dict = {};
let is_place_near_user = false;

/* Builds map object with zoom functionality */
function generateMap() {
  let time = new Date();
  map_style = day_map_style;
  if (time.getHours() >= 18) { //18 : after 6:00 pm
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
    //if place is near the user, let them submit
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
    document.getElementById('form-lat').textContent = place.geometry.location.lat();
    document.getElementById('form-long').textContent = place.geometry.location.lng();
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
 
  document.getElementById('use-strict-bounds')
  .addEventListener('click', function() {
    console.log('Checkbox clicked! New state=' + this.checked);
    autocomplete.setOptions({strictBounds: this.checked});
  });
}
 
/* Populate the maps with flags. */
async function getFlags() {
    const response = await fetch('/data');
    const flags = await response.json();
        for (let i = 0; i < flags.length; i++) {
            createFlag(flags, i);
        }
};

function createFlag(flags, i) {
    var infoWindow = new google.maps.InfoWindow();
    let id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
            var myLatlng = new google.maps.LatLng(flags[i].lat,flags[i].lng);
            var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              title: flags[i].name,
              id: id,
              content:'<div>'+
                '<span class="title">' + flags[i].name + '</span><br>' +
                '<span>' + flags[i].address + '</span>'
            });

            flag_dict[id] = {'flag_icon': flags[i].icon, 'flag_name': flags[i].name,
              'flag_address': flags[i].address, 'flag_lat': flags[i].lat, 
              'place_lng': flags[i].lng
            };
            
            var contentString = '<div>'+
                '<span class="title">' + flags[i].name + '</span><br>' +
                '<span>' + flags[i].address + '</span>';


            marker.addListener('click', function() {
                infoWindow.setContent(this.content);
                infoWindow.open(map, marker);
            });
            
            /**
            google.maps.event.addListener(marker, 'click', (function(flag, i) {
              return function() {
                    let flag_marker = flag_dict[flag.id];
                    let infowindowContent = document.getElementById('infowindow-content');
                    infowindowContent.children['place-icon'].src = flag_marker["flag_icon"];
                    infowindowContent.children['place-name'].textContent = flag_marker["flag_name"];
                    infowindowContent.children['place-address'].textContent = flag_marker["flag_address"];
                    document.getElementById('form-place-name').textContent = flag_marker["flag_name"];
                    document.getElementById('form-place-address').textContent = flag_marker["flag_address"];
                    document.getElementById('form-lat').textContent = flag_marker["flag_lat"];
                    document.getElementById('form-long').textContent = flag_marker["flag_lng"];
                    infoWindow.setContent(infowindowContent);
                    if (infoWindowClosed = true) {
                        infoWindow.open(map, marker);
                        infoWindowClosed = false;
                    } 
              }
            }
            )(marker, i));
        }
};

            */
}
 
 

 
 
