import dotenv from 'dotenv';
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where the data files are stored
const dataDirectory = path.join(__dirname, 'data');

dotenv.config();

const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const app = express();

app.use(express.json());
app.use(cors());


app.get('/weather/:city', async (req, res) => {
    const { city } = req.params;

    try {
        // Replace with OpenWeatherMap's forecast endpoint or similar
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ message: 'Error fetching weather data' });
        }

        const forecastData = await response.json();

        // Filter today's forecast
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const todaysForecast = forecastData.list.filter(item => item.dt_txt.startsWith(today));

        res.json({
            city: forecastData.city,
            today: todaysForecast
        });
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/forecast-5days/:city', async (req, res) => {
    const { city } = req.params;

    try {
        // Step 1: Fetch the 3-hour forecast for 5 days
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            return res.status(forecastResponse.status).json({ message: 'Error fetching 5-day / 3-hour forecast' });
        }

        const forecastData = await forecastResponse.json();

        // Step 2: Filter and organize the data as needed
        // The data has "list" property containing 3-hour forecast entries
        res.json({
            city: forecastData.city,
            forecast: forecastData.list // Each item is a 3-hour forecast
        });
    } catch (error) {
        console.error('Error fetching 5-day / 3-hour forecast:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const readFilesForDate = async (fileList, date) => {
    const result = {};

    try {
        for (const fileName of fileList) {
            const filePath = path.join(dataDirectory, fileName);

            // Check if the file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                console.warn(`File not found: ${fileName}`);
                continue;
            }

            // Read the file and parse the JSON content
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const jsonData = JSON.parse(fileContent);

            // Extract the year from the filename (e.g., '2010-kyiv-data.json')
            const year = fileName.split('-')[0];

            // Ensure a structure for this year exists in the result object
            if (!result[year]) {
                result[year] = {};
            }

            // Filter records with the date '01-01' in dt_iso and 3-hour intervals
            const filteredData = jsonData.filter((record) => {
                if (!record.dt_iso.includes(date)) return false; // Only '01-01' records

                const hour = new Date(record.dt_iso).getUTCHours(); // Extract hour (UTC)
                return hour % 3 === 0; // Include only hours divisible by 3
            });

            // If matching data exists, add it under the date key for this year
            if (filteredData.length > 0) {
                const dateKey = date; // Explicitly set the key for the date
                result[year][dateKey] = filteredData;
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }

    return result;
};

app.get('/', async (req, res) => {
    const fileList = [
        '2010-kyiv-data.json',
        '2011-kyiv-data.json',
        '2012-kyiv-data.json',
        '2013-kyiv-data.json',
        '2014-kyiv-data.json',
        '2015-kyiv-data.json',
        '2016-kyiv-data.json',
        '2017-kyiv-data.json',
        '2018-kyiv-data.json',
        '2019-kyiv-data.json',
        '2020-kyiv-data.json',
        '2021-kyiv-data.json',
        '2022-kyiv-data.json',
        '2023-kyiv-data.json',
        '2024-kyiv-data.json',
    ];


    const result = await readFilesForDate(fileList, '05-30');

    res.send(result);
});

const dataDir = path.join(__dirname, "data");
const YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i);

async function loadHistoricalData(monthDay) {
    const params = {
        temp: {}, wind_speed: {}, humidity: {}, feels_like: {},
        weather_main: {}, rain_chance: {}, sunrise: [], sunset: []
    };

    for (let h = 0; h < 24; h += 3) {
        params.temp[h] = [];
        params.wind_speed[h] = [];
        params.humidity[h] = [];
        params.feels_like[h] = [];
        params.weather_main[h] = [];
        params.rain_chance[h] = [];
    }

    for (const year of YEARS) {
        try {
            const filePath = path.join(dataDir, `${year}-kyiv-data.json`);
            const raw = await fs.readFile(filePath, "utf-8");
            const data = JSON.parse(raw);

            data.forEach(entry => {
                const dt = new Date(entry.dt * 1000);
                const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
                const day = String(dt.getUTCDate()).padStart(2, '0');
                const hour = dt.getUTCHours();

                if (`${month}-${day}` !== monthDay || hour % 3 !== 0) return;

                const h = hour;

                if (entry.main?.temp != null) params.temp[h].push(entry.main.temp);
                if (entry.main?.humidity != null) params.humidity[h].push(entry.main.humidity);
                if (entry.main?.feels_like != null) params.feels_like[h].push(entry.main.feels_like);
                if (entry.wind?.speed != null) params.wind_speed[h].push(entry.wind.speed);
                params.weather_main[h].push(entry.weather[0]?.main || "Clear");
                params.rain_chance[h].push(entry.rain?.["1h"] ? 1 : 0);

                if (entry.sys?.sunrise && entry.sys?.sunset) {
                    params.sunrise.push(entry.sys.sunrise);
                    params.sunset.push(entry.sys.sunset);
                }
            });
        } catch (e) {
            console.warn(`Файл за ${year} не знайдено або не читається:`, e.message);
        }
    }

    return params;
}
function ar2Forecast(data) {
    const result = {};

    for (const h in data) {
        const y = (data[h] || []).filter(v => typeof v === 'number' && !isNaN(v));

        if (y.length < 3) {
            result[h] = null;
            continue;
        }

        const X = [];
        const Y = [];

        for (let i = 2; i < y.length; i++) {
            X.push([y[i - 1], y[i - 2]]);
            Y.push(y[i]);
        }

        if (X.length < 2) {
            result[h] = null;
            continue;
        }

        // Обчислення XTX та XTY
        const XTX = [
            [0, 0],
            [0, 0]
        ];
        const XTY = [0, 0];

        for (let i = 0; i < X.length; i++) {
            XTX[0][0] += X[i][0] * X[i][0];
            XTX[0][1] += X[i][0] * X[i][1];
            XTX[1][0] += X[i][1] * X[i][0];
            XTX[1][1] += X[i][1] * X[i][1];

            XTY[0] += X[i][0] * Y[i];
            XTY[1] += X[i][1] * Y[i];
        }

        let a1, a2;
        try {
            [a1, a2] = mathSolve(XTX, XTY);
        } catch (e) {
            console.warn(`AR(2) error at hour ${h}:`, e.message);
            result[h] = null;
            continue;
        }

        const last1 = y[y.length - 1];
        const last2 = y[y.length - 2];
        const forecast = a1 * last1 + a2 * last2;

        result[h] = Math.round(forecast * 10) / 10;
    }

    return result;
}
function computeFeelsLike(temp, humidity) {
    const result = {};
    for (const h in temp) {
        if (temp[h] == null || humidity[h] == null) {
            result[h] = null;
            continue;
        }
        result[h] = Math.round((temp[h] - (100 - humidity[h]) / 5) * 10) / 10;
    }
    return result;
}
function mostFrequent(data) {
    const result = {};
    for (const h in data) {
        const values = Object.values(data[h] || {});
        if (!values.length) {
            result[h] = null;
            continue;
        }
        const counts = values.reduce((acc, x) => {
            acc[x] = (acc[x] || 0) + 1;
            return acc;
        }, {});
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        result[h] = sorted.length > 0 ? sorted[0][0] : null;
    }
    return result;
}
function rainStats(data) {
    const result = {};
    for (const h in data) {
        const values = Object.values(data[h] || {});
        if (!values.length) {
            result[h] = null;
            continue;
        }
        const rainy = values.filter(x => x === 1).length;
        result[h] = Math.round((100 * rainy) / values.length);
    }
    return result;
}
function mathSolve(A, b) {
    const m = A.length;
    const Ab = A.map((row, i) => [...row, b[i]]);

    for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
            const r = Ab[j][i] / Ab[i][i];
            for (let k = i; k <= m; k++) {
                Ab[j][k] -= r * Ab[i][k];
            }
        }
    }

    const x = new Array(m);
    for (let i = m - 1; i >= 0; i--) {
        x[i] = Ab[i][m] / Ab[i][i];
        for (let k = i - 1; k >= 0; k--) {
            Ab[k][m] -= Ab[k][i] * x[i];
        }
    }
    return x;
}

app.get("/weather-forecast", async (req, res) => {
    const startDate = new Date();
    const forecastDays = 7;

    const forecasts = [];

    for (let d = 0; d < forecastDays; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + 1 + d);
        const isoDate = currentDate.toISOString().split("T")[0];
        const monthDay = isoDate.slice(5);

        const params = await loadHistoricalData(monthDay);

        const temp = ar2Forecast(params.temp);
        const wind = ar2Forecast(params.wind_speed);
        const humidity = ar2Forecast(params.humidity);
        const feels = computeFeelsLike(temp, humidity);
        const weather = mostFrequent(params.weather_main);
        const rain = rainStats(params.rain_chance);

        const temps = Object.values(temp).filter(t => t !== null);
        const avg = temps.length ? Math.round((temps.reduce((a, b) => a + b) / temps.length) * 10) / 10 : null;

        forecasts.push({
            date: isoDate,
            temperature_3h: temp,
            average_temperature: avg,
            min_temperature: temps.length ? Math.min(...temps) : null,
            max_temperature: temps.length ? Math.max(...temps) : null,
            wind_speed_3h: wind,
            humidity_3h: humidity,
            feels_like_3h: feels,
            weather_conditions_3h: weather,
            precipitation_chance_3h: rain,
        });
    }

    res.json({
        forecasts
    });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));