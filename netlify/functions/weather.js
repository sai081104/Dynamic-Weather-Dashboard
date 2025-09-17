// This code runs on a server (like Netlify's) and securely handles your API key.

// 'node-fetch' is required because the default 'fetch' is not available in this server environment.
// Make sure to run 'npm install node-fetch' in your project.
const fetch = require('node-fetch');

exports.handler = async function (event) {
    // Get the city or coordinates from the frontend's request (e.g., /weather?city=London)
    const { city, lat, lon } = event.queryStringParameters;

    // Your API key is stored securely as an "environment variable" on the server, not in the code.
    // This is the most important part of the security.
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ message: "API Key is not configured on the server." }) };
    }

    // Determine the base URL for the first API call based on what the frontend provided.
    let weatherUrl;
    if (city) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    } else if (lat && lon) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else {
        return { statusCode: 400, body: JSON.stringify({ message: "City or coordinates are required." }) };
    }

    try {
        // --- Step 1: Get current weather to find the exact coordinates ---
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // If the city is not found or there's an API error, stop and send the error back.
        if (weatherResponse.status !== 200) {
            return { statusCode: weatherData.cod, body: JSON.stringify(weatherData) };
        }

        const { lat: newLat, lon: newLon } = weatherData.coord;

        // --- Step 2: Use the exact coordinates to get forecast and air quality data ---
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${newLat}&lon=${newLon}&appid=${API_KEY}&units=metric`;
        const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${newLat}&lon=${newLon}&appid=${API_KEY}`;
        
        // Make both API calls at the same time for better performance
        const [forecastResponse, airQualityResponse] = await Promise.all([
            fetch(forecastUrl),
            fetch(airQualityUrl)
        ]);

        const forecastData = await forecastResponse.json();
        const airQualityData = await airQualityResponse.json();

        // --- Step 3: Combine all the data into a single object ---
        const combinedData = {
            weather: weatherData,
            forecast: forecastData,
            airQuality: airQualityData,
        };
        
        // --- Step 4: Send the combined data back to the frontend ---
        return {
            statusCode: 200,
            body: JSON.stringify(combinedData),
        };

    } catch (error) {
        console.error("Backend Error:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "An error occurred on the server." }) };
    }
};

