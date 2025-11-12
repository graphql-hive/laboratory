import type { LabaratoryEnv } from "@/lib/env";
import type { LabaratoryHistoryRequest } from "@/lib/history";
import type { LabaratoryOperation } from "@/lib/operations";
import type { LabaratoryPreflight } from "@/lib/preflight";
import { useCallback, useState } from "react";

export interface LabaratoryTabOperation {
  id: string;
  type: "operation";
  data: Pick<LabaratoryOperation, "id" | "name">;
  readOnly?: boolean;
}

export interface LabaratoryTabHistory {
  id: string;
  type: "history";
  data: Pick<LabaratoryHistoryRequest, "id">;
  readOnly?: boolean;
}

export interface LabaratoryTabPreflight {
  id: string;
  type: "preflight";
  data: LabaratoryPreflight;
  readOnly?: boolean;
}

export interface LabaratoryTabEnv {
  id: string;
  type: "env";
  data: LabaratoryEnv;
  readOnly?: boolean;
}

export type LabaratoryTabData =
  | Pick<LabaratoryOperation, "id" | "name">
  | Pick<LabaratoryHistoryRequest, "id">
  | LabaratoryPreflight
  | LabaratoryEnv;
export type LabaratoryTab =
  | LabaratoryTabOperation
  | LabaratoryTabPreflight
  | LabaratoryTabEnv
  | LabaratoryTabHistory;

export interface LabaratoryTabsState {
  tabs: LabaratoryTab[];
}

export interface LabaratoryTabsActions {
  activeTab: LabaratoryTab | null;
  setActiveTab: (tab: LabaratoryTab) => void;
  setTabs: (tabs: LabaratoryTab[]) => void;
  addTab: (tab: Omit<LabaratoryTab, "id">) => LabaratoryTab;
  updateTab: (id: string, data: LabaratoryTabData) => void;
  deleteTab: (tabId: string) => void;
}

export const useTabs = (props: {
  defaultTabs?: LabaratoryTab[] | null;
  defaultActiveTabId?: string | null;
  onTabsChange?: (tabs: LabaratoryTab[]) => void;
  onActiveTabIdChange?: (tabId: string | null) => void;
}): LabaratoryTabsState & LabaratoryTabsActions => {
  const [tabs, _setTabs] = useState<LabaratoryTab[]>(props.defaultTabs ?? []);

  const [activeTab, _setActiveTab] = useState<LabaratoryTab | null>(
    props.defaultTabs?.find((t) => t.id === props.defaultActiveTabId) ??
      props.defaultTabs?.[0] ??
      null
  );

  const setActiveTab = useCallback(
    (tab: LabaratoryTab) => {
      _setActiveTab(tab);
      props.onActiveTabIdChange?.(tab.id);
    },
    [props]
  );

  const setTabs = useCallback(
    (tabs: LabaratoryTab[]) => {
      _setTabs(tabs);
      props.onTabsChange?.(tabs);
    },
    [props]
  );

  const addTab = useCallback(
    (tab: Omit<LabaratoryTab, "id">) => {
      const newTab = { ...tab, id: crypto.randomUUID() } as LabaratoryTab;
      const newTabs = [...(tabs ?? []), newTab] as LabaratoryTab[];
      _setTabs(newTabs);
      props.onTabsChange?.(newTabs);

      return newTab;
    },
    [tabs, props]
  );

  const deleteTab = useCallback(
    (tabId: string) => {
      const newTabs = tabs.filter((t) => t.id !== tabId);
      _setTabs(newTabs);
      props.onTabsChange?.(newTabs);
    },
    [tabs, props]
  );

  const updateTab = useCallback(
    (id: string, newData: LabaratoryTabData) => {
      const newTabs = tabs.map((t) =>
        t.id === id ? { ...t, data: newData } : t
      ) as LabaratoryTab[];
      _setTabs(newTabs);
      props.onTabsChange?.(newTabs);
    },
    [tabs, props]
  );

  return {
    activeTab,
    setActiveTab,
    tabs,
    setTabs,
    addTab,
    deleteTab,
    updateTab,
  };
};
