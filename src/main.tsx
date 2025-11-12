import { createRoot } from "react-dom/client";
import "./index.css";
import { Labaratory } from "@/components/labaratory/labaratory-desktop";
import type { LabaratoryOperation } from "@/lib/operations";
import type { LabaratoryHistory } from "@/lib/history";
import type { LabaratoryCollection } from "@/lib/collections";
import type { LabaratoryPreflight } from "@/lib/preflight";
import type { LabaratoryTab } from "@/lib/tabs";
import type { LabaratoryEnv } from "@/lib/env";
import { throttle } from "lodash";

const localEndpoint = localStorage.getItem("endpoint");
const defaultEndpoint = localEndpoint ?? null;

const onEndpointChange = throttle((endpoint: string | null) => {
  localStorage.setItem("endpoint", endpoint ?? "");
}, 1000);

const localOperations = localStorage.getItem("operations");
const defaultOperations = localOperations ? JSON.parse(localOperations) : [];

const onOperationsChange = throttle((operations: LabaratoryOperation[]) => {
  localStorage.setItem("operations", JSON.stringify(operations));
}, 1000);

const localActiveOperationId = localStorage.getItem("activeOperationId");
const defaultActiveOperationId =
  localActiveOperationId ?? defaultOperations[0]?.id ?? "";

const onActiveOperationIdChange = throttle((operationId: string) => {
  localStorage.setItem("activeOperationId", operationId);
}, 1000);

const localHistory = localStorage.getItem("history");
const defaultHistory = localHistory ? JSON.parse(localHistory) : [];

const onHistoryChange = throttle((history: LabaratoryHistory[]) => {
  localStorage.setItem("history", JSON.stringify(history));
}, 1000);

const localCollections = localStorage.getItem("collections");
const defaultCollections = localCollections ? JSON.parse(localCollections) : [];

const onCollectionsChange = throttle((collections: LabaratoryCollection[]) => {
  localStorage.setItem("collections", JSON.stringify(collections));
}, 1000);

const localPreflight = localStorage.getItem("preflight");
const defaultPreflight = localPreflight ? JSON.parse(localPreflight) : null;

const onPreflightChange = throttle((preflight: LabaratoryPreflight | null) => {
  localStorage.setItem("preflight", JSON.stringify(preflight));
}, 1000);

const localTabs = localStorage.getItem("tabs");
const defaultTabs = localTabs ? JSON.parse(localTabs) : [];

const onTabsChange = throttle((tabs: LabaratoryTab[]) => {
  localStorage.setItem("tabs", JSON.stringify(tabs));
}, 1000);

const localEnv = localStorage.getItem("env");
const defaultEnv = localEnv ? JSON.parse(localEnv) : { variables: {} };

const onEnvChange = throttle((env: LabaratoryEnv | null) => {
  localStorage.setItem("env", JSON.stringify(env));
}, 1000);

const localActiveTabId = localStorage.getItem("activeTabId");
const defaultActiveTabId = localActiveTabId ?? defaultTabs[0]?.id ?? null;

const onActiveTabIdChange = throttle((tabId: string | null) => {
  localStorage.setItem("activeTabId", tabId ?? "");
}, 1000);

createRoot(document.getElementById("root")!).render(
  <div className="w-full h-full bg-background">
    <Labaratory
      defaultEndpoint={defaultEndpoint}
      onEndpointChange={onEndpointChange}
      defaultOperations={defaultOperations}
      defaultActiveOperationId={defaultActiveOperationId}
      onOperationsChange={onOperationsChange}
      onActiveOperationIdChange={onActiveOperationIdChange}
      defaultHistory={defaultHistory}
      onHistoryChange={onHistoryChange}
      defaultCollections={defaultCollections}
      onCollectionsChange={onCollectionsChange}
      defaultPreflight={defaultPreflight}
      onPreflightChange={onPreflightChange}
      defaultTabs={defaultTabs}
      onTabsChange={onTabsChange}
      defaultActiveTabId={defaultActiveTabId}
      onActiveTabIdChange={onActiveTabIdChange}
      defaultEnv={defaultEnv}
      onEnvChange={onEnvChange}
    />
  </div>
);
