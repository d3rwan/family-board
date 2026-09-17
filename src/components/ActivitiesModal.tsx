import { useState } from "react";
import { Person } from "../hooks/useAppConfig";
import {
  ACTIVITY_KINDS,
  Activity,
  ActivityKind,
  DAY_LABELS,
} from "../hooks/useActivities";

interface ActivitiesModalProps {
  people: Person[];
  activities: Activity[];
  onAdd: (activity: Omit<Activity, "id">) => void;
  onUpdate: (id: string, patch: Partial<Omit<Activity, "id">>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

const emptyForm = (people: Person[]) => ({
  title: "",
  person: people[0]?.name ?? "",
  dayOfWeek: 1,
  startTime: "18:00",
  endTime: "19:00",
  kind: "sport" as ActivityKind,
  location: "",
});

const ActivitiesModal = ({
  people,
  activities,
  onAdd,
  onUpdate,
  onRemove,
  onClose,
}: ActivitiesModalProps) => {
  const [form, setForm] = useState(() => emptyForm(people));
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.person) return;
    if (form.startTime >= form.endTime) return;

    if (editingId) {
      onUpdate(editingId, { ...form });
      setEditingId(null);
    } else {
      onAdd({ ...form });
    }
    setForm(emptyForm(people));
  };

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      person: activity.person,
      dayOfWeek: activity.dayOfWeek,
      startTime: activity.startTime,
      endTime: activity.endTime,
      kind: activity.kind,
      location: activity.location ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm(people));
  };

  return (
    <div className="config-modal">
      <div className="config-content">
        <h2>Activités hebdo (sport, piano…)</h2>
        <p className="activities-hint">
          Les activités se répètent chaque semaine et s&apos;affichent dans le
          calendrier, même sans Google Agenda.
        </p>

        {people.length === 0 && (
          <p className="activities-hint">
            Ajoutez d&apos;abord un membre de la famille dans la configuration
            ⚙️.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="config-section">
            <h3>{editingId ? "Modifier l'activité" : "Nouvelle activité"}</h3>
            <div className="form-group">
              <label>Activité</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="ex : Foot, Judo, Piano"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Membre</label>
                <select
                  value={form.person}
                  onChange={(e) => setForm({ ...form, person: e.target.value })}
                  required
                >
                  {people.map((person) => (
                    <option key={person.name} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={form.kind}
                  onChange={(e) =>
                    setForm({ ...form, kind: e.target.value as ActivityKind })
                  }
                >
                  {(Object.keys(ACTIVITY_KINDS) as ActivityKind[]).map(
                    (kind) => (
                      <option key={kind} value={kind}>
                        {ACTIVITY_KINDS[kind].icon} {ACTIVITY_KINDS[kind].label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jour</label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) =>
                    setForm({ ...form, dayOfWeek: Number(e.target.value) })
                  }
                >
                  {DAY_LABELS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lieu (optionnel)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="ex : Gymnase, Conservatoire"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Début</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Fin</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="config-actions">
              {editingId ? (
                <div className="save-cancel">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="cancel-button"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="save-button">
                    Mettre à jour
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  className="add-button"
                  disabled={people.length === 0}
                >
                  + Ajouter l&apos;activité
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="config-section">
          <h3>Activités enregistrées ({activities.length})</h3>
          {activities.length === 0 ? (
            <p className="activities-hint">
              Aucune activité pour l&apos;instant. Exemple : Foot d&apos;Adam le
              lundi de 18h à 19h30.
            </p>
          ) : (
            <ul className="activities-list">
              {activities.map((activity) => (
                <li key={activity.id} className="activity-item">
                  <span className="activity-icon">
                    {ACTIVITY_KINDS[activity.kind]?.icon ?? "📌"}
                  </span>
                  <span className="activity-text">
                    <strong>{activity.title}</strong> · {activity.person} ·{" "}
                    {DAY_LABELS[activity.dayOfWeek]} {activity.startTime}–
                    {activity.endTime}
                    {activity.location ? ` · ${activity.location}` : ""}
                  </span>
                  <span className="activity-buttons">
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => startEdit(activity)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => onRemove(activity.id)}
                      aria-label={`Supprimer ${activity.title}`}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="config-actions">
          <div className="save-cancel">
            <button type="button" onClick={onClose} className="cancel-button">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesModal;
