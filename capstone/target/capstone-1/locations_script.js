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

/* Prints geolocation success to console */
function userLocationSuccess(latitude, longitude){
  user_lat = latitude; user_lng = longitude;
  map.setCenter({lat: latitude, lng: longitude});
  getFlags();
}

/* Prints geolocation failure to console */
function userLocationFail(error){ 
  //callback function needs a geolocationerror as a singular arg, hence why it just calls the fallback function
  window.location.href = 'trends.html';
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
 