const apiKey = '91d861c4ddf3ff35468aa398e37d166e';
const newapiKey = '7dba7a93d20a47b4bf09026f9deace4e';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading-indicator');

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const location = searchInput.value.trim();
    if (location) {
        showLoadingIndicator(); 
        try {
            await getWeatherData(location);
        } catch (error) {
            console.error('Error:', error.message);
        }
        searchInput.value = '';
    } else {
        alert('Please enter a location');
    }
});

async function getWeatherData(location = 'Delft') {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        if (!response.ok && location) {
            console.error('Location not found');
            alert('Location not found');
            return;
        }
        const data = await response.json();
        displayCurrentWeather(data);
        const dailyForecastData = await getDailyForecast(data.coord.lat, data.coord.lon);
        displayDailyForecast(dailyForecastData);
        const hourlyForecastData = await getHourlyForecast(data.coord.lat, data.coord.lon);
        displayHourlyForecast(hourlyForecastData);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        hideLoadingIndicator(); 
    }
}

function displayCurrentWeather(data) {
    console.log(data);
    const { name, sys, main, weather, wind, rain, snow } = data;
    const locationElement = document.getElementById('location');
    const dateTimeElement = document.getElementById('date-time');
    const weatherIconElement = document.getElementById('weather-icon');
    const temperatureElement = document.getElementById('temperature');
    const conditionElement = document.getElementById('condition');
    const windElement = document.getElementById('wind');
    const precipitationElement = document.getElementById('precipitation');

    locationElement.textContent = `${name}, ${sys.country}`;
    dateTimeElement.textContent = getCurrentDateTime();
    weatherIconElement.src = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;
    temperatureElement.textContent = `${Math.round(main.temp)}°C`;
    conditionElement.textContent = weather[0].description;
    windElement.textContent = `${wind.speed} m/s`;

    if (rain && rain['1h']) {
        precipitationElement.textContent = `${rain['1h']} mm (Rain)`;
    } else if (snow && snow['1h']) {
        precipitationElement.textContent = `${snow['1h']} mm (Snow)`;
    } else {
        precipitationElement.textContent = 'N/A';
    }
}

async function getDailyForecast(latitude, longitude) {
    try {
        const response = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${newapiKey}`);
        if (!response.ok) {
            throw new Error('Failed to fetch daily forecast');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        return null;
    }
}

function displayDailyForecast(forecastData) {
    const forecastDaysContainer = document.querySelector('.forecast-days');
    forecastDaysContainer.innerHTML = '';
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date

    // Loop through the forecast data
    for (let i = 0; i < 6; i++) {
        const dayForecast = forecastData[i];
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        const dayNameElement = document.createElement('div');
        dayNameElement.classList.add('day-name');

        const dayTempElement = document.createElement('div');
        dayTempElement.classList.add('day-temp');

        const iconElement = document.createElement('img');
        iconElement.classList.add('day-icon');
        iconElement.alt = 'Weather icon';

        const nextDay = new Date(tomorrow);
        nextDay.setDate(tomorrow.getDate() + i);
        dayNameElement.textContent = getDayName(nextDay.getDay());
        dayTempElement.textContent = `${Math.round(dayForecast.temp)}°C`;
        iconElement.src = `https://www.weatherbit.io/static/img/icons/${dayForecast.weather.icon}.png`;
        dayElement.appendChild(dayNameElement);
        dayElement.appendChild(dayTempElement);
        dayElement.appendChild(iconElement);
        forecastDaysContainer.appendChild(dayElement);
    }
}

async function getHourlyForecast(latitude, longitude) {
    try {
        const response = await fetch(`https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&key=${newapiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('Failed to fetch hourly forecast');
        }
        const data = await response.json();
        return data.data.slice(0, 6); // Return hourly forecast data for the next 6 hours
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
        return null;
    }
}

function displayHourlyForecast(hourlyForecastData) {
    const hourlyForecastContainer = document.querySelector('.hourly-forecast-container');
    hourlyForecastContainer.innerHTML = '';

    hourlyForecastData.forEach(hourForecast => {
        const hourElement = document.createElement('div');
        hourElement.classList.add('hour');
        const timeElement = document.createElement('div');
        timeElement.classList.add('hour-time');
        const temperatureElement = document.createElement('div');
        temperatureElement.classList.add('hour-temperature');
        const iconElement = document.createElement('img');
        iconElement.classList.add('hour-icon');

        const hourDate = new Date(hourForecast.timestamp_local); // Using timestamp_local for local time
        const hour = hourDate.getHours();
        const minute = hourDate.getMinutes();
        timeElement.textContent = `${hour}:${minute < 10 ? '0' + minute : minute}`;
        temperatureElement.textContent = `${Math.round(hourForecast.temp)}°C`;
        iconElement.src = `https://www.weatherbit.io/static/img/icons/${hourForecast.weather.icon}.png`; 

        hourElement.appendChild(timeElement);
        hourElement.appendChild(temperatureElement);
        hourElement.appendChild(iconElement); 
        hourlyForecastContainer.appendChild(hourElement);
    });
}

function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

function getCurrentDateTime() {
    const now = new Date();
    const options = { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true };
    return now.toLocaleDateString('en-US', options);
}

function showLoadingIndicator() {
    loadingIndicator.style.display = 'block';
}

function hideLoadingIndicator() {
    loadingIndicator.style.display = 'none';
}

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                getWeatherData(); 
                hideLoadingIndicator(); 
            }
        );
    } else {
        getWeatherData(); 
        hideLoadingIndicator(); 
    }
});

async function getWeatherDataByCoords(latitude, longitude) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        displayCurrentWeather(data);
        const dailyForecastData = await getDailyForecast(latitude, longitude);
        displayDailyForecast(dailyForecastData);
        const hourlyForecastData = await getHourlyForecast(latitude, longitude);
        displayHourlyForecast(hourlyForecastData);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        hideLoadingIndicator(); 
    }
}