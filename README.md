# Hive Labaratory Component Documentation

`Labaratory` is a fully featured React component that provides a modern GraphQL playground experience (collections, tabs, history, preflight scripts, environment variables, tests, etc.). It ships with an opinionated UI and a context provider that exposes granular hooks for integrating with your own storage or analytics layers.

This document explains how to embed the component, what data it needs, and how to react to user changes through the available callbacks.

---

## Getting Started

```tsx
import { Labaratory } from "@/components/labaratory/labaratory";

export const Playground = () => {
  return (
    <Labaratory
      defaultEndpoint="https://api.spacex.land/graphql/"
      onEndpointChange={(endpoint) => {
        localStorage.setItem("lab-endpoint", endpoint ?? "");
      }}
      defaultOperations={[]}
      onOperationCreate={(operation) => console.log("created", operation)}
      onOperationUpdate={(operation) => console.log("updated", operation)}
      onOperationDelete={(operation) => console.log("deleted", operation)}
    />
  );
};
```

The component renders the full UI and injects a `LabaratoryProvider`, so any nested component can call `useLabaratory()` to access the current state.

---

## Data Flow Overview

`Labaratory` is controlled via two complementary mechanisms:

1. **Default Values** – `default*` props let you hydrate the playground from persisted data (e.g., localStorage, database). These are only read during initialization.
2. **Event Callbacks** – `on*` props fire whenever users create/update/delete entities within the playground. Use them to keep external storage in sync or to trigger side effects (analytics, notifications, etc.).

If you provide both a default value and a callback for the same entity, you can make the playground fully persistent without touching its internals.

---

## Props Reference

### Endpoint

- `defaultEndpoint?: string | null`
- `onEndpointChange?: (endpoint: string | null) => void`

### Collections

- `defaultCollections?: LabaratoryCollection[]`
- `onCollectionsChange?: (collections: LabaratoryCollection[]) => void`
- `onCollectionCreate?: (collection: LabaratoryCollection) => void`
- `onCollectionUpdate?: (collection: LabaratoryCollection) => void`
- `onCollectionDelete?: (collection: LabaratoryCollection) => void`
- `onCollectionOperationCreate?: (collection: LabaratoryCollection, operation: LabaratoryCollectionOperation) => void`
- `onCollectionOperationUpdate?: (collection: LabaratoryCollection, operation: LabaratoryCollectionOperation) => void`
- `onCollectionOperationDelete?: (collection: LabaratoryCollection, operation: LabaratoryCollectionOperation) => void`

### Operations

- `defaultOperations?: LabaratoryOperation[]`
- `defaultActiveOperationId?: string`
- `onOperationsChange?: (operations: LabaratoryOperation[]) => void`
- `onActiveOperationIdChange?: (operationId: string) => void`
- `onOperationCreate?: (operation: LabaratoryOperation) => void`
- `onOperationUpdate?: (operation: LabaratoryOperation) => void`
- `onOperationDelete?: (operation: LabaratoryOperation) => void`

### History

- `defaultHistory?: LabaratoryHistory[]`
- `onHistoryChange?: (history: LabaratoryHistory[]) => void`
- `onHistoryCreate?: (history: LabaratoryHistory) => void`
- `onHistoryUpdate?: (history: LabaratoryHistory) => void`
- `onHistoryDelete?: (history: LabaratoryHistory) => void`

### Tabs

- `defaultTabs?: LabaratoryTab[]`
- `defaultActiveTabId?: string | null`
- `onTabsChange?: (tabs: LabaratoryTab[]) => void`
- `onActiveTabIdChange?: (tabId: string | null) => void`

### Preflight Script

- `defaultPreflight?: LabaratoryPreflight | null`
- `onPreflightChange?: (preflight: LabaratoryPreflight | null) => void`

### Environment Variables

- `defaultEnv?: LabaratoryEnv | null`
- `onEnvChange?: (env: LabaratoryEnv | null) => void`

### Settings

- `defaultSettings?: LabaratorySettings | null`
- `onSettingsChange?: (settings: LabaratorySettings | null) => void`

### Tests

- `defaultTests?: LabaratoryTest[]`
- `onTestsChange?: (tests: LabaratoryTest[]) => void`

### Dialog Helpers

`useLabaratory()` also exposes `openAddCollectionDialog`, `openUpdateEndpointDialog`, and `openAddTestDialog` so that external buttons can toggle the built-in dialogs.

---

## Consuming State via `useLabaratory`

Inside any descendant of `Labaratory`, call the hook to access live state and actions:

```tsx
import { useLabaratory } from "@/components/labaratory/context";

const RunButton = () => {
  const { runActiveOperation, endpoint } = useLabaratory();

  return (
    <button
      disabled={!endpoint}
      onClick={() => runActiveOperation(endpoint!, { env: { variables: {} } })}
    >
      Run
    </button>
  );
};
```

All actions returned by the hook (collections, operations, history, tabs, preflight, env, settings, tests) stay in sync with the UI.

---

## Persistence Example

The snippet below demonstrates how to persist operations and history to `localStorage` using the granular callbacks:

```tsx
const STORAGE_KEY = "labaratory-data";

const loadData = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const save = (partial: any) => {
  const current = loadData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
};

const data = loadData();

export function PersistentPlayground() {
  return (
    <Labaratory
      defaultOperations={data.operations ?? []}
      onOperationsChange={(operations) => save({ operations })}
      onOperationCreate={(operation) =>
        console.info("operation created", operation)
      }
      defaultHistory={data.history ?? []}
      onHistoryDelete={(history) => console.info("history deleted", history)}
      onHistoryChange={(history) => save({ history })}
    />
  );
}
```
