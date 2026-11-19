import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api";
import { applyAppearance, cacheAppearance, readCachedAppearance } from "../theme";

export function useProfile() {
  // Start with the saved look so the page does not jump when the server answers
  const [profile, setProfile] = useState({
    name: "Guest",
    email: "",
    ...readCachedAppearance(),
  });

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  // Apply the theme and accent whenever they change
  useEffect(() => {
    applyAppearance(profile);
    cacheAppearance({ theme: profile.theme, accent: profile.accent });

    // In "system" mode, follow the device when it switches between light and dark
    if (profile.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(profile);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [profile]);

  // Throws on failure, so the caller can show a message
  async function save(changes) {
    const updated = await updateProfile(changes);
    setProfile(updated);
    return updated;
  }

  return { profile, save };
}
