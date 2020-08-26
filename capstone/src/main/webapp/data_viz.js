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
const SWITCH_HOUR = 18; //6:00 pm
const US_LAT = 37.0902;
const US_LNG = -95.7129;
const STATES_DISPLAYED = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana',
  'Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee',
  'Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

// Populations data is from https://www.infoplease.com/us/states/state-population-by-rank
const STATE_POPULATIONS = {'California': 39512223, 'Texas': 28995881, 'Florida': 21477737, 
  'New York': 19453561, 'Illinois': 12671821, 'Pennsylvania': 12801989, 'Ohio': 11689100, 
  'Georgia': 10617423, 'North Carolina': 10488084, 'Michigan': 9986857, 'New Jersey': 8882190, 
  'Virginia': 8535519,'Washington':7614893, 'Arizona': 7278717, 'Massachusetts': 6949503, 
  'Tennessee': 6833174, 'Indiana': 6732219, 'Missouri': 6137428, 'Maryland': 6045680, 
  'Wisconsin': 5822434, 'Colorado': 5758736, 'Minnesota': 5639632, 'South Carolina': 5148714, 
  'Alabama': 4903185, 'Louisiana': 4648794, 'Kentucky': 4467673, 'Oregon': 4217737, 
  'Oklahoma': 3956971, 'Connecticut': 3565287, 'Utah': 3205958, 'Iowa': 3155070, 
  'Nevada': 3080156, 'Arkansas': 3017825, 'Mississippi': 2976149, 'Kansas': 2913314, 
  'New Mexico': 2096829, 'Nebraska': 1934408, 'West Virginia': 1792147, 'Idaho': 1787065, 
  'Hawaii': 1415872, 'New Hampshire': 1359711, 'Maine': 1344212, 'Montana': 1068778, 
  'Rhode Island': 1059361, 'Delaware': 973764, 'South Dakota': 884659, 'North Dakota': 762062, 
  'Alaska': 731545, 'District of Columbia': 705749, 'Vermont': 623989, 'Wyoming': 578759};


let map;
/* Generates map visualization and choropleth layer. */
function initMap() {
  let land_color = '#fcfcfc';
  let water_color = '#bfd4ff';
  
  let time = new Date();
  if(time.getHours() >= SWITCH_HOUR){ 
    land_color = '#023e58';
    water_color = '#0e1626';
    document.getElementById('top_nav').className = 'navbar navbar-expand-md navbar-dark bg-dark sticky-top';
    document.getElementById('logo').src = 'images/logo.png';
    document.body.style.backgroundColor = '#614051';
    document.body.style.color = '#fff';
  }

  let mapStyle = [{
    'stylers': [{'visibility': 'off'}]
  }, {
    'featureType': 'landscape',
    'elementType': 'geometry',
    'stylers': [{'visibility': 'on'}, {'color': land_color}]
  }, {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [{'visibility': 'on'}, {'color': water_color}]
  }];

  // Load the map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: US_LAT, lng: US_LNG},
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
    getCounties(selectBox.options[selectBox.selectedIndex].value); 
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

/* Removes data from each shape on the map and resets the UI. */
function clearData() {
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
  var low = [78, 76, 44];  // color of smallest datum
  var high = [2, 69, 54];   // color of largest datum

  let min = localStorage.getItem('min');
  let max = localStorage.getItem('max');

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
  
  let min = localStorage.getItem('min');
  let max = localStorage.getItem('max'); 

  var percent = (e.feature.getProperty('input_variable') - min) / (max - min) * 100;

  // Update the label
  document.getElementById('data-label').textContent = e.feature.getProperty('NAME');
  document.getElementById('data-value').textContent = e.feature.getProperty('input_variable');
  document.getElementById('data-box').style.display = 'block';
  document.getElementById('data-caret').style.display = 'block';
  document.getElementById('data-caret').style.paddingLeft = percent + '%';
}

/* Responds to the mouse-out event on a map shape (state). */
function mouseOutOfRegion(e) {
  // Reset the hover state, returning the border to normal
  e.feature.setProperty('state', 'normal');
}

/* get County data from NYT in the form of a dictionary to put on the graph*/
function getCounties(variable){
  fetch('/getCountyData').then(response => response.text()).then((output) => {
    let nyt_data_by_state = {};
    let state_names = [];
    let nyt_data = JSON.parse(output);
    if(!('error' in nyt_data)){
      Object.keys(nyt_data).forEach(function(county_id) {
        let county_data = nyt_data[county_id];
        let state_name = county_data.state;
        if(nyt_data_by_state[state_name] !== undefined){
          nyt_data_by_state[state_name].push(county_data);  
        }else{
          if(STATES_DISPLAYED.indexOf(state_name) > -1){
            state_names.push(state_name);
            nyt_data_by_state[state_name] = [county_data];
          }
        }
      });
    }else{
      window.location.href = 'home.html';
    }

    let state_counts = {};
    if(variable === 'cases'){
      state_counts = JSON.parse(storeCaseCounts(state_names, nyt_data_by_state, false));
    }
    if(variable === 'deaths'){
      state_counts = JSON.parse(storeDeathCounts(state_names, nyt_data_by_state, false));
    }
    if(variable === 'cases_per_capita'){
      state_counts = JSON.parse(storeCaseCounts(state_names, nyt_data_by_state, true));
    }
    if(variable === 'deaths_per_capita'){
      state_counts = JSON.parse(storeDeathCounts(state_names, nyt_data_by_state, true));
    }

    setData(state_counts.dictionary);

    let max_count = Math.max.apply(null, state_counts.values);
    let min_count = Math.min.apply(null, state_counts.values);

    localStorage.setItem('min', min_count);
    localStorage.setItem('max', max_count);
    document.getElementById('data-min').textContent = min_count.toLocaleString();
    document.getElementById('data-max').textContent = max_count.toLocaleString();
  });
}

/* load data for graph */
function setData(state_counts){
  map.data.forEach(function(row) {
    row.setProperty('input_variable', state_counts[row.j.NAME]);
  });
}

/* sum the data for the each of the counties in the state to estimate statewide death count */
function getTotalDeathsByUsaState(state, counties){
  let death_count = 0;
  for(let i = 0; i < counties.length; i++){
    let deaths = parseInt(counties[i].deaths);
    if(!isNaN(deaths) && deaths !== undefined){
      death_count += deaths;
    }
  }
  return death_count;
}

/* sum the data for the each of the counties in the state to estimate statewide case count */
function getTotalCasesByUsaState(state, counties){
  let cases_count = 0;
  for(let i = 0; i < counties.length; i++){
    let cases = parseInt(counties[i].cases);
    if(!isNaN(cases) && cases !== undefined){
      cases_count += cases;
    }
  }
  return cases_count;
}

/* form an array of case counts for each US state + DC */
function storeCaseCounts(state_names, nyt_data_by_state, is_per_capita){
  let state_case_counts = {};
  let state_case_count_values = [];
  for(let i = 0; i < state_names.length; i++){
    let state_name = state_names[i];
    let counties = nyt_data_by_state[state_name];
    let state_cases = getTotalCasesByUsaState(state_name, counties);
    if(is_per_capita){
      state_cases = calculatePerCapita(state_name, state_cases);
    }
    state_case_counts[state_name] = state_cases;
    state_case_count_values.push(state_cases);
  }
  return '{"dictionary": ' + JSON.stringify(state_case_counts) + 
    ', "values":' + JSON.stringify(state_case_count_values) + '}';
}

/* form an array of death counts for each US state + DC */
function storeDeathCounts(state_names, nyt_data_by_state, is_per_capita){ 
  let state_death_counts = {};
  let state_death_count_values = [];
  for(let i = 0; i < state_names.length; i++){
    let state_name = state_names[i];
    let counties = nyt_data_by_state[state_name];
    let state_deaths = getTotalDeathsByUsaState(state_name, counties);
    if(is_per_capita){
      state_deaths = calculatePerCapita(state_name, state_deaths);
    }
    state_death_counts[state_name] = state_deaths;     
    state_death_count_values.push(state_deaths);
  }
  return '{"dictionary": ' + JSON.stringify(state_death_counts) + 
    ', "values":' + JSON.stringify(state_death_count_values) + '}';
}

/* calculates cases or deaths per 100,000 people. */
function calculatePerCapita(state_name, state_total){
  return Math.round(state_total / STATE_POPULATIONS[state_name] * 100000);
}
