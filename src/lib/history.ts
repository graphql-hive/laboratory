import type { LabaratoryOperation } from "@/lib/operations";
import type { LabaratoryPreflightLog } from "@/lib/preflight";
import { useCallback, useEffect, useRef, useState } from "react";

export interface LabaratoryHistoryRequest {
  id: string;
  status: number;
  duration: number;
  size: number;
  response: string;
  headers: string;
  operation: LabaratoryOperation;
  preflightLogs?: LabaratoryPreflightLog[];
  createdAt: string;
}

export interface LabaratoryHistorySubscription {
  id: string;
  responses: {
    createdAt: string;
    data: string;
  }[];
  preflightLogs?: LabaratoryPreflightLog[];
  operation: LabaratoryOperation;
  createdAt: string;
}

export type LabaratoryHistory =
  | LabaratoryHistoryRequest
  | LabaratoryHistorySubscription;

export interface LabaratoryHistoryState {
  history: LabaratoryHistory[];
}

export interface LabaratoryHistoryActions {
  addHistory: (history: Omit<LabaratoryHistory, "id">) => LabaratoryHistory;
  addResponseToHistory: (historyId: string, response: string) => void;
}

export const useHistory = (props: {
  defaultHistory?: LabaratoryHistory[];
  onHistoryChange?: (history: LabaratoryHistory[]) => void;
}): LabaratoryHistoryState & LabaratoryHistoryActions => {
  const [history, setHistory] = useState<LabaratoryHistory[]>(
    props.defaultHistory ?? []
  );

  const historyRef = useRef<LabaratoryHistory[]>(history);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const addHistory = useCallback(
    (item: Omit<LabaratoryHistory, "id">) => {
      const newItem: LabaratoryHistory = {
        ...item,
        id: crypto.randomUUID(),
      } as LabaratoryHistory;
      const newHistory = [...history, newItem];
      setHistory(newHistory);

      props.onHistoryChange?.(newHistory);

      return newItem;
    },
    [history, props]
  );

  const addResponseToHistory = useCallback(
    (historyId: string, response: string) => {
      const historyItem = historyRef.current.find((item) => item.id === historyId);

      if (!historyItem) {
        return;
      }

      if ("responses" in historyItem) {
        const newResponses = [
          ...historyItem.responses,
          {
            createdAt: new Date().toISOString(),
            data: response,
          },
        ];

        const newHistory = [...historyRef.current.map((item) => item.id === historyId ? { ...item, responses: newResponses } : item)];
        setHistory(newHistory);
        props.onHistoryChange?.(newHistory);
      }
    },
    [props]
  );

  return {
    history,
    addHistory,
    addResponseToHistory,
  };
};
