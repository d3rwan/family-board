import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Clock = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
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
