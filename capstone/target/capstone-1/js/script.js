function getPlaces(lat, lng){
  let link = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='
    + lat + ',' + lng + '&radius=1500&key=AIzaSyCSJM0W_0euFa0j7g5BKJuE-4Xav62rVsE';
  /*fetch(link).then(response => response.text()).then((places) => {
    let places_list = JSON.parse(places);
    console.log(places_list);
  });*/
  let request = new Request(link);
  fetch(request, {mode: 'no-cors'})
  .then(response => response.text()).then((places) => {
    console.log(places)
    //let places_list = JSON.parse(places);
    //console.log(places_list);
  }).catch(function(error) {  
    console.log('Request failed', error) ;
  });
}
let lat = -33.8670522;
let lng = 151.1957362;
let establishments = [];
console.log("Hello");
getPlaces(lat, lng);