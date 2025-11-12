import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addArgToField,
  addPathToQuery,
  deletePathFromQuery,
  getOperationName,
  handleTemplate,
  removeArgFromField,
} from "@/lib/operations.utils";
import type { GraphQLSchema } from "graphql";
import type {
  LabaratoryCollectionOperation,
  LabaratoryCollectionsActions,
  LabaratoryCollectionsState,
} from "@/lib/collections";
import { decompressFromEncodedURIComponent } from "lz-string";
import { createClient } from "graphql-ws";
import type { LabaratoryTabsActions, LabaratoryTabsState } from "@/lib/tabs";
import type {
  LabaratoryEnvState,
  LabaratoryEnvActions,
  LabaratoryEnv,
} from "@/lib/env";
import type {
  LabaratoryPreflightState,
  LabaratoryPreflightActions,
} from "@/lib/preflight";

export interface LabaratoryOperation {
  id: string;
  name: string;
  query: string;
  variables: string;
  headers: string;
  extensions: string;
}

export interface LabaratoryOperationsState {
  operations: LabaratoryOperation[];
  activeOperation: LabaratoryOperation | null;
}

export interface LabaratoryOperationsActions {
  setActiveOperation: (operationId: string) => void;
  addOperation: (
    operation: Omit<LabaratoryOperation, "id"> & { id?: string }
  ) => LabaratoryOperation;
  setOperations: (operations: LabaratoryOperation[]) => void;
  updateActiveOperation: (
    operation: Partial<Omit<LabaratoryOperation, "id">>
  ) => void;
  deleteOperation: (operationId: string) => void;
  addPathToActiveOperation: (path: string) => void;
  deletePathFromActiveOperation: (path: string) => void;
  addArgToActiveOperation: (
    path: string,
    argName: string,
    schema: GraphQLSchema
  ) => void;
  deleteArgFromActiveOperation: (path: string, argName: string) => void;
  runActiveOperation: (
    endpoint: string,
    options?: {
      env?: LabaratoryEnv;
      onResponse?: (response: string) => void;
    }
  ) => Promise<Response | null>;
  stopActiveOperation: (() => void) | null;
  isActiveOperationLoading: boolean;
  isOperationLoading: (operationId: string) => boolean;
  isOperationSubscription: (operation: LabaratoryOperation) => boolean;
  isActiveOperationSubscription: boolean;
}

export const useOperations = (props: {
  defaultOperations?: LabaratoryOperation[];
  defaultActiveOperationId?: string;
  onOperationsChange?: (operations: LabaratoryOperation[]) => void;
  onActiveOperationIdChange?: (operationId: string) => void;
  collectionsApi?: LabaratoryCollectionsState & LabaratoryCollectionsActions;
  tabsApi?: LabaratoryTabsState & LabaratoryTabsActions;
  envApi?: LabaratoryEnvState & LabaratoryEnvActions;
  preflightApi?: LabaratoryPreflightState & LabaratoryPreflightActions;
}): LabaratoryOperationsState & LabaratoryOperationsActions => {
  const [operations, _setOperations] = useState<LabaratoryOperation[]>(
    props.defaultOperations ?? []
  );

  const activeOperation = useMemo(() => {
    const tab = props.tabsApi?.activeTab;

    if (!tab) {
      return null;
    }

    if (tab.type === "operation") {
      return operations.find((o) => o.id === tab.data.id) ?? null;
    }

    return null;
  }, [props.tabsApi, operations]);

  const setActiveOperation = useCallback(
    (operationId: string) => {
      const tab =
        props.tabsApi?.tabs.find(
          (t) => t.type === "operation" && t.data.id === operationId
        ) ?? null;

      if (!tab) {
        return;
      }

      props.tabsApi?.setActiveTab(tab);
    },
    [props.tabsApi]
  );

  const setOperations = useCallback(
    (operations: LabaratoryOperation[]) => {
      _setOperations(operations);
      props.onOperationsChange?.(operations);
    },
    [props]
  );

  const addOperation = useCallback(
    (operation: Omit<LabaratoryOperation, "id"> & { id?: string }) => {
      const newOperation = { id: crypto.randomUUID(), ...operation };

      _setOperations((prev) => [...prev, newOperation]);

      return newOperation;
    },
    []
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const share = urlParams.get("share");

    if (share) {
      const payload = decompressFromEncodedURIComponent(share);

      if (payload) {
        const { n, q, v, h, e } = JSON.parse(payload);

        const operation = addOperation({
          name: n,
          query: q,
          variables: v,
          headers: h,
          extensions: e,
        });

        props.tabsApi?.addTab({
          type: "operation",
          data: operation,
        });
      }
    }
  }, [addOperation, props.tabsApi]);

  const updateActiveOperation = useCallback(
    (operation: Partial<Omit<LabaratoryOperation, "id">>) => {
      const updatedOperation = { ...activeOperation, ...operation };

      if (updatedOperation.query) {
        const parsedName = getOperationName(updatedOperation.query);

        if (parsedName) {
          updatedOperation.name = parsedName;
        }
      }

      const newOperations = operations.map((o) =>
        o.id === activeOperation?.id
          ? (updatedOperation as LabaratoryOperation)
          : o
      );

      _setOperations(newOperations);

      props.onOperationsChange?.(newOperations);

      if (props.collectionsApi && activeOperation?.id) {
        const collectionId =
          props.collectionsApi.collections.find((c) =>
            c.operations.some((o) => o.id === activeOperation.id)
          )?.id ?? "";

        props.collectionsApi.updateOperationInCollection(
          collectionId,
          activeOperation.id,
          updatedOperation as LabaratoryCollectionOperation
        );
      }
    },
    [activeOperation, operations, props]
  );

  const deleteOperation = useCallback(
    (operationId: string) => {
      const newOperations = operations.filter((o) => o.id !== operationId);
      _setOperations(newOperations);

      props.onOperationsChange?.(newOperations);

      if (activeOperation?.id === operationId) {
        setActiveOperation(newOperations[0]?.id ?? "");
      }
    },
    [activeOperation, operations, props, setActiveOperation]
  );

  const addPathToActiveOperation = useCallback(
    (path: string) => {
      if (!activeOperation) {
        return;
      }
      const newActiveOperation = {
        ...activeOperation,
        query: addPathToQuery(activeOperation.query, path),
      };
      updateActiveOperation(newActiveOperation);
    },
    [activeOperation, updateActiveOperation]
  );

  const deletePathFromActiveOperation = useCallback(
    (path: string) => {
      if (!activeOperation || !activeOperation.query) {
        return;
      }

      const newActiveOperation = {
        ...activeOperation,
        query: deletePathFromQuery(activeOperation.query, path),
      };
      updateActiveOperation(newActiveOperation);
    },
    [activeOperation, updateActiveOperation]
  );

  const addArgToActiveOperation = useCallback(
    (path: string, argName: string, schema: GraphQLSchema) => {
      if (!activeOperation || !activeOperation.query) {
        return;
      }

      const newActiveOperation = {
        ...activeOperation,
        query: addArgToField(activeOperation.query, path, argName, schema),
      };
      updateActiveOperation(newActiveOperation);
    },
    [activeOperation, updateActiveOperation]
  );

  const deleteArgFromActiveOperation = useCallback(
    (path: string, argName: string) => {
      if (!activeOperation || !activeOperation.query) {
        return;
      }

      const newActiveOperation = {
        ...activeOperation,
        query: removeArgFromField(activeOperation.query, path, argName),
      };
      updateActiveOperation(newActiveOperation);
    },
    [activeOperation, updateActiveOperation]
  );

  const [stopOperationsFunctions, setStopOperationsFunctions] = useState<
    Record<string, () => void>
  >({});

  const isOperationLoading = useCallback(
    (operationId: string) => {
      return Object.keys(stopOperationsFunctions).includes(operationId);
    },
    [stopOperationsFunctions]
  );

  const isActiveOperationLoading = useMemo(() => {
    return activeOperation ? isOperationLoading(activeOperation.id) : false;
  }, [activeOperation, isOperationLoading]);

  const runActiveOperation = useCallback(
    async (
      endpoint: string,
      options?: {
        env?: LabaratoryEnv;
        onResponse?: (response: string) => void;
      }
    ) => {
      if (!activeOperation || !activeOperation.query) {
        return null;
      }

      const env: LabaratoryEnv = options?.env ??
        (await props.preflightApi
          ?.runPreflight?.()
          ?.then((result) => result?.env ?? { variables: {} })) ?? {
          variables: {},
        };

      props.envApi?.setEnv(env);

      const headers = activeOperation.headers
        ? JSON.parse(handleTemplate(activeOperation.headers, env))
        : {};
      const variables = activeOperation.variables
        ? JSON.parse(handleTemplate(activeOperation.variables, env))
        : {};
      const extensions = activeOperation.extensions
        ? JSON.parse(handleTemplate(activeOperation.extensions, env))
        : {};

      if (activeOperation.query.startsWith("subscription")) {
        const client = createClient({
          url: endpoint.replace("http", "ws"),
          connectionParams: {
            ...headers,
          },
        });

        client.on("connected", () => {
          console.log("connected");
        });

        client.on("error", () => {
          setStopOperationsFunctions((prev) => {
            const newStopOperationsFunctions = { ...prev };
            delete newStopOperationsFunctions[activeOperation.id];
            return newStopOperationsFunctions;
          });
        });

        client.on("closed", () => {
          setStopOperationsFunctions((prev) => {
            const newStopOperationsFunctions = { ...prev };
            delete newStopOperationsFunctions[activeOperation.id];
            return newStopOperationsFunctions;
          });
        });

        client.subscribe(
          {
            query: activeOperation.query,
            variables,
            extensions,
          },
          {
            next: (message) => {
              options?.onResponse?.(JSON.stringify(message ?? {}));
            },
            error: () => {},
            complete: () => {},
          }
        );

        setStopOperationsFunctions((prev) => ({
          ...prev,
          [activeOperation.id]: () => {
            client.dispose();
            setStopOperationsFunctions((prev) => {
              const newStopOperationsFunctions = { ...prev };
              delete newStopOperationsFunctions[activeOperation.id];
              return newStopOperationsFunctions;
            });
          },
        }));

        return Promise.resolve(new Response());
      } else {
        const abortController = new AbortController();

        const response = fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({
            query: activeOperation.query,
            variables,
            extensions,
          }),
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          signal: abortController.signal,
        }).finally(() => {
          setStopOperationsFunctions((prev) => {
            const newStopOperationsFunctions = { ...prev };
            delete newStopOperationsFunctions[activeOperation.id];

            return newStopOperationsFunctions;
          });
        });

        setStopOperationsFunctions((prev) => ({
          ...prev,
          [activeOperation.id]: () => abortController.abort(),
        }));

        return response;
      }
    },
    [activeOperation, props.preflightApi, props.envApi]
  );

  const isOperationSubscription = useCallback(
    (operation: LabaratoryOperation) => {
      return operation.query?.startsWith("subscription") ?? false;
    },
    []
  );

  const isActiveOperationSubscription = useMemo(() => {
    return activeOperation ? isOperationSubscription(activeOperation) : false;
  }, [activeOperation, isOperationSubscription]);

  return {
    operations,
    setOperations,
    runActiveOperation,
    setActiveOperation,
    activeOperation,
    addOperation,
    updateActiveOperation,
    deleteOperation,
    addPathToActiveOperation,
    deletePathFromActiveOperation,
    addArgToActiveOperation,
    deleteArgFromActiveOperation,
    isActiveOperationLoading,
    stopActiveOperation: stopOperationsFunctions[activeOperation?.id ?? ""],
    isActiveOperationSubscription,
    isOperationSubscription,
    isOperationLoading,
  };
};
