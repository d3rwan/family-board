import { useState, useEffect } from "react";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Person } from "../hooks/useAppConfig";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  person: string;
  color: string;
}

interface CalendarProps {
  events: Event[];
  selectedDate: Date;
  people: Person[];
}

const Calendar = ({ events, selectedDate, people }: CalendarProps) => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    const selectedDateStart = startOfDay(new Date(selectedDate));

    const filtered = events.filter((event) => {
      const eventDate = startOfDay(new Date(event.start));
      return eventDate.getTime() === selectedDateStart.getTime();
    });

    setFilteredEvents(filtered);
  }, [events, selectedDate, people]);

  const calculateEventPosition = (start: Date, end: Date) => {
    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    const startPosition = (startHour - 8) * 60 + startMinutes;
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);

    return {
      top: `${startPosition}px`,
      height: `${duration}px`,
    };
  };

  const timeMarkers = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

  return (
    <div className="calendar-content">
      <div className="timeline">
        {timeMarkers.map((hour) => (
          <div key={hour} className="time-marker">
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>
      {people.map((person) => (
        <div key={person.name} className="person-schedule">
          <div
            className="person-name"
            style={{ backgroundColor: person.color }}
          >
            <div className="person-avatar">
              {person.avatar ? (
                <img src={person.avatar} alt={person.name} />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <span>{person.name}</span>
          </div>
          <div className="events-list">
            {filteredEvents
              .filter((event) => event.person === person.name)
              .map((event) => {
                const position = calculateEventPosition(
                  new Date(event.start),
                  new Date(event.end)
                );
                return (
                  <div
                    key={event.id}
                    className="event-item"
                    style={{
                      top: position.top,
                      height: position.height,
                      backgroundColor: event.color,
                      borderLeft: `4px solid ${event.color}`,
                      boxShadow: `0 2px 4px ${event.color}80`,
                    }}
                  >
                    <div className="event-date">
                      {format(new Date(event.start), "HH:mm", { locale: fr })} -{" "}
                      {format(new Date(event.end), "HH:mm", { locale: fr })}
                    </div>
                    <div className="event-title">{event.title}</div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Calendar;
