import { useState, useCallback } from 'react';
import type { AppSettings, HouseholdMember } from '../types';
import { loadSettings, saveSettings } from '../utils/storage';

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const getMember = useCallback((id?: string): HouseholdMember | undefined => {
    if (!id) return undefined;
    return settings.householdMembers.find(m => m.id === id);
  }, [settings.householdMembers]);

  return { settings, updateSettings, getMember };
}
