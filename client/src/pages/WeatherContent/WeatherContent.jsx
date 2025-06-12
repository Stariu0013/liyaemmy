import WeeklyWeather from "../WeeklyForecast/WeeklyForecast.jsx";
import React from "react";
import styles from "../WeatherDetails/WeatherDetails.module.scss";
import Slider from "react-slick";
import getWeatherIcon from "../../helpers/getWeatherIcon.js";
import { t } from "i18next";

const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        },
    ],
};


export const WeatherContent = ({ weather, isLoading, error, forecast, activeTab, isWeeklyDataLoading }) => {
    const renderWeatherDetails = (weather) => {
        const avgTemp =
            weather.today.reduce((sum, entry) => sum + entry.temp, 0) /
            weather.today.length;
        const avgFeelsLike =
            weather.today.reduce((sum, entry) => sum + entry.feels_like, 0) /
            weather.today.length;
        const avgHumidity =
            weather.today.reduce((sum, entry) => sum + entry.humidity, 0) /
            weather.today.length;

        const avgWindSpeed =
            weather.today.reduce((sum, entry) => sum + entry.wind.speed, 0) /
            weather.today.length;

        const avgPrecipitation =
            weather.today.reduce((sum, entry) => sum + (entry.rain || 0), 0) /
            weather.today.length;

        return (
            <div className={`${styles.weatherDetails} ${styles.fullWidthBlock}`}>
                <h3>{t("averageTodayWeather", { city: weather.name })}</h3>
                <p className={styles.temperature}>{t("averageTemperature", { value: Math.floor(avgTemp) })}</p>
                <p>{t("feelsLike", { value: Math.floor(avgFeelsLike) })}</p>
                <p>{t("humidity", { value: Math.floor(avgHumidity) })}</p>
                <p>{t("windSpeed", { value: Math.floor(avgWindSpeed) })}</p>
                <p>{t("precipitationProbability", { value: `${(avgPrecipitation * 100).toFixed(2)}%` })}</p>

                <h3>{t("hourlyForecast")}</h3>
                <Slider {...sliderSettings}>
                    {weather.today.map((entry, index) => (
                        <div key={index} className={styles.forecastCard}>
                            <p>{t("time", { time: new Date(entry.timestamp * 1000).toISOString().substr(11, 5) })}</p>
                            <img
                                src={getWeatherIcon(entry.weather?.icon)}
                                alt={entry.weather?.description}
                            />
                            <div>{t("temperature", { value: Math.floor(entry.temp) })}</div>
                            <div>{t("conditions", { description: entry.weather?.description })}</div>
                            <div>{t("humidity", { value: entry.humidity })}</div>
                            <div>{t("windSpeed", { value: entry.wind.speed })}</div>
                            <div>{t("precipitationProbability", { value: `${(entry.rain || 0) * 100}%` })}</div>
                        </div>
                    ))}
                </Slider>
            </div>
        );
    };

    return (
        <div className="tabs-content-wrapper">
            {/* Adjust tab content height dynamically using the activeTab */}
            <div className={`content ${activeTab === "today" ? "active" : ""}`}>
                {isLoading && <div className="loading">{t("Daily data is loading")}</div>}
                {error && <div className="error">{error}</div>}
                {weather && renderWeatherDetails(weather)}
            </div>
            <div className={`content ${activeTab === "weekly" ? "active" : ""}`}>
                {isWeeklyDataLoading && <div className="loading">{t("Weekly data is loading")}</div>}
                {error && <div className="error">{error}</div>}
                {forecast && <WeeklyWeather forecast={forecast} />}
            </div>
        </div>
    );
};