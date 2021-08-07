let temp = 0;

$(document).ready(function() {
  $('#fahrenheit').click(function () {
    $(this).css("color", "white");
    $('#celsius').css("color", "#b0bec5");
    $('#temperature').html(Math.round(temp * 1.8 + 32));
  });

  $('#celsius').click(function () {
    $(this).css("color", "white");
    $('#fahrenheit').css("color", "#b0bec5");
    $('#temperature').html(Math.round(temp));
  });

  init();

  setTimeout(function()
  {
    init();
  }, 3000);

  setInterval(function ()
      {
        setTime();
      }, 1000
  );

  setInterval(function ()
      {
        setAQI();
        getWeather();
      }, 300000
  );
});

function init()
{
  setAQI();
  setTime();
  getWeather();

  $('#fahrenheit').click();
}

function setAQI()
{
  $.getJSON("https://api.waqi.info/feed/grants%20pass/?token=14a9d611a3e0a2ca8e55a44d73fa5541970a3020", function(json)
  {
    $('.aqi').html(JSON.stringify(json.data.aqi));
  });
}

function setTime()
{
  var dt = new Date()
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  $('#day').html(days[dt.getDay()]);
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  $('#date').html(months[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear());
  $('#time').html((dt.getHours()>12?(dt.getHours()-12):dt.getHours()).toString() + ":" + ((dt.getMinutes() < 10 ? '0' : '').toString() + dt.getMinutes().toString()) + (dt.getHours() < 12 ? ' AM' : ' PM').toString());
}

function getWeather()
{
  $.getJSON("https://api.openweathermap.org/data/2.5/weather?q=Grants%20Pass,OR,US&id=524901&appid=219c82f6b6664bb3868e2269127eefb6", function(json) {
    $('#city').html(json.name + ", " + json.sys.country);
    $('#weather-status').html(json.weather[0].main + " / " + json.weather[0].description);

    switch (json.weather[0].main) {
      case "Clouds":
        $('.weather-icon').attr("src","img/011-cloudy.svg");
        break;
      case "Clear":
        $('.weather-icon').attr("src","img/039-sun.svg");
        break;
      case "Thunderstorm":
        $('.weather-icon').attr("src","img/045-thunder.svg");
        break;
      case "Drizzle":
        $('.weather-icon').attr("src","img/034-cloudy-1.svg");
        break;
      case "Rain":
        $('.weather-icon').attr("src","img/003-rainy.svg");
        break;
      case "Snow":
        $('.weather-icon').attr("src","img/031-snowflake.svg");
        break;
      case "Haze":
        $('.weather-icon').attr("src","img/017-foog.svg");
        break;
      case "Extreme":
        $('.weather-icon').attr("src","img/033-hurricane.svg");
        break;
    }
    temp = (json.main.temp -273);
    $('#temperature').html(Math.round(temp));
    $('.windspeed').html(json.wind.speed + " Km/h")
    $('.humidity').html(json.main.humidity + " %");
    $('.pressure').html(json.main.pressure + " hPa");
    var sunriseUTC = json.sys.sunrise * 1000;
    var sunsetUTC = json.sys.sunset * 1000;
    var sunriseDt = new Date(sunriseUTC);
    var sunsetDt = new Date (sunsetUTC);
    $('.sunrise-time').html((sunriseDt.getHours()>12?(sunriseDt.getHours()-12):sunriseDt.getHours()).toString() + ":" + ((sunriseDt.getMinutes() < 10 ? '0' : '').toString() + sunriseDt.getMinutes().toString()) + (sunriseDt.getHours() < 12 ? ' AM' : ' PM').toString());
    $('.sunset-time').html((sunsetDt.getHours()>12?(sunsetDt.getHours()-12):sunsetDt.getHours()).toString() + ":" + ((sunsetDt.getMinutes() < 10 ? '0' : '').toString() + sunsetDt.getMinutes().toString()) + (sunsetDt.getHours() < 12 ? ' AM' : ' PM').toString());
    $('#fahrenheit').click();
  });
}