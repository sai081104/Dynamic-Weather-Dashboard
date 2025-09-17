Pro Weather Dashboard
A modern, responsive, and data-rich weather dashboard application built with vanilla JavaScript, HTML, and CSS. This project provides real-time weather information for any city in the world, architected with a secure, serverless backend to protect the API key.

Live Demo: https://dynamicweatherdashboard.netlify.app/

<img width="1880" height="913" alt="image" src="https://github.com/user-attachments/assets/0fe8fb27-0a80-47f0-913d-c48f5c3ebea1" />


Features
Dynamic & Responsive UI: A clean, modern interface that looks great on all devices, from mobile phones to desktops.

Live Weather Data: Fetches and displays current weather, including temperature, conditions, humidity, wind speed, pressure, and more.

Hourly Forecast Chart: An interactive line chart visualizing temperature and rain probability for the next 24 hours.

5-Day Forecast: A clear overview of the weather for the upcoming week.

Detailed Widgets: Includes advanced data widgets for:

Air Quality Index (AQI) with a color-coded gauge.

Wind speed, gust, and direction with a dynamic compass.

Sunrise & Sunset times with a sun path visualization.

Visibility and Dew Point.

Dynamic Backgrounds: The app's background changes to reflect the current weather conditions (e.g., sunny, rainy, cloudy, night).

Secure API Key Handling: Uses a Netlify serverless function as a backend proxy to keep the OpenWeatherMap API key 100% secure and hidden from the public frontend.

Geolocation: Automatically detects and displays the weather for the user's current location on first load.

City Search: Allows users to search for any city worldwide to get its weather report.

Technologies Used
Frontend:

HTML5 (Semantic)

CSS3 (Custom Properties, Grid, Flexbox)

JavaScript (ES6+, Async/Await, Fetch API)

Data Visualization:

Chart.js for the hourly forecast chart.

Backend & Deployment:

Netlify Functions for the secure serverless backend.

Netlify for hosting and continuous deployment.

APIs:

OpenWeatherMap API for all weather and air quality data.

Setup and Installation
To run this project on your local machine, you'll need to have Node.js and the Netlify CLI installed.

1. Clone the repository:

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

2. Install project dependencies:
This command installs the node-fetch package required by the backend function.

npm install

3. Link to your Netlify site:
This crucial step connects your local folder to your live Netlify site to pull your secret API key.

netlify link

Follow the prompts and choose to connect using the "git remote origin".

4. Start the local development server:

netlify dev
