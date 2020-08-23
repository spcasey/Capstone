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

const DISTANCE_THRESHOLD_MILES = 15; // max distance to be considered "close" to user
const EARTH_RADIUS_MILES = 3958.8;
const SWITCH_HOUR = 18; // 6:00 pm
const MIN_MAP_ZOOM = 12;
const DEFAULT_MAP_ZOOM = 15;
const MAX_MAP_ZOOM = 18;
const gradient = [
  'rgba(0, 255, 255, 0)',
  'rgba(0, 255, 255, 1)',
  'rgba(0, 191, 255, 1)',
  'rgba(0, 127, 255, 1)',
  'rgba(0, 63, 255, 1)',
  'rgba(0, 0, 255, 1)',
  'rgba(0, 0, 223, 1)',
  'rgba(0, 0, 191, 1)',
  'rgba(0, 0, 159, 1)',
  'rgba(0, 0, 127, 1)',
  'rgba(63, 0, 91, 1)',
  'rgba(127, 0, 63, 1)',
  'rgba(191, 0, 31, 1)',
  'rgba(255, 0, 0, 1)',
];

/* geolocation api */
function getUserLocation() {
  const time = new Date();
  if (time.getHours() >= SWITCH_HOUR) {
    document.body.style.backgroundColor = '#614051';
    document.getElementById('top_nav').className = 'navbar navbar-expand-md navbar-dark bg-dark sticky-top';
    document.getElementById('pac').style.color = 'white';
    document.getElementById('pac').className = 'bg-dark';
  }
  $.ajax({
    type: 'POST',
    data: '',
    url: 'https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCgozira2dGlwMHT_WgQpmg84fk3VhRglM',
    success: function(result) {
      generateMap(result.location.lat, result.location.lng);
    },
    error: function(error) {
      window.location.href = 'trends.html';
    }},
  );
}

/* Builds map object with zoom functionality */
function generateMap(user_lat, user_lng) {
  localStorage.setItem('prev_page', 'home');
  const time = new Date();
  let map_style = day_map_style;
  if (time.getHours() >= SWITCH_HOUR) {
    map_style = night_map_style;
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: user_lat, lng: user_lng},
    zoom: DEFAULT_MAP_ZOOM,
    styles: map_style,
  });
  map.setOptions({
    minZoom: MIN_MAP_ZOOM,
    maxZoom: MAX_MAP_ZOOM,
  });

  const promise = getFlags();

  // map.clearOverlays(); //clear markers
  const card = document.getElementById('pac-card');
  const input = document.getElementById('pac-input');
  const types = document.getElementById('type-selector');
  const strictBounds = document.getElementById('strict-bounds-selector');
  const autocomplete = new google.maps.places.Autocomplete(input);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo('bounds', map);

  // Set the data fields to return when the user selects a place.
  autocomplete.setFields(
      ['address_components', 'geometry', 'icon', 'name']);

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();
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
      map.setZoom(17); // Why 17? Because it looks good.
    }

    marker.setPosition(place.geometry.location);
    // if place is near the user, let them submit
    marker.setVisible(true);

    let address = '';

    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || ''),
      ].join(' ');
    }

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;

    const close = isPlaceClose(user_lat, user_lng,
        place.geometry.location.lat(), place.geometry.location.lng());
    if (close === true && isLoggedOn()) {
      infowindowContent.children['report'].style.display = 'inline-block';
    } else {
      infowindowContent.children['report'].style.display = 'none';
    }
    localStorage.setItem('form-place-name', place.name);
    localStorage.setItem('form-place-address', address);
    localStorage.setItem('form-lat', place.geometry.location.lat());
    localStorage.setItem('form-long', place.geometry.location.lng());
    localStorage.setItem('form-userId', String(getUserId()));

    infowindow.open(map, marker);

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  });

  // Sets a listener on a radio button to change the filter type on Places Autocomplete
  function setupClickListener(id, types) {
    const radioButton = document.getElementById(id);
    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(types);
    });
  }

  setupClickListener('changetype-all', []);
  setupClickListener('changetype-address', ['address']);
  setupClickListener('changetype-establishment', ['establishment']);
  setupClickListener('changetype-geocode', ['geocode']);

  document.getElementById('use-strict-bounds').addEventListener('click', function() {
    autocomplete.setOptions({strictBounds: this.checked});
  });

  let heatmap_data_users = [];
  promise.then((data) => {
    heatmap_data_users = data;
    const heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmap_data_users,
    });
    heatmap.setMap(map);
  });
}

/* Populate the maps with flags from the data in datastore. */
async function getFlags() {
  checkLogin();
  deleteExpiredFlags();
  const response = await fetch('/data');
  const flags = await response.json();
  const sorted_counts_dict = getPlaceCounts(flags);
  let heatmap_data_users = [];
  for (let i = 0; i < flags.length; i++) {
    heatmap_data_users = createFlag(flags, i, heatmap_data_users, sorted_counts_dict);
  }
  return heatmap_data_users;
};

/* sort flag data based on report count of places*/
function getPlaceCounts(flags) {
  const report_counts_dict = {};
  for (let i = 0; i < flags.length; i++) {
    const id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
    if (report_counts_dict[id] === undefined) {
      report_counts_dict[id] = 1;
    } else {
      report_counts_dict[id] = report_counts_dict[id] + 1;
    }
  }
  const sorted_report_counts = Object.keys(report_counts_dict).map(function(key_id) {
    return [key_id, report_counts_dict[key_id]];
  });
  sorted_report_counts.sort(function(r1, r2) {
    return r2[1] - r1[1];
  });
  const sorted_counts_dict = {};
  sorted_report_counts.forEach(([key, value]) => sorted_counts_dict[key] = value);
  return sorted_counts_dict;
}

/** Takes attributes such as lat and long from datastore
  * and transfer the information to the map while initializing
  * infowindows for the flags.
 */
function createFlag(flags, i, heatmap_data_users, sorted_report_counts) {
  const infoWindow = new google.maps.InfoWindow();
  const id = flags[i].name + ';' + flags[i].lat + ';' + flags[i].lng;
  const myLatlng = new google.maps.LatLng(flags[i].lat, flags[i].lng);
  heatmap_data_users.push(myLatlng);

  // this color coding is meant for when there's a larger dataset quantity
  const percentile = 100 - Math.round((getRank(id, sorted_report_counts) / (flags.length + 1)) * 100);
  let icon_link = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  if (percentile >= 75) {
    icon_link = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  } else if (percentile >= 50) {
    icon_link = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
  }

  const userId = flags[i].userId;
  const marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    icon: icon_link,
    title: flags[i].name,
    id: id,
    contentForUserWhoFlagged: '<div class="padding"><span class="title">' + flags[i].name +
      '</span><br>' + '<span>' + flags[i].address + '</span>' +
      '<br><br><div><button class="btn btn-outline-danger" style="text-align:right;"' +
      'onclick=deleteUserFlag(' + flags[i].id + ')>Delete</button></div></div>',
    content: '<div class="padding"><span class="title">' + flags[i].name +
      '</span><br><br>' + '<span>' + flags[i].address + '</span></div>',
  });
  marker.addListener('click', function() {
    if (getUserId() === userId) {
      infoWindow.setContent(this.contentForUserWhoFlagged);
    } else {
      infoWindow.setContent(this.content);
    }
    infoWindow.open(map, marker);
  });
  return heatmap_data_users;
}

/* check if searched place is near the user (haversine formula), determines whether to let them report*/
function isPlaceClose(p1_lat, p1_lng, p2_lat, p2_lng) {
  const rad = Math.PI / 180;
  const dlat = (p2_lat - p1_lat) * rad;
  const dlng = (p2_lng - p1_lng) * rad;
  const dist = 2.0 * EARTH_RADIUS_MILES * Math.asin(
      Math.sqrt(Math.sin(dlat / 2.0) * Math.sin(dlat / 2.0) +
    Math.cos(p1_lat * rad)*Math.cos(p2_lat * rad) *
    Math.sin(dlng / 2.0) * Math.sin(dlng / 2.0)));
  if (Math.floor(dist) <= DISTANCE_THRESHOLD_MILES) {
    return true;
  }
  return false;
}

/* Determines which places have most cases relative to whole database.
  Currently doesn't account for if place is close to userv*/
function getRank(id, sorted_counts_dict) {
  const report_dict = Object.keys(sorted_counts_dict);
  const rank = report_dict.indexOf(id);
  return rank + 1;
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


/** Export functions to allow Mocha and Chai testing. */
exports.isPlaceClose = isPlaceClose;
