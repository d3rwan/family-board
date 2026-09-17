import { useEffect, useState } from "react";

export type ActivityKind = "sport" | "musique" | "autre";

export interface Activity {
  id: string;
  title: string;
  person: string;
  /** 0 = dimanche, 1 = lundi, ..., 6 = samedi */
  dayOfWeek: number;
  /** Format "HH:mm" */
  startTime: string;
  /** Format "HH:mm" */
  endTime: string;
  kind: ActivityKind;
  location?: string;
}

const STORAGE_KEY = "family-board-activities";

export const ACTIVITY_KINDS: Record<ActivityKind, { label: string; icon: string }> = {
  sport: { label: "Sport", icon: "⚽" },
  musique: { label: "Musique", icon: "🎹" },
  autre: { label: "Autre", icon: "📌" },
};

export const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const activityToDate = (
  activity: Activity,
  referenceDate: Date
): { start: Date; end: Date } => {
  const [startH, startM] = activity.startTime.split(":").map(Number);
  const [endH, endM] = activity.endTime.split(":").map(Number);
  const start = new Date(referenceDate);
  start.setHours(startH || 0, startM || 0, 0, 0);
  const end = new Date(referenceDate);
  end.setHours(endH || 0, endM || 0, 0, 0);
  return { start, end };
};

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActivities(loadActivities());
  }, []);

  const persist = (next: Activity[]) => {
    setActivities(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addActivity = (activity: Omit<Activity, "id">) => {
    const next = [
      ...activities,
      {
        ...activity,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ];
    persist(next);
  };

  const updateActivity = (id: string, patch: Partial<Omit<Activity, "id">>) => {
    persist(
      activities.map((activity) =>
        activity.id === id ? { ...activity, ...patch } : activity
      )
    );
  };

  const removeActivity = (id: string) => {
    persist(activities.filter((activity) => activity.id !== id));
  };

  return { activities, addActivity, updateActivity, removeActivity };
};
