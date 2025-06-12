import React from "react";
import { useLocation } from "react-router-dom";
import Slider from "react-slick"; // Import react-slick for the slider
import "slick-carousel/slick/slick.css"; // Slick Carousel styles
import "slick-carousel/slick/slick-theme.css";
import styles from "./WeatherDetails.module.scss"; // Import SCSS module
import getWeatherIcon, { getWeatherIconForHourAndCondition } from "../../helpers/getWeatherIcon.js";

const WeatherDetails = () => {
    const location = useLocation();
    const { date, dailyData } = location.state || {};
    if (!date || !dailyData) {
        return <p>No data available for this date.</p>;
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
                    slidesToShow: 2, // Show 2 slides
                    slidesToScroll: 1, // Scroll 1 slide at a time
                },
            },
            {
                breakpoint: 768, // For screens smaller than 768px (e.g., phones in landscape)
                settings: {
                    slidesToShow: 1, // Show 1 slide
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
            <h1>Weather Details for {date.replaceAll('-', '.')}</h1>
            {isFirstCase && (
                <>
                    <div className={styles.fullWidthBlock}>
                        <img
                            src={getWeatherIcon(dailyData[0].weather[0].icon)}
                            alt={dailyData[0].weather[0].description}
                        />
                        <p className="bold-text">
                            Temperature: {Math.floor(dailyData[0].main.temp)}°C
                        </p>
                        <p>Feels Like: {Math.floor(dailyData[0].main.feels_like)}°C</p>
                        <p>
                            Weather: <span className={styles.highlight}>{dailyData[0].weather[0].description}</span>
                        </p>
                    </div>
                    <Slider {...sliderSettings}>
                        {dailyData.map((entry, index) => (
                            <div key={index} className={styles.fullWidthBlock}>
                                <p>
                                    <strong>Time:</strong>{" "}
                                    {new Date(entry.dt * 1000).toLocaleTimeString()}
                                </p>
                                <img
                                    src={getWeatherIcon(entry.weather[0].icon)}
                                    alt={entry.weather[0].description}
                                />
                                <p>
                                    <strong>Temperature:</strong> {Math.floor(entry.main.temp)}°C
                                </p>
                                <p>
                                    <strong>Feels Like:</strong> {Math.floor(entry.main.feels_like)}°C
                                </p>
                                <p>
                                    <strong>Weather:</strong>{" "}
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
                        <p className="bold-text">Temperature: {Math.floor(dailyData[0].temp)}°C</p>
                        <p className="bold-text">
                            Condition: <span className={styles.highlight}>{dailyData[0].condition}</span>
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
                                    <strong>Time:</strong> {entry.hour}:00
                                </p>
                                <p className={styles.temperature}>
                                    <strong>Temperature:</strong> {entry.temp}°C
                                </p>
                                <p>
                                    <strong>Condition:</strong> {entry.condition}
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