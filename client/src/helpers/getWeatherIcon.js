import Cloud from "../assets/imgs/Cloud.svg";
import CloudAngledRain from "../assets/imgs/Cloud angled rain.svg";
import CloudSlowWind from "../assets/imgs/Cloud slow wind.svg";
import CloudSnow from "../assets/imgs/Cloud snow.svg";
import CloudSunset from "../assets/imgs/Cloud sunset.svg";
import CloudZap from "../assets/imgs/Cloud zap.svg";
import Moon from "../assets/imgs/Moon.svg";
import MoonCloud from "../assets/imgs/Moon cloud.svg";
import MoonCloudAngledRain from "../assets/imgs/Moon cloud angled rain.svg";
import MoonCloudBigRain from "../assets/imgs/Moon cloud big rain.svg";
import MoonCloudSlowWind from "../assets/imgs/Moon cloud slow wind.svg";
import MoonCloudSnow from "../assets/imgs/Moon cloud snow.svg";
import Sun from "../assets/imgs/Sun.svg";
import SunCloud from "../assets/imgs/Sun cloud.svg";
import SunCloudBigRain from "../assets/imgs/Sun cloud big rain.svg";


export default function getWeatherIcon(icon) {
    const ICON_MAP = {
        "01d": Sun,                          // Clear sky (day)
        "01n": Moon,                         // Clear sky (night)
        "02d": SunCloud,                     // Few clouds (day)
        "02n": MoonCloud,                    // Few clouds (night)
        "03d": Cloud,                        // Scattered clouds (day)
        "03n": Cloud,                        // Scattered clouds (night)
        "04d": CloudSunset,                  // Broken clouds (day)
        "04n": CloudSunset,                  // Broken clouds (night)
        "09d": CloudAngledRain,              // Shower rain (day)
        "09n": MoonCloudAngledRain,          // Shower rain (night)
        "10d": SunCloudBigRain,              // Rain (day)
        "10n": MoonCloudBigRain,             // Rain (night)
        "11d": CloudZap,                     // Thunderstorm (day)
        "11n": CloudZap,                     // Thunderstorm (night)
        "13d": CloudSnow,                    // Snow (day)
        "13n": MoonCloudSnow,                // Snow (night)
        "50d": CloudSlowWind,                // Mist (day)
        "50n": MoonCloudSlowWind,            // Mist (night)
    };

    return ICON_MAP[icon] ? ICON_MAP[icon] : Cloud;
}

export function getWeatherIconForHourAndCondition(hour, condition) {
    const ICON_MAP = {
        Clear: { day: Sun, night: Moon },
        Clouds: { day: Cloud, night: Cloud },
        Rain: { day: SunCloudBigRain, night: MoonCloudBigRain },
        Thunderstorm: { day: CloudZap, night: CloudZap },
        Snow: { day: CloudSnow, night: MoonCloudSnow },
        Mist: { day: CloudSlowWind, night: MoonCloudSlowWind },
        Default: { day: Cloud, night: Cloud }
    };

    const isDaytime = hour >= 6 && hour < 18; // Daytime from 6:00 to 17:59
    const timeOfDay = isDaytime ? "day" : "night";

    // Ensure condition exists in the ICON_MAP, otherwise fallback to "Default"
    const weatherIcons = ICON_MAP[condition] || ICON_MAP.Default;

    return weatherIcons[timeOfDay];
}
