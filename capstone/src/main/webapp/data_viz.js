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
  'Oklahoma','Oregon','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee',
  'Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

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
    getCounties(selectBox.options[selectBox.selectedIndex].value); //"cases", "deaths"
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

  let min = localStorage.getItem("min");
  let max = localStorage.getItem("max");

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
  
  let min = localStorage.getItem("min");
  let max = localStorage.getItem("max"); 

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

/* get County data from NYT in the form of a dictionary to put on the graph*/
//date,county,state,fips,cases,deaths,confirmed_cases,confirmed_deaths,probable_cases,probable_deaths
function getCounties(variable){
  fetch('/getCountyData').then(response => response.text()).then((output) => {
    let nyt_data = {};
    let nyt_data_by_state = {};
    let state_names = [];

    let data_lines = JSON.parse(output);
    for(let i = 0; i < data_lines.length; i++){
      if(data_lines[i] !== null){
        let parsed_data = data_lines[i].split(',');
        if(parsed_data.length === 10){
          let date = parsed_data[0];
          let county = parsed_data[1];
          let state = parsed_data[2];
          let fips = parsed_data[3];
          let cases = parsed_data[4];
          let deaths = parsed_data[5];
          let confirmed_cases = parsed_data[6];
          let confirmed_deaths = parsed_data[7];
          let probable_cases = parsed_data[8];
          let probable_deaths = parsed_data[9];
          let key = county + '-' + fips;
          //note that there may be blank '' attributes
          let county_data = {"date": date, "state": state, "fips": fips, "cases": cases,
            "deaths": deaths, "confirmed_cases": confirmed_cases, "confirmed_deaths": confirmed_deaths, 
            "probable_cases": probable_cases, "probable_deaths": probable_deaths};
          nyt_data[key] = county_data;
          county_data["county"] = county;
          county_data["fips"] = fips;
          if(nyt_data_by_state[state] !== undefined){
            nyt_data_by_state[state].push(county_data);  
          }else{
            state_names.push(state);
            nyt_data_by_state[state] = [county_data];
          }
        }
      }
    }

    let state_counts = {};
    if(variable === "cases"){
      state_counts = setStateWideCases(state_names, nyt_data_by_state);
    }
    if(variable === "deaths"){
      state_counts = setStateWideDeaths(state_names, nyt_data_by_state);
    }
    setData(state_counts);
    let range = findMinMax(state_names, state_counts);
    localStorage.setItem("min", range.min);
    localStorage.setItem("max", range.max);
    document.getElementById('data-min').textContent = range.min.toLocaleString();
    document.getElementById('data-max').textContent = range.max.toLocaleString();
  });
}

/* finds the min and max case or death counts for the legend */
function findMinMax(state_names, state_counts){
  let min = Number.MAX_VALUE;
  let max = -Number.MAX_VALUE;
  for(let i = 0; i < state_names.length; i++){
    if(STATES_DISPLAYED.indexOf(state_names[i]) > -1){
      let count = state_counts[state_names[i]];
      if(min > count){
        min = count;
      }
      if(max < count){
        max = count;
      }
    }
  }
  return {"min": min, "max": max};
}

/* load data for graph */
function setData(state_counts){
  map.data.forEach(function(row) {
    row.setProperty('input_variable', state_counts[row.j.NAME]);
  });
}

/* sum the data for the each of the counties in the state to estimate statewide death count */
function totalDeathsState(state, counties){
  let death_count = 0;
  for(let i = 0; i < counties.length; i++){
    let deaths = parseInt(counties[i].deaths);
    if(deaths !== NaN){
      death_count += deaths;
    }
  }
  return death_count;
}

/* sum the data for the each of the counties in the state to estimate statewide case count */
function totalCasesState(state, counties){
  let cases_count = 0;
  for(let i = 0; i < counties.length; i++){
    let cases = parseInt(counties[i].cases);
    if(cases !== NaN){
      cases_count += cases;
    }
  }
  return cases_count;
}

/* form an array of case counts for the state */
function setStateWideCases(state_names, nyt_data_by_state){
  let state_case_counts = {};
  for(let i = 0; i < state_names.length; i++){
    let counties = nyt_data_by_state[state_names[i]];
    let state_cases = totalCasesState(state_names[i], counties);
    state_case_counts[state_names[i]] = state_cases;
  }
  return state_case_counts;
}

/* form an array of death counts for the state */
function setStateWideDeaths(state_names, nyt_data_by_state){
  let state_death_counts = {};
  for(let i = 0; i < state_names.length; i++){
    let counties = nyt_data_by_state[state_names[i]];
    let state_deaths = totalDeathsState(state_names[i], counties);
    state_death_counts[state_names[i]] = state_deaths;     
  }
  return state_death_counts;
}