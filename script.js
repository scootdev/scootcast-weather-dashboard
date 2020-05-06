var cityList = [];

function citySearch(result, city) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + result.lat + "&lon=" + result.lng + "&units=imperial&appid=c527141d78b015be3cd3681e7bc25ea1",
        method: "GET"
    }).then(function (response) {
        console.log(response);
        displayResult(response, city);

    })
}

function displayResult(result, city) {
    $("#city").text(city + " (" + moment().format('l') + ")");
    var icon = $("<img src='https://openweathermap.org/img/wn/" + result.current.weather[0].icon + "@2x.png'>")
    $("#city").append(icon);
    $("#temp").text("Temperature: " + result.current.temp + " °F");
    $("#humidity").text("Humidity: " + result.current.humidity + "%");
    $("#wind").text("Wind Speed: " + result.current.wind_speed + " MPH");
    $("#uv").text("UV Index: " + result.current.humidity + "%");

}

// Convert address into coordinates for accurate results
function geocodeAddress(address) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDnRG3kLW44MTYI0s7fplt8aQMFvRe1glQ",
        method: "GET"
    }).then(function (response) {
        console.log(response);
        var city = response.results[0].formatted_address;
        var result = response.results[0].geometry.location;
        cityList.push(city);
        
        renderCityList();
        citySearch(result, city);
    })
}

function renderCityList() {
    list = $("#saved-searches");
    list.html("")
    for (var i = 0; i < cityList.length; i++) {
        var listEl = $("<li class='list-group-item'></li>")
        listEl.text(cityList[i]);
        list.append(listEl);
    }
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