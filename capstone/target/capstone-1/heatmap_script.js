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

/* Switches heatmap on and off. */
function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

/* Builds color coding for heatmap. */
function changeGradient() {
  const gradient = [
    "rgba(0, 255, 255, 0)",
    "rgba(0, 255, 255, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(0, 127, 255, 1)",
    "rgba(0, 63, 255, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(0, 0, 223, 1)",
    "rgba(0, 0, 191, 1)",
    "rgba(0, 0, 159, 1)",
    "rgba(0, 0, 127, 1)",
    "rgba(63, 0, 91, 1)",
    "rgba(127, 0, 63, 1)",
    "rgba(191, 0, 31, 1)",
    "rgba(255, 0, 0, 1)"
  ];
  heatmap.set("gradient", heatmap.get("gradient") ? null : gradient);
}

/* Sets pixel radius of heatmap components. */
function changeRadius() {
  heatmap.set("radius", heatmap.get("radius") ? null : 60);
}

/* Sets opacity of heatmap components. */
function changeOpacity() {
  heatmap.set("opacity", heatmap.get("opacity") ? null : 0.2);
}

/* Returns dataset for heatmap. The more data points there are in an area, 
  the darker the gradient in that area will be. */
/*dataset for heatmap. The more data points the more likely it will appear*/
function getPoints() { 
  //for when we want to add weighting to verified users: {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
  return heatmap_data_users; //from datastore, rather than nyt
}