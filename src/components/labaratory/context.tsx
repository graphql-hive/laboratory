import { createContext, useContext } from "react";
import {
  type LabaratoryCollection,
  type LabaratoryCollectionsActions,
  type LabaratoryCollectionsState,
} from "@/lib/collections";
import {
  type LabaratoryEndpointActions,
  type LabaratoryEndpointState,
} from "@/lib/endpoint";
import {
  type LabaratoryOperation,
  type LabaratoryOperationsActions,
  type LabaratoryOperationsState,
} from "@/lib/operations";
import type {
  LabaratoryHistoryActions,
  LabaratoryHistoryState,
} from "@/lib/history";
import type { LabaratoryHistory } from "@/lib/history";
import type {
  LabaratoryTab,
  LabaratoryTabsActions,
  LabaratoryTabsState,
} from "@/lib/tabs";
import type {
  LabaratoryPreflight,
  LabaratoryPreflightActions,
  LabaratoryPreflightState,
} from "@/lib/preflight";
import type {
  LabaratoryEnv,
  LabaratoryEnvActions,
  LabaratoryEnvState,
} from "@/lib/env";

type LabaratoryContextState = LabaratoryCollectionsState &
  LabaratoryEndpointState &
  LabaratoryOperationsState &
  LabaratoryHistoryState &
  LabaratoryTabsState &
  LabaratoryPreflightState &
  LabaratoryEnvState;
type LabaratoryContextActions = LabaratoryCollectionsActions &
  LabaratoryEndpointActions &
  LabaratoryOperationsActions &
  LabaratoryHistoryActions &
  LabaratoryTabsActions &
  LabaratoryPreflightActions &
  LabaratoryEnvActions & {
    openAddCollectionDialog?: () => void;
    openUpdateEndpointDialog?: () => void;
  };

const LabaratoryContext = createContext<
  LabaratoryContextState & LabaratoryContextActions
>({} as LabaratoryContextState & LabaratoryContextActions);

// eslint-disable-next-line react-refresh/only-export-components
export const useLabaratory = () => {
  return useContext(LabaratoryContext);
};

export type LabaratoryContextProps = LabaratoryContextState &
  LabaratoryContextActions & {
    defaultEndpoint?: string | null;
    onEndpointChange?: (endpoint: string | null) => void;
    defaultCollections?: LabaratoryCollection[];
    onCollectionsChange?: (collections: LabaratoryCollection[]) => void;
    defaultOperations?: LabaratoryOperation[];
    defaultActiveOperationId?: string;
    onOperationsChange?: (operations: LabaratoryOperation[]) => void;
    onActiveOperationIdChange?: (operationId: string) => void;
    defaultHistory?: LabaratoryHistory[];
    onHistoryChange?: (history: LabaratoryHistory[]) => void;
    openAddCollectionDialog?: () => void;
    openUpdateEndpointDialog?: () => void;
    defaultPreflight?: LabaratoryPreflight | null;
    onPreflightChange?: (preflight: LabaratoryPreflight | null) => void;
    defaultTabs?: LabaratoryTab[];
    onTabsChange?: (tabs: LabaratoryTab[]) => void;
    defaultActiveTabId?: string | null;
    onActiveTabIdChange?: (tabId: string | null) => void;
    defaultEnv?: LabaratoryEnv | null;
    onEnvChange?: (env: LabaratoryEnv | null) => void;
  };

export const LabaratoryProvider = (
  props: React.PropsWithChildren<LabaratoryContextProps>
) => {
  return (
    <LabaratoryContext.Provider
      value={{
        ...props,
      }}
    >
      {props.children}
    </LabaratoryContext.Provider>
  );
};
