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

/* Generates map for data visualization */
function generateDataVizMap() {
  map = new google.maps.Map(document.getElementById("dataVizMap"), {
    center: { lat: 0, lng: 0 },
    zoom: 2.5
  });
}