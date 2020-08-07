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
let heatmap;
let map_style;
let establishment_markers = [];
let heatmap_data_users = [];
let marker_dict = {};
let flag_dict = {};
let user_lat;
let user_lng;
let sorted_report_counts;
let total_reports_count = 0;
let report_counts_dict = {};
 
//constants 
let DISTANCE_THRESHOLD_MILES = 15; //max distance to be considered "close" to user
let EARTH_RADIUS_MILES = 3958.8;
let SWITCH_HOUR = 18; //6:00 pm

/* Builds map object with zoom functionality */
function generateMap() {
  let time = new Date();
  map_style = day_map_style;
  if (time.getHours() >= SWITCH_HOUR) { 
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
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
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
    
    let close = isPlaceClose(user_lat, user_lng, 
      place.geometry.location.lat(), place.geometry.location.lng());
    if(close === true){
      infowindowContent.children['report'].style.display = 'inline-block';
    }else{
      infowindowContent.children['report'].style.display = 'none';
    }
    localStorage.setItem("form-place-name", place.name);
    localStorage.setItem("form-place-address", address);
    localStorage.setItem("form-lat", place.geometry.location.lat());
    localStorage.setItem("form-long", place.geometry.location.lng());

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
 
/* Populate the maps with flags. */
async function getFlags() {
  const response = await fetch('/data');
  const flags = await response.json();
  total_reports_count = flags.length;
  getPlaceCounts(flags);
  for (let i = 0; i < flags.length; i++) {
    createFlag(flags, i);
  }
};

/*sort flag data based on report count of places*/
function getPlaceCounts(flags){
  for (let i = 0; i < flags.length; i++) {
    let id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
    if(report_counts_dict[id] === undefined){
      report_counts_dict[id] = 1;
    }else{
      report_counts_dict[id] = report_counts_dict[id] + 1;
    }
  }   
  sorted_report_counts = Object.keys(report_counts_dict).map(function(key_id) {
    return [key_id, report_counts_dict[key_id]];
  });
  sorted_report_counts.sort(function(r1, r2) {
    return r2[1] - r1[1];
  });
}

/*physically create the markers*/
function createFlag(flags, i) {
  var infoWindow = new google.maps.InfoWindow();
  let id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
  var myLatlng = new google.maps.LatLng(flags[i].lat,flags[i].lng);
  
  heatmap_data_users.push(myLatlng);
  //this color coding is meant for when there's a larger dataset quantity
  let percentile = 100 - Math.round((getRank(id) / (total_reports_count + 1)) * 100);
  let icon_link = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  if(percentile >= 75){
    icon_link = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }
  else if(percentile >= 50){
    icon_link = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
  }
  console.log("count: "+report_counts_dict[id]+", percentile: "+percentile+", rank: "+getRank(id))
  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    icon: icon_link,
    title: flags[i].name,
    id: id,
    content:'<div>' + '<span class="title">' + flags[i].name + 
      '</span><br>' + '<span>' + flags[i].address + '</span>'
    });
    flag_dict[id] = {'flag_icon': flags[i].icon, 'flag_name': flags[i].name,
      'flag_address': flags[i].address, 'flag_lat': flags[i].lat, 
      'place_lng': flags[i].lng
    };   
    var contentString = '<div>' + '<span class="title">' + flags[i].name + 
      '</span><br>' + '<span>' + flags[i].address + '</span>';
    marker.addListener('click', function() {
      infoWindow.setContent(this.content);
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
 
/*determines which places have most cases relative to whole database
  currently doesn't account for if place is close to user*/
function getRank(id){
  let rank = 0;
  for(let k = 0; k < sorted_report_counts.length; k++){
    if(id === sorted_report_counts[k][0]){
      rank = k + 1;
      break;
    }
  }
  return rank;
}

 
 