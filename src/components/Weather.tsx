import { useEffect, useState } from "react";

interface WeatherData {
  current: {
    temperature: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    humidity: number;
    feelsLike: number;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    precipitation: number;
  }>;
}

interface Location {
  latitude: number;
  longitude: number;
}

const weatherConfigs: Record<
  number,
  {
    icon: string;
    description: string;
    background: string;
    gradient: string;
  }
> = {
  0: {
    icon: "☀️",
    description: "Ciel dégagé",
    background: "https://images.unsplash.com/photo-1622278647429-71bc97e904e8",
    gradient:
      "linear-gradient(90deg, rgba(77, 171, 247, 0.7) 0%, rgba(255, 130, 50, 0.5) 100%)",
  },
  1: {
    icon: "🌤️",
    description: "Partiellement nuageux",
    background: "https://images.unsplash.com/photo-1595865749889-b37a43c4eba5",
    gradient:
      "linear-gradient(90deg, rgba(100, 182, 255, 0.7) 0%, rgba(145, 178, 255, 0.5) 100%)",
  },
  2: {
    icon: "⛅",
    description: "Nuageux",
    background: "https://images.unsplash.com/photo-1534088568595-a066f410bcda",
    gradient:
      "linear-gradient(90deg, rgba(119, 144, 186, 0.7) 0%, rgba(83, 105, 139, 0.5) 100%)",
  },
  3: {
    icon: "☁️",
    description: "Couvert",
    background: "https://images.unsplash.com/photo-1483977399921-6cf94f6fdc3a",
    gradient:
      "linear-gradient(90deg, rgba(105, 117, 134, 0.7) 0%, rgba(78, 91, 109, 0.5) 100%)",
  },
  45: {
    icon: "🌫️",
    description: "Brouillard",
    background: "https://images.unsplash.com/photo-1543968996-ee822b8176ba",
    gradient:
      "linear-gradient(90deg, rgba(137, 137, 137, 0.7) 0%, rgba(108, 108, 108, 0.5) 100%)",
  },
  48: {
    icon: "🌫️",
    description: "Brouillard givrant",
    background: "https://images.unsplash.com/photo-1486184885347-1464b5f10296",
    gradient:
      "linear-gradient(90deg, rgba(147, 147, 147, 0.7) 0%, rgba(118, 118, 118, 0.5) 100%)",
  },
  51: {
    icon: "🌧️",
    description: "Bruine légère",
    background: "https://images.unsplash.com/photo-1519692933481-e162a57d6721",
    gradient:
      "linear-gradient(90deg, rgba(91, 146, 179, 0.7) 0%, rgba(73, 119, 147, 0.5) 100%)",
  },
  61: {
    icon: "🌧️",
    description: "Pluie légère",
    background: "https://images.unsplash.com/photo-1519692933481-e162a57d6721",
    gradient:
      "linear-gradient(90deg, rgba(83, 134, 166, 0.7) 0%, rgba(66, 108, 134, 0.5) 100%)",
  },
  71: {
    icon: "🌨️",
    description: "Neige légère",
    background: "https://images.unsplash.com/photo-1491002052546-bf38f186af56",
    gradient:
      "linear-gradient(90deg, rgba(164, 189, 209, 0.7) 0%, rgba(144, 166, 184, 0.5) 100%)",
  },
  95: {
    icon: "⛈️",
    description: "Orage",
    background: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28",
    gradient:
      "linear-gradient(90deg, rgba(75, 89, 107, 0.7) 0%, rgba(51, 61, 73, 0.5) 100%)",
  },
};

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError("La géolocalisation n'est pas supportée par votre navigateur");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Erreur de géolocalisation: " + error.message);
          setLoading(false);
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,precipitation,wind_speed_10m,weather_code,relative_humidity_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données météo");
        }

        const data = await response.json();
        setWeather({
          current: {
            temperature: Math.round(data.current.temperature_2m),
            precipitation: data.current.precipitation,
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
            humidity: Math.round(data.current.relative_humidity_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
          },
          daily: data.daily.time.map((date: string, index: number) => ({
            date,
            maxTemp: Math.round(data.daily.temperature_2m_max[index]),
            minTemp: Math.round(data.daily.temperature_2m_min[index]),
            weatherCode: data.daily.weather_code[index],
            precipitation: data.daily.precipitation_sum[index],
          })),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchWeather();
      const interval = setInterval(fetchWeather, 1800000); // Mise à jour toutes les 30 minutes
      return () => clearInterval(interval);
    }
  }, [location]);

  if (loading) return <div className="weather-container">Chargement...</div>;
  if (error) return <div className="weather-container">Erreur: {error}</div>;
  if (!weather) return null;

  const weatherInfo = weatherConfigs[weather.current.weatherCode] || {
    icon: "❓",
    description: "Inconnu",
    background: "https://images.unsplash.com/photo-1516912481808-3406841bd33c",
    gradient:
      "linear-gradient(90deg, rgba(100, 116, 139, 0.7) 0%, rgba(71, 85, 105, 0.5) 100%)",
  };

  return (
    <div className="weather-container">
      <div
        className="weather-background"
        style={{
          backgroundImage: `url(${weatherInfo.background})`,
        }}
      >
        <div
          className="weather-background-overlay"
          style={{
            background: weatherInfo.gradient,
          }}
        />
      </div>
      <div className="weather-content-wrapper">
        <div className="weather-main">
          <div className="weather-icon-temp">
            <div className="weather-icon" title={weatherInfo.description}>
              {weatherInfo.icon}
            </div>
            <div className="temperature">{weather.current.temperature}°</div>
          </div>
        </div>
        <div className="description">{weatherInfo.description}</div>
        <div className="weather-details">
          <div className="detail-item">
            <div className="detail-icon">💧</div>
            <div className="detail-text">
              <div className="detail-value">
                {weather.current.precipitation} mm
              </div>
              <div className="detail-label">Précipitations</div>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-icon">💨</div>
            <div className="detail-text">
              <div className="detail-value">
                {weather.current.windSpeed} km/h
              </div>
              <div className="detail-label">Vitesse du vent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
