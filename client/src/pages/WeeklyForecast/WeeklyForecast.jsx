import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WeeklyForecast.module.scss";
import getWeatherIcon from "../../helpers/getWeatherIcon.js";
import { useTranslation } from "react-i18next";

const WeeklyWeather = ({ forecast }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Identify the format of forecast data and transform it to a consistent format
    const normalizeForecastData = (data) => {
        // CASE 1: Original format (forecast array with "dt" timestamps)
        if (data && Array.isArray(data) && data[0]?.dt) {
            return data.reduce((acc, current) => {
                const date = new Date(current.dt * 1000).toLocaleDateString();
                if (!acc[date]) acc[date] = [];
                acc[date].push(current);
                return acc;
            }, {});
        }

        // CASE 2: Second format (formatted with `forecasts`, `temperature_3h`, etc.)
        if (data && Array.isArray(data)) {
            return data.reduce((acc, current) => {
                const { date, temperature_3h, weather_conditions_3h } = current;
                acc[date] = Object.entries(temperature_3h).map(([hour, temp]) => ({
                    hour,
                    date,
                    temp,
                    condition: weather_conditions_3h[hour],
                }));
                return acc;
            }, {});
        }

        // Throw an error if an unrecognized format is received
        throw new Error("Forecast data format is not recognized");
    };

    // Normalize data for consistent grouping
    const groupedForecast = normalizeForecastData(forecast);

    // Handle navigation to the detailed weather page
    const handleCardClick = (date, dailyData) => {
        navigate(`/weather-details/${encodeURIComponent(date)}`, {
            state: { date, dailyData }, // Pass all data through the 'state'
        });
    };

    return (
        <div className={styles.weeklyWeather}>
            {Object.entries(groupedForecast).map(([date, dailyData], index) => {
                // For CASE 2: Calculate the average temperature from the normalized data
                const avgTemp =
                    dailyData.reduce((sum, entry) => sum + (entry.temp || entry.main.temp), 0) /
                    dailyData.length;

                // For CASE 2, conditionally handle the weatherIcon for the first entry
                const weatherIcon =
                    dailyData[0].condition || dailyData[0].weather?.[0]?.icon;
                const description =
                    dailyData[0].description || dailyData[0].weather?.[0]?.description;

                return (
                    <div
                        key={index}
                        className={styles.weatherCard}
                        onClick={() => handleCardClick(date, dailyData)} // Pass data on click
                        style={{ cursor: "pointer" }}
                    >
                        <h4>{t("day", { date })}</h4>
                        <img
                            src={getWeatherIcon(weatherIcon)}
                            alt={description}
                        />
                        <p>{t("avgTemp", { value: Math.floor(avgTemp) })}°C</p>
                        <p>{t("conditions", { description })}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default WeeklyWeather;