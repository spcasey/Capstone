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

var mapStyle = [{
    'stylers': [{'visibility': 'off'}]
  }, {
    'featureType': 'landscape',
    'elementType': 'geometry',
    'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
  }, {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [{'visibility': 'on'}, {'color': '#bfd4ff'}]
}];
      
var map;
var min = Number.MAX_VALUE; 
var max = -Number.MAX_VALUE;

/* Generates map visualization and choropleth layer. */
function initMap() {
  // Load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.0902, lng: -95.7129},
    zoom: 4,
    styles: mapStyle
  });

  // Set up the style rules and events for google.maps.data
  map.data.setStyle(styleFeature);
  map.data.addListener('mouseover', mouseInToRegion);
  map.data.addListener('mouseout', mouseOutOfRegion);

  // Wire up the button
  var selectBox = document.getElementById('data-variable');
  google.maps.event.addDomListener(selectBox, 'change', function() {
    clearData();
    loadData(selectBox.options[selectBox.selectedIndex].value);
  });

  // Load state polygons (only necessary once)
  loadMapShapes();
}

/* Loads the state boundary polygons from a GeoJSON source. */
function loadMapShapes() {
  // Load US state outline polygons from a GeoJson file
  map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/states.js', { idPropertyName: 'STATE' });

  // Wait for the request to complete by listening for the first feature to be added
  google.maps.event.addListenerOnce(map.data, 'addfeature', function() {
    google.maps.event.trigger(document.getElementById('data-variable'),'change');
  });
}

/* Generic data reading function for Michael(?) to edit */
function loadData(variable) {
  // Load the requested variable (using local copies)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', variable + '.json');
  xhr.onload = function() {
    var data = JSON.parse(xhr.responseText);
    data.shift(); 
    data.forEach(function(row) {
      var input = parseFloat(row[0]);
      var stateId = row[1];

      // Keep track of min and max values
      if (input < min) {
        min = input;
      }
    
      if (input > max) {
        max = input;
      }

      // Update the existing row with the new data
      map.data.getFeatureById(stateId).setProperty('input_variable', input);
    });

    // Update and display the legend
    document.getElementById('data-min').textContent = min.toLocaleString();
    document.getElementById('data-max').textContent = max.toLocaleString();
  };

  xhr.send();
}

/* Removes data from each shape on the map and resets the UI. */
function clearData() {
  min = Number.MAX_VALUE;
  max = -Number.MAX_VALUE;
  map.data.forEach(function(row) {
    row.setProperty('input_variable', undefined);
  });
  
  document.getElementById('data-box').style.display = 'none';
  document.getElementById('data-caret').style.display = 'none';
}

/* 
 * Applies a gradient style based on the input column. This is the 
 * callback passed to data.setStyle() and is called for each row in the data set. 
 * Check out the docs for Data.StylingFunction.
 */
function styleFeature(feature) {
  var low = [5, 69, 54];  // color of smallest datum
  var high = [151, 83, 34];   // color of largest datum

  // Variable represents where the value sits between the min and max
  var delta = (feature.getProperty('input_variable') - min) / (max - min);

  var color = [];
  for (var i = 0; i < 3; i++) {
    // Calculate an integer color based on the delta
    color[i] = (high[i] - low[i]) * delta + low[i];
  }

  // Determine whether to show this shape or not
  var showRow = true;
  if (feature.getProperty('input_variable') == null ||
    isNaN(feature.getProperty('input_variable'))) {
    showRow = false;
  }

  var outlineWeight = 0.5, zIndex = 1;
  if (feature.getProperty('state') === 'hover') {
    outlineWeight = zIndex = 2;
  }

  return {
    strokeWeight: outlineWeight,
    strokeColor: '#fff',
    zIndex: zIndex,
    fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
    fillOpacity: 0.75,
    visible: showRow
  };
}

/* Responds to the mouse-in event on a map shape (state). */
function mouseInToRegion(e) {
  // Set the hover state so the setStyle function can change the border
  e.feature.setProperty('state', 'hover');

  var percent = (e.feature.getProperty('input_variable') - min) / (max - min) * 100;

  // Update the label
  document.getElementById('data-label').textContent = e.feature.getProperty('NAME');
  document.getElementById('data-value').textContent = e.feature.getProperty('input_variable').toLocaleString();
  document.getElementById('data-box').style.display = 'block';
  document.getElementById('data-caret').style.display = 'block';
  document.getElementById('data-caret').style.paddingLeft = percent + '%';
}

/* Responds to the mouse-out event on a map shape (state). */
function mouseOutOfRegion(e) {
  // Reset the hover state, returning the border to normal
  e.feature.setProperty('state', 'normal');
}