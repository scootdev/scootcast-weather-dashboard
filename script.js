var cityList = [];
var results;

function citySearch(result) {
    $.ajax({
        url: "api.openweathermap.org/data/2.5/weather?lat=" + result.lat + "&lon=" + result.lng + "&appid=c527141d78b015be3cd3681e7bc25ea1",
        method: "GET"
    }).then(function (response) {
        console.log(response);
    })
}

// Convert address into coordinates for accurate results
function geocodeAddress(address) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDnRG3kLW44MTYI0s7fplt8aQMFvRe1glQ",
        method: "GET"
    }).then(function (response) {
        result = response.results[0].geometry.location;
        citySearch(result);
    })
}

// Using Google Maps API to autocomplete the search bar
function initSearch() {
    var input = document.getElementById('search-bar');
    new google.maps.places.Autocomplete(input);
}
google.maps.event.addDomListener(window, 'load', initSearch);

// When the search button is pressed
$("#search-btn").on("click", function(e) {
    e.preventDefault();
    var location;
    geocodeAddress($("#search-bar").val());
    
})