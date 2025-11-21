import { useCallback, useState } from "react";

export type LabaratorySettings = object

export interface LabaratorySettingsState {
  settings: LabaratorySettings;
}

export interface LabaratorySettingsActions {
  setSettings: (settings: LabaratorySettings) => void;
}

export const useSettings = (props: {
  defaultSettings?: LabaratorySettings | null;
  onSettingsChange?: (settings: LabaratorySettings | null) => void;
}): LabaratorySettingsState & LabaratorySettingsActions => {
  const [settings, _setSettings] = useState<LabaratorySettings>(
    props.defaultSettings ?? {}
  );

  const setSettings = useCallback(
    (settings: LabaratorySettings) => {
      _setSettings(settings);
      props.onSettingsChange?.(settings);
    },
    [props]
  );

  return {
    settings,
    setSettings,
  };
};