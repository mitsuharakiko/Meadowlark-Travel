exports.getWeatherData = function(){
    return{
        locations:[
            {
                name: "Portland",
                forecastUrl: "http://wunderground.com/US/OR/Portland.html",
                iconUrl: "http://icons-ak.wxug.com/i/c/k/cloudy.gif",
                weather: "Overcast",
                temp: "54.1 F (12.3 C)"
            },
            {
                name: "Bend",
                forecastUrl: "http://wunderground.com/US/OR/Bend.html",
                iconUrl: "http://icons-ak.wxug.com/i/c/k/cloudy.gif",
                weather: "Partly Cloudy",
                temp: "55.0 F (12.8 C)"
            },
            {
                name: "Manzanita",
                forecastUrl: "http://wunderground.com/US/OR/Manzanita.html",
                iconUrl: "http://icons-ak.wxug.com/i/c/k/cloudy.gif",
                weather: "Light Rain",
                temp: "55.1 F (12.6 C)"
            }
        ]
    };
};