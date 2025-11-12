import { useLabaratory } from "@/components/labaratory/context";
import { Operation } from "@/components/labaratory/operation";
import { useMemo } from "react";

export const HistoryItem = () => {
  const { activeTab, history } = useLabaratory();

  const historyItem = useMemo(() => {
    if (activeTab?.type !== "history") {
      return null;
    }

    return history.find((h) => h.id === activeTab.data.id) ?? null;
  }, [history, activeTab]);

  if (!historyItem) {
    return null;
  }

  return (
    <Operation operation={historyItem.operation} historyItem={historyItem} />
  );
};
