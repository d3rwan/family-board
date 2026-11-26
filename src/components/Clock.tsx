import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MINUTE = 60_000;

const Clock = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Tick on the minute boundary: a plain 60s interval started at mount
    // shows the previous minute for up to 59 seconds.
    let interval: ReturnType<typeof setInterval> | undefined;
    const untilNextMinute = MINUTE - (Date.now() % MINUTE);
    const timeout = setTimeout(() => {
      setDate(new Date());
      interval = setInterval(() => setDate(new Date()), MINUTE);
    }, untilNextMinute);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="clock-container">
      <div className="time">{format(date, "HH:mm")}</div>
      <div className="date">
        {format(date, "EEEE d MMMM yyyy", { locale: fr })}
      </div>
    </div>
  );
};

export default Clock;
