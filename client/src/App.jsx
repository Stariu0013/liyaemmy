import React, {useEffect, useState} from "react";
import "./App.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import {useTranslation} from "react-i18next";
import {Route, Routes} from "react-router-dom";
import WeatherDetails from "./pages/WeatherDetails/WeatherDetails.jsx";
import {WeatherContent} from "./pages/WeatherContent/WeatherContent.jsx";

function App() {
    const {t, i18n} = useTranslation();
    const [city, setCity] = useState("Kyiv");
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWeeklyDataLoading, setIsWeeklyDataLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    const [activeTab, setActiveTab] = useState("today");
    const [forecast, setForecast] = useState(null);

    useEffect(() => {
        const activeTheme = localStorage.getItem("theme") || "dark";
        setTheme(activeTheme);
        document.documentElement.classList.add(activeTheme);

        fetchWeather();
    }, []);

    useEffect(() => {
        async function fetchDataForKiev() {
            setIsWeeklyDataLoading(true);
            try {
                const res = await axios.get(
                    `https://liyaemmy.onrender.com/weather-forecast`
                );

                if (res.status === 200) {
                    setForecast(res.data.forecasts);
                }
            } catch (err) {
                setError(t("error") + ": " + (err.message || t("unknownError")));
            } finally {
                setIsWeeklyDataLoading(false);
            }
        }

        async function handleForecast() {
            if (city.toLowerCase() === "kyiv") {
                await fetchDataForKiev();
            } else {
                await fetchForecast();
            }
        }

        handleForecast();
    }, [city]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));

        localStorage.setItem("theme", theme);

        if (theme === "light") {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const fetchWeather = async () => {
        setIsLoading(true);
        setError(null);
        setWeather(null);
        try {
            const response = await axios.get(
                `https://liyaemmy.onrender.com/weather/${city}`
            );
            if (response.status === 200 && response.data) {
                const data = response.data;
                const extractedWeather = {
                    name: data.city.name || city,
                    timezone: data.city.timezone || 0,
                    today: data.today.map((entry) => ({
                        timestamp: entry.dt,
                        temp: entry.main.temp,
                        feels_like: entry.main.feels_like,
                        humidity: entry.main.humidity,
                        pressure: entry.main.pressure,
                        visibility: entry.visibility || "N/A",
                        weather: entry.weather?.[0] || null,
                        wind: entry.wind,
                        rain: entry.rain ? entry.rain["3h"] : 0,
                        clouds: entry.clouds.all,
                    })),
                };
                setWeather(extractedWeather);
            } else {
                throw new Error("Invalid response structure from the server");
            }
        } catch (err) {
            console.error(err);
            setError(t("error") + ": " + (err.message || t("unknownError")));
        } finally {
            setIsLoading(false);
        }
    };
    const fetchForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecast(null);
        try {
            const response = await axios.get(
                `https://liyaemmy.onrender.com/forecast-5days/${city}`
            );
            if (response.status === 200 && response.data) {
                const extractedForecast = response.data.forecast.map((entry) => ({
                    dt: entry.dt,
                    main: entry.main,
                    weather: entry.weather,
                }));
                setForecast(extractedForecast);
            } else {
                throw new Error("Invalid response structure from the server");
            }
        } catch (err) {
            console.error(err);
            setError(t("error") + ": " + (err.message || t("unknownError")));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`app ${theme}`}>
            <div className="navbar">
                <div className="container">
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === "light" ? t("darkMode") : t("lightMode")}
                    </button>

                    <h1>{t("appTitle")}</h1>

                    <div className="language-switcher">
                        <button onClick={() => changeLanguage("en")}>EN</button>
                        <button onClick={() => changeLanguage("uk")}>UK</button>
                    </div>
                </div>
            </div>

            <div className="search">
                <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button onClick={fetchWeather}>{t("searchButton")}</button>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === "today" ? "active-tab" : ""}
                    onClick={() => setActiveTab("today")}
                >
                    {t("Today")}
                </button>
                <button
                    className={activeTab === "weekly" ? "active-tab" : ""}
                    onClick={() => setActiveTab("weekly")}
                >
                    {t("Weekly")}
                </button>
            </div>

            <Routes>
                <Route path="/" element={<WeatherContent isWeeklyDataLoading={isWeeklyDataLoading} weather={weather} isLoading={isLoading} error={error}
                                                         forecast={forecast} activeTab={activeTab}/>}/>
                <Route path="/weather-details/:date" element={<WeatherDetails/>}/>
            </Routes>
        </div>
    );
}

export default App;