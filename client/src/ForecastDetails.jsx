import React from "react";
import { useLocation } from "react-router-dom";
import getWeatherIcon from "./helpers/getWeatherIcon.js";

const ForecastDetails = () => {
    const location = useLocation();
    const { date, forecast } = location.state || {};

    if (!date || !forecast) {
        return <div>No details available. Please go back to the home page.</div>;
    }

    return (
        <div className="forecast-details">
            <h2>Forecast Details for {date}</h2>
            <div className="forecast-row">
                {forecast.map((item, index) => (
                    <div key={index} className="weather-item">
                        <p>Time: {new Date(item.time).toLocaleTimeString()}</p>
                        <p>Temperature: {Math.floor(item.temperature)}°C</p>
                        <p>Weather: {item.weather}</p>
                        <img
                            src={getWeatherIcon(item.icon)}
                            alt={item.weather}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForecastDetails;