var cityList = [];
var lastSearched;
var city;
var result;
var date = {
    "day1": moment().format("l"),
    "day2": moment().add(1, "d").format("l"),
    "day3": moment().add(2, "d").format("l"),
    "day4": moment().add(3, "d").format("l"),
    "day5": moment().add(4, "d").format("l"),
    "day6": moment().add(5, "d").format("l"),
}

// Query the weather API
function citySearch(result, city) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + result.lat + "&lon=" + result.lng + "&units=imperial&appid=c527141d78b015be3cd3681e7bc25ea1",
        method: "GET"
    }).then(function (response) {
        displayResult(response, city);

    })
}

// Display the weather results
function displayResult(result, city) {
    $("#dashboard").css("visibility", "visible")
    // display current weather
    $("#city").text(city + " (" + date.day1 + ")");
    var icon = $("<img src='https://openweathermap.org/img/wn/" + result.current.weather[0].icon + "@2x.png'>");
    $("#city").append(icon);
    $("#temp").text("Temperature: " + result.current.temp + " °F");
    $("#humidity").text("Humidity: " + result.current.humidity + "%");
    $("#wind").text("Wind Speed: " + result.current.wind_speed + " MPH");
    // determine color of uv index
    if (result.current.uvi > 8) {
        $("#uv").html("<p>UV Index: <span class='badge badge-danger p-2'>" + result.current.uvi + "</span></p>");
    }
    else if (result.current.uvi > 3 && result.current.uvi < 8) {
        $("#uv").html("<p>UV Index: <span class='badge badge-warning p-2'>" + result.current.uvi + "</span></p>");
    }
    else {
        $("#uv").html("<p>UV Index: <span class='badge badge-success p-2'>" + result.current.uvi + "</span></p>");
    }
    $("#save-btn").text("Save");
    $("#save-btn").removeClass("btn-success").addClass("btn-secondary");
    $("#save-btn").attr("data-saved", "false");
    for (var i = 0; i < cityList.length; i++) {
        var cityName = cityList[i].name;
        if (cityName === city) {
            $("#save-btn").text("Saved");
            $("#save-btn").removeClass("btn-secondary").addClass("btn-success");
            $("#save-btn").attr("data-saved", "true");
        }
    }
    $("#save-btn").css("visibility", "visible");
    // display 5 day forecast
    $("#five-day").html("")
    for (var i = 1; i < 6; i++) {
        var card = $("<div class='card mr-2 text-center'></div>")
        var cardBody = $("<div class='card-body'></div>")
        var cardDate = date["day" + [i + 1]];
        var cardTitle = $("<h5 class='card-title'>" + cardDate + "</h5>")
        var cardIcon = $("<img src='https://openweathermap.org/img/wn/" + result.daily[i].weather[0].icon + ".png'>")
        var cardTemp = $("<p>Temp: " + result.daily[i].temp.day + " °F</p>")
        var cardHum = $("<p>Humidity: " + result.daily[i].humidity + "%</p>")
        cardBody.append(cardTitle, cardIcon, cardTemp, cardHum);
        card.append(cardBody)
        $("#five-day").append(card);
    }
}

// Convert address into coordinates for accurate results
function geocodeAddress(address) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyDnRG3kLW44MTYI0s7fplt8aQMFvRe1glQ",
        method: "GET"
    }).then(function (response) {
        console.log(response);
        result = response.results[0].geometry.location;
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?lat=" + result.lat + "&lon=" + result.lng + "&appid=c527141d78b015be3cd3681e7bc25ea1",
            method: "GET"
        }).then(function (response) {
            city = response.name;
            renderCityList();
            lastSearched = {
                "name": city,
                "coords": result
            }
            localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
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
        var listEl = $("<li data-index='" + i + "' class='list-group-item'></li>")
        var deleteBtn = $("<a class='delete-btn text-danger'><i class='fas fa-minus'></i></a>")
        listEl.text(cityList[i].name);
        listEl.append(deleteBtn);
        list.append(listEl);
    }
    // When delete button is pressed
    $(".delete-btn").on("click", function () {
        cityList.splice($(this).parent().attr("data-index"), 1)
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
    // When a saved city is pressed
    $("#saved-searches li").on("click", function () {
        var savedCity = $(this).text();
        var index = $(this).attr("data-index");
        var coords = cityList[index].coords;
        citySearch(coords, savedCity);
    })
}

// Obtains device location coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            result = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }
            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/weather?lat=" + result.lat + "&lon=" + result.lng + "&appid=c527141d78b015be3cd3681e7bc25ea1",
                method: "GET"
            }).then(function (response) {
                city = response.name;
                renderCityList();
                lastSearched = {
                    "name": city,
                    "coords": result
                }
                localStorage.setItem("lastSearched", JSON.stringify(lastSearched));
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

function renderLastSearched() {
    if (localStorage.getItem("lastSearched")) {
        lastSearched = JSON.parse(localStorage.getItem("lastSearched"))
        city = lastSearched.name;
        coords = lastSearched.coords;
        citySearch(coords, city);
    }
}

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

// When the save button is pressed
$("#save-btn").on("click", function () {
    if ($("#save-btn").attr("data-saved") === "false") {
        cityList.push({
            "name": city,
            "coords": result
        })
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

// When mouse hovers over save button
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
renderLastSearched();