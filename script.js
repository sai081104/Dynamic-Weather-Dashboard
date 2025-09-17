// Note: The API_KEY constant has been completely removed from this file.
// All API calls are now made to the secure backend function.

document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const appContainer = document.getElementById('app-container');
    const loader = document.getElementById('loader');
    const weatherContent = document.getElementById('weather-content');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const currentTempEl = document.getElementById('current-temp');
    const currentIconEl = document.getElementById('current-icon');
    const currentDescEl = document.getElementById('current-desc');
    const todayHighEl = document.getElementById('today-high');
    const todayLowEl = document.getElementById('today-low');
    const windSpeedEl = document.getElementById('wind-speed');
    const windGustEl = document.getElementById('wind-gust');
    const windArrowEl = document.getElementById('wind-arrow');
    const sunriseTimeEl = document.getElementById('sunrise-time');
    const sunsetTimeEl = document.getElementById('sunset-time');
    const sunIconWrapperEl = document.getElementById('sun-icon-wrapper');
    const humidityEl = document.getElementById('humidity');
    const dewPointEl = document.getElementById('dew-point');
    const visibilityEl = document.getElementById('visibility');
    const visibilityDescEl = document.getElementById('visibility-desc');
    const pressureEl = document.getElementById('pressure');
    const aqiValueEl = document.getElementById('aqi-value');
    const aqiDescEl = document.getElementById('aqi-desc');
    const aqiFillEl = document.querySelector('.aqi-gauge .aqi-fill');
    const dailyForecastContainer = document.querySelector('.daily-forecast');
    const hourlyChartCanvas = document.getElementById('hourly-chart');

    let hourlyChart = null;

    /**
     * Fetches all weather data by calling our secure backend function.
     */
    async function fetchAndDisplayWeather(query) {
        showLoader();
        try {
            const apiUrl = `/.netlify/functions/weather?${query}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'City not found. Please try another.');
            }
            
            const { weather, forecast, airQuality } = data;
            updateUI(weather, forecast, airQuality);
            hideLoader();

        } catch (error) {
            alert(error.message);
            console.error('Error fetching weather data:', error);
            hideLoader(true);
        }
    }
    
    // --- All UI Update Functions are below this line ---

    function updateUI(weather, forecast, airQuality) {
        updateBackground(weather.weather[0], weather.sys);
        cityNameEl.textContent = weather.name;
        currentDateEl.textContent = new Date(weather.dt * 1000).toDateString();
        currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
        currentDescEl.textContent = weather.weather[0].description;
        currentIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        const todayForecast = getTodayForecast(forecast.list, weather.timezone);
        todayHighEl.textContent = Math.round(todayForecast.maxTemp);
        todayLowEl.textContent = Math.round(todayForecast.minTemp);
        windSpeedEl.textContent = (weather.wind.speed * 3.6).toFixed(1);
        windGustEl.textContent = weather.wind.gust ? (weather.wind.gust * 3.6).toFixed(1) : 'N/A';
        windArrowEl.style.transform = `rotate(${weather.wind.deg}deg)`;
        sunriseTimeEl.textContent = formatTime(weather.sys.sunrise, weather.timezone);
        sunsetTimeEl.textContent = formatTime(weather.sys.sunset, weather.timezone);
        updateSunPath(weather.sys.sunrise, weather.sys.sunset, weather.timezone);
        humidityEl.textContent = weather.main.humidity;
        dewPointEl.textContent = calculateDewPoint(weather.main.temp, weather.main.humidity);
        visibilityEl.textContent = (weather.visibility / 1000).toFixed(1);
        visibilityDescEl.textContent = getVisibilityDescription(weather.visibility);
        pressureEl.textContent = weather.main.pressure;
        const aqi = airQuality.list[0].main.aqi;
        aqiValueEl.textContent = aqi;
        updateAqiWidget(aqi);
        updateDailyForecast(forecast.list);
        createHourlyChart(forecast.list, weather.timezone);
    }
    
    function updateBackground(weatherData, sysData) {
        const code = weatherData.id;
        const now = Date.now() / 1000;
        const isNight = now < sysData.sunrise || now > sysData.sunset;
        appContainer.className = '';
        if (isNight) { appContainer.classList.add('bg-night'); return; }
        if (code >= 200 && code < 300) appContainer.classList.add('bg-stormy');
        else if (code >= 300 && code < 600) appContainer.classList.add('bg-rainy');
        else if (code >= 600 && code < 700) appContainer.classList.add('bg-snowy');
        else if (code >= 700 && code < 800) appContainer.classList.add('bg-misty');
        else if (code === 800) appContainer.classList.add('bg-sunny');
        else if (code > 800) appContainer.classList.add('bg-cloudy');
        else appContainer.classList.add('bg-default');
    }

    function updateAqiWidget(aqi) {
        let desc = '', color = '', rotation = 0;
        switch (aqi) {
            case 1: desc = 'Good'; color = 'var(--aqi-good)'; rotation = 18; break;
            case 2: desc = 'Fair'; color = 'var(--aqi-moderate)'; rotation = 54; break;
            case 3: desc = 'Moderate'; color = 'var(--aqi-unhealthy-sensitive)'; rotation = 90; break;
            case 4: desc = 'Poor'; color = 'var(--aqi-unhealthy)'; rotation = 126; break;
            case 5: desc = 'Very Poor'; color = 'var(--aqi-very-unhealthy)'; rotation = 162; break;
        }
        aqiDescEl.textContent = desc;
        aqiValueEl.style.color = color;
        if(aqiFillEl) aqiFillEl.style.transform = `rotate(${rotation}deg)`;
    }

    function updateSunPath(sunrise, sunset, timezone) {
        const nowUTC = Date.now();
        const localNow = new Date(nowUTC + timezone * 1000);
        const sunriseTime = new Date((sunrise * 1000) + timezone * 1000);
        const sunsetTime = new Date((sunset * 1000) + timezone * 1000);
        const totalDaylight = sunsetTime.getTime() - sunriseTime.getTime();
        const timeSinceSunrise = localNow.getTime() - sunriseTime.getTime();
        let percentage = (timeSinceSunrise / totalDaylight) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        const rotation = -90 + (percentage * 1.8);
        sunIconWrapperEl.style.transform = `rotate(${rotation}deg)`;
    }

    function updateDailyForecast(forecastList) {
        dailyForecastContainer.innerHTML = '';
        const dailyData = {};
        forecastList.forEach(entry => {
            const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
            if (!dailyData[date]) dailyData[date] = { temps: [], icons: [] };
            dailyData[date].temps.push(entry.main.temp);
            dailyData[date].icons.push(entry.weather[0].icon);
        });
        Object.keys(dailyData).slice(0, 5).forEach(date => {
            const dayInfo = dailyData[date];
            const card = document.createElement('div');
            card.className = 'daily-card';
            card.innerHTML = `<p>${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p><img src="https://openweathermap.org/img/wn/${dayInfo.icons[Math.floor(dayInfo.icons.length / 2)]}.png" alt="icon"><p class="temp">${Math.round(Math.max(...dayInfo.temps))}°/${Math.round(Math.min(...dayInfo.temps))}°</p>`;
            dailyForecastContainer.appendChild(card);
        });
    }

    function createHourlyChart(forecastList, timezone) {
        const next24Hours = forecastList.slice(0, 8);
        const labels = next24Hours.map(item => formatTime(item.dt, timezone));
        const tempData = next24Hours.map(item => item.main.temp);
        const rainData = next24Hours.map(item => (item.pop * 100).toFixed(0));
        const data = {
            labels,
            datasets: [{ label: 'Temp (°C)', data: tempData, borderColor: '#f9d71c', backgroundColor: 'rgba(249, 215, 28, 0.2)', yAxisID: 'y', fill: true, tension: 0.4, }, { label: 'Rain (%)', data: rainData, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.2)', yAxisID: 'y1', fill: true, tension: 0.4, }]
        };
        if (hourlyChart) hourlyChart.destroy();
        hourlyChart = new Chart(hourlyChartCanvas, {
            type: 'line', data,
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'white' }, grid: { display: false } }, y: { type: 'linear', position: 'left', ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y1: { type: 'linear', position: 'right', min: 0, max: 100, ticks: { color: 'white' }, grid: { display: false } } }, plugins: { legend: { labels: { color: 'white' } } } }
        });
    }

    function getTodayForecast(forecastList, timezone) {
        const today = new Date(new Date().getTime() + timezone * 1000).toISOString().split('T')[0];
        const temps = forecastList.filter(item => new Date((item.dt + timezone) * 1000).toISOString().startsWith(today)).map(item => item.main.temp);
        return { maxTemp: temps.length > 0 ? Math.max(...temps) : 'N/A', minTemp: temps.length > 0 ? Math.min(...temps) : 'N/A' };
    }

    function calculateDewPoint(temp, humidity) {
        const a = 17.27, b = 237.7;
        const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
        return `${((b * alpha) / (a - alpha)).toFixed(1)}°`;
    }

    function getVisibilityDescription(visibility) {
        if (visibility > 8000) return "Excellent"; if (visibility > 5000) return "Good"; if (visibility > 2000) return "Moderate"; return "Poor";
    }

    function formatTime(timestamp, timezone) {
        return new Date((timestamp + timezone) * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
    }
    
    function showLoader() { loader.style.display = 'block'; weatherContent.classList.add('hidden'); weatherContent.classList.remove('visible'); }
    function hideLoader(error = false) { loader.style.display = 'none'; if (!error) { weatherContent.classList.remove('hidden'); weatherContent.classList.add('visible'); } }
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = searchInput.value.trim();
        if (city) fetchAndDisplayWeather(`city=${city}`);
        searchInput.value = '';
    });

    function initialize() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchAndDisplayWeather(`lat=${latitude}&lon=${longitude}`); 
                },
                () => { fetchAndDisplayWeather('city=Pune'); }
            );
        } else {
            fetchAndDisplayWeather('city=Pune');
        }
    }

    initialize();
});

