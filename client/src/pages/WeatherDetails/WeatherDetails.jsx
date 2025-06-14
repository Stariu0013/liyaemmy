import React from "react";
import { useLocation } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useTranslation } from "react-i18next";
import styles from "./WeatherDetails.module.scss";
import getWeatherIcon, { getWeatherIconForHourAndCondition } from "../../helpers/getWeatherIcon.js";
import {t} from "i18next";

const WeatherDetails = () => {
    const location = useLocation();
    const { date, dailyData } = location.state || {};
    const { t } = useTranslation();

    console.log({
        dailyData
    });

    if (!date || !dailyData) {
        return <p>{t("noDataAvailable")}</p>;
    }

    const isFirstCase = dailyData[0]?.weather && dailyData[0]?.main;
    const isSecondCase = dailyData[0]?.temp && dailyData[0]?.condition;

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024, // For screens smaller than 1024px (e.g., tablets)
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768, // For screens smaller than 768px (e.g., phones in landscape)
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480, // For screens smaller than 480px (e.g., phones in portrait)
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className={styles.weatherDetails}>
            <h1>{t("weatherDetailsFor", { date: date.replaceAll("-", ".") })}</h1>
            {isFirstCase && (
                <>
                    <div className={styles.fullWidthBlock}>
                        <img
                            src={getWeatherIcon(dailyData[0].weather[0].icon)}
                            alt={dailyData[0].weather[0].description}
                        />
                        <p className="bold-text">
                            {t("temperature", {value: Math.floor(dailyData[0].main.temp)})}
                        </p>
                        <p>{t("feelsLike", {value: Math.floor(dailyData[0].main.feels_like) })}</p>
                        <p>
                            {t("weather")}: <span className={styles.highlight}>{dailyData[0].weather[0].description}</span>
                        </p>
                    </div>
                    <Slider {...sliderSettings}>
                        {dailyData.map((entry, index) => (
                            <div key={index} className={styles.fullWidthBlock}>
                                <p>
                                    <strong>{t("time", {time: new Date(entry.dt * 1000).toLocaleTimeString() })}:</strong>{" "}

                                </p>
                                <img
                                    src={getWeatherIcon(entry.weather[0].icon)}
                                    alt={entry.weather[0].description}
                                />
                                <p>
                                    <strong>{t("temperature", {value: Math.floor(entry.main.temp)})}:</strong>°C
                                </p>
                                <p>
                                    <strong>{t("feelsLike", {value: Math.floor(entry.main.feels_like)})}:</strong>°C
                                </p>
                                <p>
                                    <strong>{t("weather")}:</strong>{" "}
                                    <span className={styles.highlight}>{entry.weather[0].description}</span>
                                </p>
                            </div>
                        ))}
                    </Slider>
                </>
            )}
            {isSecondCase && (
                <>
                    <div className={styles.fullWidthBlock}>
                        <p className="bold-text">{t("temperature", {value: Math.floor(dailyData[0].temp)})}</p>
                        <p className="bold-text">
                            {t("conditions", {description: dailyData[0].condition})}
                        </p>
                        <p className="bold-text">
                            {t("humidity", { value: dailyData[0].humidity })}
                        </p>
                        <p className="bold-text">
                            {t("windSpeed", { value: dailyData[0].windSpeed })}
                        </p>
                        <p className="bold-text">
                            {t("precipitationProbability", { value: `${dailyData[0].precipitation}%` })}
                        </p>
                        <img
                            src={getWeatherIconForHourAndCondition(dailyData[0].hour, dailyData[0].condition)}
                            alt={"Weather Icon"}
                        />
                    </div>
                    <Slider {...sliderSettings}>
                        {dailyData.map((entry, index) => (
                            <div key={index} className={styles.fullWidthBlock}>
                                <img
                                    src={getWeatherIconForHourAndCondition(entry.hour, entry.condition)}
                                    alt={"Weather Icon"}
                                />
                                <p>
                                    <strong>{t("time", {time: entry.hour})}:00</strong>
                                </p>
                                <p className={styles.temperature}>
                                    <strong>{t("temperature", {value: entry.temp})}</strong>
                                </p>
                                <p>
                                    <strong>{t("conditions", { description: entry.condition })}</strong>
                                </p>
                                <p>
                                    <strong>{t("humidity", { value: entry.humidity })}</strong>
                                </p>
                                <p>
                                    <strong>{t("windSpeed", { value: entry.windSpeed })}</strong>
                                </p>
                                <p>
                                    <strong>{t("precipitationProbability", { value: `${entry.precipitation}%` })}</strong>
                                </p>
                            </div>
                        ))}
                    </Slider>
                </>
            )}
        </div>
    );
};

export default WeatherDetails;