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
/*
let nyt_data = {};
//date,county,state,fips,cases,deaths,confirmed_cases,confirmed_deaths,probable_cases,probable_deaths
function getCounties(){
  fetch('/getCountyData').then(response => response.text()).then((output) => {
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
          nyt_data[key] = {"date": date, "state": state, "fips": fips, "cases:": cases,
            "deaths": deaths, "confirmed_cases": confirmed_cases, "confirmed_deaths": confirmed_deaths, 
            "probable_cases": probable_cases, "probable_deaths": probable_deaths};
        }
      }
    }
    console.log(nyt_data);
  });
}
*/

/* Prints geolocation success to console */
function userLocationSuccess(latitude, longitude){
  user_lat = latitude; user_lng = longitude;
  map.setCenter({lat: latitude, lng: longitude});
  getFlags();
}

/* Prints geolocation failure to console */
function userLocationFail(error){ 
  //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  //window redirect to nyt heatmap in the future
  console.log("error")
}
 
window.onload = function(){
  localStorage.setItem("prev_page", "home");
  let time = new Date();
  if (time.getHours() >= SWITCH_HOUR) {
    document.body.style.backgroundColor = '#614051';
  }
  $.ajax({
    type : 'POST',
    data: '', 
    url: "https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCgozira2dGlwMHT_WgQpmg84fk3VhRglM", 
    success: function(result){
      userLocationSuccess(result.location.lat, result.location.lng);
    },
    error: function(error){
      userLocationFail(error);
    }}
  );
}
 