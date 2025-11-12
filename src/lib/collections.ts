import { useCallback, useState } from "react";
import type { LabaratoryOperation } from "@/lib/operations";
import type { LabaratoryTabsActions, LabaratoryTabsState } from "@/lib/tabs";

export interface LabaratoryCollectionOperation extends LabaratoryOperation {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface LabaratoryCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  operations: LabaratoryCollectionOperation[];
}

export interface LabaratoryCollectionsActions {
  addCollection: (
    collection: Omit<LabaratoryCollection, "id" | "createdAt" | "operations">
  ) => void;
  addOperationToCollection: (
    collectionId: string,
    operation: Omit<LabaratoryCollectionOperation, "createdAt">
  ) => void;
  deleteCollection: (collectionId: string) => void;
  deleteOperationFromCollection: (
    collectionId: string,
    operationId: string
  ) => void;
  updateCollection: (
    collectionId: string,
    collection: Omit<LabaratoryCollection, "id" | "createdAt">
  ) => void;
  updateOperationInCollection: (
    collectionId: string,
    operationId: string,
    operation: Omit<LabaratoryCollectionOperation, "id" | "createdAt">
  ) => void;
}

export interface LabaratoryCollectionsState {
  collections: LabaratoryCollection[];
}

export const useCollections = (props: {
  defaultCollections?: LabaratoryCollection[];
  onCollectionsChange?: (collections: LabaratoryCollection[]) => void;
  tabsApi?: LabaratoryTabsState & LabaratoryTabsActions;
}): LabaratoryCollectionsState & LabaratoryCollectionsActions => {
  const [collections, setCollections] = useState<LabaratoryCollection[]>(
    props.defaultCollections ?? []
  );

  const addCollection = useCallback(
    (
      collection: Omit<LabaratoryCollection, "id" | "createdAt" | "operations">
    ) => {
      const newCollections = [
        ...collections,
        {
          ...collection,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          operations: [],
        },
      ];
      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  const addOperation = useCallback(
    (
      collectionId: string,
      operation: Omit<LabaratoryCollectionOperation, "createdAt">
    ) => {
      const newCollections = collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              operations: [
                ...collection.operations,
                {
                  ...operation,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : collection
      );

      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  const deleteCollection = useCallback(
    (collectionId: string) => {
      const newCollections = collections.filter(
        (collection) => collection.id !== collectionId
      );
      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  const deleteOperation = useCallback(
    (collectionId: string, operationId: string) => {
      const newCollections = collections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              operations: collection.operations.filter(
                (operation) => operation.id !== operationId
              ),
            }
          : collection
      );
      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  const updateCollection = useCallback(
    (
      collectionId: string,
      collection: Omit<LabaratoryCollection, "id" | "createdAt">
    ) => {
      const newCollections = collections.map((c) =>
        c.id === collectionId ? { ...c, ...collection } : c
      );
      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  const updateOperation = useCallback(
    (
      collectionId: string,
      operationId: string,
      operation: Omit<LabaratoryCollectionOperation, "id" | "createdAt">
    ) => {
      const newCollections = collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              operations: c.operations.map((o) =>
                o.id === operationId ? { ...o, ...operation } : o
              ),
            }
          : c
      );
      setCollections(newCollections);
      props.onCollectionsChange?.(newCollections);
    },
    [collections, props]
  );

  return {
    collections,
    addCollection,
    addOperationToCollection: addOperation,
    deleteCollection,
    deleteOperationFromCollection: deleteOperation,
    updateCollection,
    updateOperationInCollection: updateOperation,
  };
};
