import { useState, useEffect } from "react";

export interface Person {
  name: string;
  color: string;
  avatar?: string;
  calendarId?: string;
}

export interface EnvConfig {
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
}

export interface AppConfig {
  people: Person[];
  env: EnvConfig;
}

const STORAGE_KEY = "appConfig";

const defaultConfig: AppConfig = {
  people: [
    {
      name: "John",
      color: "#A8E6CF",
      avatar: "/avatars/dad.png",
      calendarId: "",
    },
    {
      name: "Jane",
      color: "#B8E0F6",
      avatar: "/avatars/mom.png",
      calendarId: "",
    },
    {
      name: "Adam",
      color: "#FFD3B6",
      avatar: "/avatars/son.png",
      calendarId: "",
    },
    {
      name: "Eve",
      color: "#",
      avatar: "/avatars/daughter.png",
      calendarId: "",
    },
  ],
  env: {
    googleClientId: "",
    googleClientSecret: "",
    googleRedirectUri: "",
  },
};

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const updateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  return {
    config,
    updateConfig,
  };
};
