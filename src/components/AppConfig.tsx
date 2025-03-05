import { useState, useEffect } from "react";
import { Person, EnvConfig } from "../hooks/useAppConfig";

interface AppConfigProps {
  onSave: (config: { people: Person[]; env: EnvConfig }) => void;
  onClose: () => void;
  currentPeople: Person[];
  currentEnv: EnvConfig;
}

const AppConfig = ({ onSave, onClose, currentPeople, currentEnv }: AppConfigProps) => {
  const [people, setPeople] = useState<Person[]>(currentPeople);
  const [env, setEnv] = useState<EnvConfig>(currentEnv);

  useEffect(() => {
    setPeople(currentPeople);
  }, [currentPeople]);

  useEffect(() => {
    setEnv(currentEnv);
  }, [currentEnv]);

  const addPerson = () => {
    setPeople([...people, { name: "", color: "#E0E0E0" }]);
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const updatePerson = (index: number, field: keyof Person, value: string) => {
    const newPeople = [...people];
    newPeople[index] = { ...newPeople[index], [field]: value };
    setPeople(newPeople);
  };

  const updateEnv = (field: keyof EnvConfig, value: string) => {
    setEnv({ ...env, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ people, env });
    onClose();
  };

  return (
    <div className="config-modal">
      <div className="config-content">
        <h2>Application Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="config-section">
            <h3>Google Configuration</h3>
            <div className="form-group">
              <label>Google Client ID</label>
              <input
                type="text"
                value={env.googleClientId}
                onChange={(e) => updateEnv("googleClientId", e.target.value)}
                required
                placeholder="Your Google Client ID"
              />
            </div>
            <div className="form-group">
              <label>Google Client Secret</label>
              <input
                type="password"
                value={env.googleClientSecret}
                onChange={(e) => updateEnv("googleClientSecret", e.target.value)}
                required
                placeholder="Your Google Client Secret"
              />
            </div>
            <div className="form-group">
              <label>Google Redirect URI</label>
              <input
                type="text"
                value={env.googleRedirectUri}
                onChange={(e) => updateEnv("googleRedirectUri", e.target.value)}
                required
                placeholder="ex: http://localhost:5173"
              />
            </div>
          </div>

          <div className="config-section">
            <h3>Family Members Configuration</h3>
            {people.map((person, index) => (
              <div key={index} className="person-config-item">
                <div className="person-config-header">
                  <h3>Member {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removePerson(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) =>
                      updatePerson(index, "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={person.color}
                    onChange={(e) =>
                      updatePerson(index, "color", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Avatar (URL)</label>
                  <input
                    type="text"
                    value={person.avatar || ""}
                    onChange={(e) =>
                      updatePerson(index, "avatar", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Google Calendar ID</label>
                  <input
                    type="text"
                    value={person.calendarId || ""}
                    onChange={(e) =>
                      updatePerson(index, "calendarId", e.target.value)
                    }
                    placeholder="ex: example@gmail.com"
                  />
                </div>
              </div>
            ))}
            <div className="config-actions">
              <button type="button" onClick={addPerson} className="add-button">
                + Add a member
              </button>
            </div>
          </div>

          <div className="config-actions">
            <div className="save-cancel">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="save-button">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppConfig;
