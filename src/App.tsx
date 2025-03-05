import { addDays, endOfDay, format, startOfDay, subDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import AppConfig from "./components/AppConfig";
import Calendar from "./components/Calendar";
import Clock from "./components/Clock";
import Weather from "./components/Weather";
import { useAppConfig } from "./hooks/useAppConfig";
import "./styles/global.css";
import { fr } from "date-fns/locale";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  person: string;
  color: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  organizer?: {
    displayName?: string;
  };
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

function App() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showConfig, setShowConfig] = useState(false);
  const { config, updateConfig } = useAppConfig();

  const fetchEvents = useCallback(
    async (
      accessToken: string,
      calendarId: string,
      person: string,
      color: string,
      date: Date
    ) => {
      try {
        const min = startOfDay(new Date(date));
        const max = endOfDay(new Date(date));
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            calendarId
          )}/events?` +
            `timeMin=${min.toISOString()}&` +
            `timeMax=${max.toISOString()}&` +
            `singleEvents=true&` +
            `orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const events =
          data.items?.map((event: GoogleCalendarEvent) => ({
            id: event.id || "",
            title: event.summary || "Sans titre",
            start: new Date(event.start?.dateTime || event.start?.date || ""),
            end: new Date(event.end?.dateTime || event.end?.date || ""),
            person,
            color,
          })) || [];

        return events;
      } catch (error) {
        console.error(`Error fetching events for ${person}:`, error);
        return [];
      }
    },
    []
  );

  const fetchAllEvents = useCallback(
    async (accessToken: string) => {
      try {
        const calendars = config.people
          .map((person) => ({
            id: person.calendarId || "",
            person: person.name,
            color: person.color,
          }))
          .filter((calendar) => calendar.id);

        const allEventsPromises = calendars.map((calendar) =>
          fetchEvents(accessToken, calendar.id, calendar.person, calendar.color, selectedDate)
        );

        const allEventsArrays = await Promise.all(allEventsPromises);
        const allEvents = allEventsArrays.flat();

        allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching all events:", error);
      } finally {
        setLoading(false);
      }
    },
    [config.people, selectedDate, fetchEvents]
  );

  useEffect(() => {
    const token = localStorage.getItem("googleCalendarToken");
    if (token && isAuthenticated) {
      fetchAllEvents(token);
    }
  }, [isAuthenticated, selectedDate, config.people, fetchAllEvents]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                code,
                client_id: config.env.googleClientId,
                client_secret: config.env.googleClientSecret,
                redirect_uri: config.env.googleRedirectUri,
                grant_type: "authorization_code",
              }),
            }
          );

          if (!tokenResponse.ok) {
            throw new Error(`Token error: ${tokenResponse.status}`);
          }

          const tokens: TokenResponse = await tokenResponse.json();
          if (tokens.access_token) {
            localStorage.setItem("googleCalendarToken", tokens.access_token);
            if (tokens.refresh_token) {
              localStorage.setItem(
                "googleCalendarRefreshToken",
                tokens.refresh_token
              );
            }
            localStorage.setItem(
              "tokenExpiry",
              String(Date.now() + tokens.expires_in * 1000)
            );
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            setIsAuthenticated(true);
            fetchAllEvents(tokens.access_token);
          }
        } catch (error) {
          console.error("Error getting tokens:", error);
        }
      } else {
        checkAuth();
      }
    };

    handleAuthCallback();
  }, [config, isAuthenticated, selectedDate, fetchAllEvents]);

  const checkAuth = async () => {
    const token = localStorage.getItem("googleCalendarToken");
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    const refreshToken = localStorage.getItem("googleCalendarRefreshToken");

    if (token && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
        fetchAllEvents(token);
      } else if (refreshToken) {
        try {
          const tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: config.env.googleClientId,
                client_secret: config.env.googleClientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
              }),
            }
          );

          if (!tokenResponse.ok) {
            throw new Error(`Refresh token error: ${tokenResponse.status}`);
          }

          const tokens: TokenResponse = await tokenResponse.json();
          localStorage.setItem("googleCalendarToken", tokens.access_token);
          localStorage.setItem(
            "tokenExpiry",
            String(Date.now() + tokens.expires_in * 1000)
          );
          setIsAuthenticated(true);
          fetchAllEvents(tokens.access_token);
        } catch (error) {
          console.error("Error refreshing token:", error);
          localStorage.removeItem("googleCalendarToken");
          localStorage.removeItem("googleCalendarRefreshToken");
          localStorage.removeItem("tokenExpiry");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  const initiateAuth = () => {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", config.env.googleClientId);
    authUrl.searchParams.append("redirect_uri", config.env.googleRedirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append(
      "scope",
      "https://www.googleapis.com/auth/calendar.readonly"
    );
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    window.location.href = authUrl.toString();
  };

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="app-container">
      <div className="dashboard">
        <div className="top-row">
          <Weather />
          <Clock />
          <button className="config-button" onClick={() => setShowConfig(true)}>
            ⚙️
          </button>
        </div>
        <div className="bottom-row">
          {!isAuthenticated ? (
            <div className="auth-container">
              <h2>Bienvenue sur Family Board</h2>
              <p>Connectez-vous avec Google pour accéder à vos calendriers</p>
              <button onClick={initiateAuth} className="google-auth-button">
                <img
                  src="family-board/google-logo.svg"
                  alt="Google"
                  className="google-logo"
                />
                Se connecter avec Google
              </button>
            </div>
          ) : loading ? (
            <div>Chargement des événements...</div>
          ) : (
            <div className="calendar-container">
              <div className="calendar-header">
                <button onClick={handlePreviousDay} className="nav-button">
                  ←
                </button>
                <h2>{format(selectedDate, "EEEE d MMMM", { locale: fr })}</h2>
                <button onClick={handleNextDay} className="nav-button">
                  →
                </button>
              </div>
              <Calendar
                events={events}
                selectedDate={selectedDate}
                people={config.people}
              />
            </div>
          )}
        </div>
      </div>
      {showConfig && (
        <AppConfig
          currentPeople={config.people}
          currentEnv={config.env}
          onSave={updateConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

export default App;
