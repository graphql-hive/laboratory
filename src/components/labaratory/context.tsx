import { createContext, useContext } from "react";
import {
  type LabaratoryCollection,
  type LabaratoryCollectionOperation,
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
import type {
  LabaratorySettings,
  LabaratorySettingsActions,
  LabaratorySettingsState,
} from "@/lib/settings";
import type {
  LabaratoryTest,
  LabaratoryTestActions,
  LabaratoryTestState,
} from "@/lib/tests";

type LabaratoryContextState = LabaratoryCollectionsState &
  LabaratoryEndpointState &
  LabaratoryOperationsState &
  LabaratoryHistoryState &
  LabaratoryTabsState &
  LabaratoryPreflightState &
  LabaratoryEnvState &
  LabaratorySettingsState &
  LabaratoryTestState;
type LabaratoryContextActions = LabaratoryCollectionsActions &
  LabaratoryEndpointActions &
  LabaratoryOperationsActions &
  LabaratoryHistoryActions &
  LabaratoryTabsActions &
  LabaratoryPreflightActions &
  LabaratoryEnvActions &
  LabaratorySettingsActions &
  LabaratoryTestActions & {
    openAddCollectionDialog?: () => void;
    openUpdateEndpointDialog?: () => void;
    openAddTestDialog?: () => void;
    openPreflightPromptModal?: (props: {
      placeholder: string;
      defaultValue?: string;
      onSubmit?: (value: string | null) => void;
    }) => void;
  };

const LabaratoryContext = createContext<
  LabaratoryContextState & LabaratoryContextActions
>({} as LabaratoryContextState & LabaratoryContextActions);

// eslint-disable-next-line react-refresh/only-export-components
export const useLabaratory = () => {
  return useContext(LabaratoryContext);
};

export interface LabaratoryApi {
  defaultEndpoint?: string | null;
  onEndpointChange?: (endpoint: string | null) => void;
  defaultCollections?: LabaratoryCollection[];
  onCollectionsChange?: (collections: LabaratoryCollection[]) => void;
  onCollectionCreate?: (collection: LabaratoryCollection) => void;
  onCollectionUpdate?: (collection: LabaratoryCollection) => void;
  onCollectionDelete?: (collection: LabaratoryCollection) => void;
  onCollectionOperationCreate?: (
    collection: LabaratoryCollection,
    operation: LabaratoryCollectionOperation
  ) => void;
  onCollectionOperationUpdate?: (
    collection: LabaratoryCollection,
    operation: LabaratoryCollectionOperation
  ) => void;
  onCollectionOperationDelete?: (
    collection: LabaratoryCollection,
    operation: LabaratoryCollectionOperation
  ) => void;
  defaultOperations?: LabaratoryOperation[];
  defaultActiveOperationId?: string;
  onOperationsChange?: (operations: LabaratoryOperation[]) => void;
  onActiveOperationIdChange?: (operationId: string) => void;
  onOperationCreate?: (operation: LabaratoryOperation) => void;
  onOperationUpdate?: (operation: LabaratoryOperation) => void;
  onOperationDelete?: (operation: LabaratoryOperation) => void;
  defaultHistory?: LabaratoryHistory[];
  onHistoryChange?: (history: LabaratoryHistory[]) => void;
  onHistoryCreate?: (history: LabaratoryHistory) => void;
  onHistoryUpdate?: (history: LabaratoryHistory) => void;
  onHistoryDelete?: (history: LabaratoryHistory) => void;
  openAddCollectionDialog?: () => void;
  openUpdateEndpointDialog?: () => void;
  openAddTestDialog?: () => void;
  openPreflightPromptModal?: (props: {
    placeholder: string;
    defaultValue?: string;
    onSubmit?: (value: string | null) => void;
  }) => void;
  defaultPreflight?: LabaratoryPreflight | null;
  onPreflightChange?: (preflight: LabaratoryPreflight | null) => void;
  defaultTabs?: LabaratoryTab[];
  onTabsChange?: (tabs: LabaratoryTab[]) => void;
  defaultActiveTabId?: string | null;
  onActiveTabIdChange?: (tabId: string | null) => void;
  defaultEnv?: LabaratoryEnv | null;
  onEnvChange?: (env: LabaratoryEnv | null) => void;
  defaultSettings?: LabaratorySettings | null;
  onSettingsChange?: (settings: LabaratorySettings | null) => void;
  defaultTests?: LabaratoryTest[];
  onTestsChange?: (tests: LabaratoryTest[]) => void;
}

export type LabaratoryContextProps = LabaratoryContextState &
  LabaratoryContextActions &
  LabaratoryApi;

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
