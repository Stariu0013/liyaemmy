import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WeeklyForecast.module.scss";
import getWeatherIcon from "../../helpers/getWeatherIcon.js";
import { useTranslation } from "react-i18next";

const WeeklyWeather = ({ forecast }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const normalizeForecastData = (data) => {
        if (data && Array.isArray(data) && data[0]?.dt) {
            const today = new Date().toLocaleDateString();

            return data.reduce((acc, current) => {
                const date = new Date(current.dt * 1000).toLocaleDateString();

                if (date !== today) {
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(current);
                }
                return acc;
            }, {});
        }

        if (data && Array.isArray(data)) {
            const today = new Date().toLocaleDateString();

            return data.reduce((acc, current) => {
                const { date } = current;

                if (date !== today) {
                    const {
                        temperature_3h,
                        weather_conditions_3h,
                        average_temperature,
                        feels_like_3h,
                        humidity_3h,
                        max_temperature,
                        min_temperature,
                        precipitation_chance_3h,
                        wind_speed_3h
                    } = current;

                    acc[date] = Object.entries(temperature_3h).map(([hour, temp]) => ({
                        hour,
                        date,
                        temp,
                        condition: weather_conditions_3h[hour],
                        windSpeed: wind_speed_3h[hour],
                        feelsLike: feels_like_3h[hour],
                        humidity: humidity_3h[hour],
                        precipitation: precipitation_chance_3h[hour],
                        maxTemperature: max_temperature,
                        minTemperature: min_temperature,
                        averageTemperature: average_temperature
                    }));
                }
                return acc;
            }, {});
        }

        throw new Error("Forecast data format is not recognized");
    };

    const groupedForecast = normalizeForecastData(forecast);

    const handleCardClick = (date, dailyData) => {
        navigate(`/weather-details/${encodeURIComponent(date)}`, {
            state: { date, dailyData },
        });
    };

    return (
        <div className={styles.weeklyWeather}>
            {Object.entries(groupedForecast).map(([date, dailyData], index) => {
                const avgTemp =
                    dailyData.reduce((sum, entry) => sum + (entry.temp || entry.main.temp), 0) /
                    dailyData.length;

                const weatherIcon =
                    dailyData[0].condition || dailyData[0].weather?.[0]?.icon;
                const description =
                    dailyData[0].description || dailyData[0].weather?.[0]?.description || dailyData[0].condition;

                return (
                    <div
                        key={index}
                        className={styles.weatherCard}
                        onClick={() => handleCardClick(date, dailyData)}
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