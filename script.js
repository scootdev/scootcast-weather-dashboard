var cityList = [];
var city;
var result;

// Query the weather API
function citySearch(result, city) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + result.lat + "&lon=" + result.lng + "&units=imperial&appid=c527141d78b015be3cd3681e7bc25ea1",
        method: "GET"
    }).then(function (response) {
        console.log(response);
        displayResult(response, city);

    })
}

// Display the weather results
function displayResult(result, city) {
    $("#city").text(city + " (" + moment().format('l') + ")");
    var icon = $("<img src='https://openweathermap.org/img/wn/" + result.current.weather[0].icon + "@2x.png'>");
    $("#city").append(icon);
    $("#temp").text("Temperature: " + result.current.temp + " °F");
    $("#humidity").text("Humidity: " + result.current.humidity + "%");
    $("#wind").text("Wind Speed: " + result.current.wind_speed + " MPH");
    $("#uv").text("UV Index: " + result.current.uvi);
    if (cityList.indexOf(city) > -1) {
        $("#save-btn").text("Saved");
        $("#save-btn").removeClass("btn-secondary").addClass("btn-success");
        $("#save-btn").attr("data-saved", "true");
    } else {
        $("#save-btn").text("Save");
        $("#save-btn").removeClass("btn-success").addClass("btn-secondary");
        $("#save-btn").attr("data-saved", "false");
    }
    $("#save-btn").css("visibility", "visible");
}

// Convert address into coordinates for accurate results
function geocodeAddress(address) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDnRG3kLW44MTYI0s7fplt8aQMFvRe1glQ",
        method: "GET"
    }).then(function (response) {
        console.log(response);
        var result = response.results[0].geometry.location;
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?lat=" + result.lat + "&lon=" + result.lng + "&appid=c527141d78b015be3cd3681e7bc25ea1",
            method: "GET"
        }).then(function (response) {
            city = response.name;
            renderCityList();
            citySearch(result, city);
        })
    })
}

// Render the city list
function renderCityList() {
    list = $("#saved-searches");
    list.html("")
    if (localStorage.getItem("city-list")) {
        cityList = JSON.parse(localStorage.getItem("city-list"));
    }
    for (var i = 0; i < cityList.length; i++) {
        var listEl = $("<li class='list-group-item'></li>")
        var deleteBtn = $("<a class='delete-btn text-danger'><i class='fas fa-minus'></i></a>")
        listEl.text(cityList[i].name);
        listEl.append(deleteBtn);
        list.append(listEl);
    }
    // When delete button is pressed
    $(".delete-btn").on("click", function () {
        cityList.splice(cityList.indexOf(city));
        localStorage.setItem("city-list", JSON.stringify(cityList))
        // If this city is currently displayed, update the save button to reflect changes
        if ($(this).parent().text() === city) {
            $("#save-btn").text("Deleted").removeClass("btn-success").addClass("btn-danger").attr("data-saved", "false");
            setTimeout(function () {
                $("#save-btn").text("Save").removeClass("btn-danger").addClass("btn-secondary");
            }, 1000)
        }
        renderCityList();
    })
}

// Obtains device location coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var result = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/weather?lat=" + result.lat + "&lon=" + result.lng + "&appid=c527141d78b015be3cd3681e7bc25ea1",
                method: "GET"
            }).then(function (response) {
                city = response.name;
                renderCityList();
                citySearch(result, city);
            })
        });
    }
}

// Using Google Maps API to autocomplete the search bar
function initSearch() {
    var input = document.getElementById('search-bar');
    new google.maps.places.Autocomplete(input);
}
google.maps.event.addDomListener(window, 'load', initSearch);

// When the search button is pressed
$("#search-btn").on("click", function (e) {
    e.preventDefault();
    var location;
    geocodeAddress($("#search-bar").val());
});

// When the get location button is pressed
$("#location-btn").on("click", function () {
    getLocation();
})

// When the save city button is pressed
$("#save-btn").on("click", function () {
    if ($("#save-btn").attr("data-saved") === "false") {
        cityList.push({
            name: city,
            coords: result
        });
        localStorage.setItem("city-list", JSON.stringify(cityList))
        $("#save-btn").removeClass("btn-secondary").addClass("btn-success").text("Saved").attr("data-saved", "true");
        renderCityList();
    } else {
        cityList.splice(cityList.indexOf(city));
        localStorage.setItem("city-list", JSON.stringify(cityList))
        renderCityList();
        $("#save-btn").text("Deleted").attr("data-saved", "false");
        setTimeout(function () {
            $("#save-btn").text("Save").removeClass("btn-danger").addClass("btn-secondary");
        }, 1000)
    }
})

$("#save-btn").hover(
    function () {
        if ($("#save-btn").attr("data-saved") === "false") {
            $("#save-btn").removeClass("btn-secondary").addClass("btn-success");
        } else {
            $("#save-btn").removeClass("btn-success").addClass("btn-danger");
            $("#save-btn").text("Delete")
        }
    }, function () {
        if ($("#save-btn").attr("data-saved") === "false") {
            $("#save-btn").removeClass("btn-success").addClass("btn-secondary");
        } else {
            $("#save-btn").removeClass("btn-danger").addClass("btn-success");
            $("#save-btn").text("Saved")
        }
    }
);

// render saved searches on page load
renderCityList();