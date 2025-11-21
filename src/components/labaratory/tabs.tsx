import { useLabaratory } from "@/components/labaratory/context";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CirclePlus,
  FileIcon,
  FlaskConicalIcon,
  GlobeIcon,
  HistoryIcon,
  LockIcon,
  ScrollTextIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphQLIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import * as Sortable from "@/components/ui/sortable";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type {
  LabaratoryTab,
  LabaratoryTabOperation,
  LabaratoryTabTest,
} from "@/lib/tabs";
import { getOperationName, getOperationType } from "@/lib/operations.utils";
import { capitalize } from "lodash";

export const Tab = (props: {
  item: LabaratoryTab;
  activeTab: LabaratoryTab | null;
  setActiveTab: (tab: LabaratoryTab) => void;
  isOperationLoading: (id: string) => boolean;
  handleDeleteTab: (id: string) => void;
  handleDeleteAllTabs: () => void;
  handleDeleteOtherTabs: (excludeTabId: string) => void;
  isOverlay?: boolean;
}) => {
  const { history, operations, tests } = useLabaratory();
  const bypassMouseDownRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleMouseUp() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      bypassMouseDownRef.current = false;
    }

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const isActive = useMemo(() => {
    return props.activeTab?.id === props.item.id;
  }, [props.activeTab, props.item]);

  const historyItem = useMemo(() => {
    if (props.item.type !== "history") {
      return null;
    }

    return history.find(
      (h) => props.item.type === "history" && h.id === props.item.data.id
    );
  }, [history, props.item]);

  const operation = useMemo(() => {
    if (props.item.type !== "operation") {
      return null;
    }

    return operations.find(
      (o) => o.id === (props.item.data as LabaratoryTabOperation).id
    );
  }, [props.item, operations]);

  const test = useMemo(() => {
    if (props.item.type !== "test") {
      return null;
    }

    return tests.find(
      (t) => t.id === (props.item.data as LabaratoryTabTest).id
    );
  }, [props.item, tests]);

  const isError = useMemo(() => {
    if (!historyItem) {
      return false;
    }

    return (
      ("status" in historyItem && historyItem.status < 200) ||
      ("status" in historyItem && historyItem.status >= 300) ||
      ("response" in historyItem && JSON.parse(historyItem.response).errors)
    );
  }, [historyItem]);

  const closeTab = useCallback(() => {
    props.handleDeleteTab(props.item.id);
  }, [props]);

  const closeAllTabs = useCallback(() => {
    props.handleDeleteAllTabs();
  }, [props]);

  const closeOtherTabs = useCallback(() => {
    props.handleDeleteOtherTabs(props.item.id);
  }, [props]);

  const tabName = useMemo(() => {
    if (props.item.type === "operation") {
      const name =
        operation?.name ||
        getOperationName(operation?.query || "") ||
        "Untitled";

      if (name === "Untitled") {
        const type = capitalize(
          getOperationType(operation?.query || "") || "query"
        );

        return name + type;
      }

      return name;
    }

    if (props.item.type === "history") {
      const name =
        historyItem?.operation.name ||
        getOperationName(historyItem?.operation.query || "") ||
        "Untitled";

      if (name === "Untitled") {
        const type = capitalize(
          getOperationType(historyItem?.operation.query || "") || "query"
        );

        return name + type;
      }

      return name;
    }

    if (props.item.type === "preflight") {
      return "Preflight";
    }

    if (props.item.type === "env") {
      return "Environment Variables";
    }

    if (props.item.type === "settings") {
      return "Settings";
    }

    if (props.item.type === "test") {
      return test?.name || "Untitled";
    }

    return "Untitled";
  }, [props.item, historyItem, operation, test]);

  const tabIcon = useMemo(() => {
    if (props.item.type === "operation") {
      return <GraphQLIcon className="size-4 text-pink-500" />;
    }

    if (props.item.type === "preflight") {
      return <ScrollTextIcon className="size-4 text-teal-400" />;
    }

    if (props.item.type === "env") {
      return <GlobeIcon className="size-4 text-blue-400" />;
    }

    if (props.item.type === "history") {
      return (
        <HistoryIcon
          className={cn("size-4 text-indigo-400", {
            "text-green-500": !isError,
            "text-red-500": isError,
          })}
        />
      );
    }

    if (props.item.type === "settings") {
      return <SettingsIcon className="size-4 text-gray-400" />;
    }

    if (props.item.type === "test") {
      return <FlaskConicalIcon className="size-4 text-lime-400" />;
    }

    return <FileIcon className="size-4 text-muted-foreground" />;
  }, [props.item, isError]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Sortable.Item
          value={props.item.id}
          asHandle
          className={cn(
            "flex w-max items-stretch h-12.25 data-dragging:opacity-0",
            props.isOverlay && "bg-background",
            props.isOverlay && !isActive && "h-12"
          )}
        >
          <div
            onMouseDown={(e) => {
              if (bypassMouseDownRef.current) {
                return;
              }

              e.preventDefault();
              const event = {
                ...e,
              };

              timeoutRef.current = setTimeout(() => {
                bypassMouseDownRef.current = true;

                event.currentTarget.dispatchEvent(
                  new MouseEvent("mousedown", {
                    ...(event as unknown as MouseEventInit),
                  })
                );
              }, 200);
            }}
          >
            <div
              className={cn(
                "group h-full relative border-t-2 border-transparent pb-1 px-3 flex items-center gap-2 transition-all text-muted-foreground cursor-pointer hover:text-foreground",
                props.activeTab?.id === props.item.id &&
                  "border-primary bg-card text-foreground-primary"
              )}
              onClick={() => {
                props.setActiveTab(props.item);
              }}
              onMouseUp={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }

                bypassMouseDownRef.current = false;
              }}
            >
              {tabIcon}
              {tabName}
              {props.isOperationLoading(props.item.id) && (
                <Spinner className="size-3" />
              )}
              {props.item.readOnly && (
                <LockIcon className="size-3 text-gray-400" />
              )}
              <XIcon
                className="size-3 text-muted-foreground"
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  props.handleDeleteTab(props.item.id);
                }}
              />
            </div>
          </div>
          <div className="w-px mb-px bg-border" />
        </Sortable.Item>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={closeTab}>Close</ContextMenuItem>
        <ContextMenuItem onClick={closeOtherTabs}>Close other</ContextMenuItem>
        <ContextMenuItem onClick={closeAllTabs}>Close all</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const Tabs = ({ className }: { className?: string }) => {
  const {
    tabs,
    setTabs,
    activeTab,
    addTab,
    deleteTab,
    operations,
    setActiveTab,
    addOperation,
    setOperations,
    deleteOperation,
    isOperationLoading,
  } = useLabaratory();

  const handleAddOperation = useCallback(() => {
    const newOperation = addOperation({
      name: "",
      query: "",
      variables: "",
      headers: "",
      extensions: "",
    });

    const tab = addTab({
      type: "operation",
      data: newOperation,
    });

    setActiveTab(tab);
  }, [addOperation, addTab, setActiveTab]);

  const handleDeleteTab = useCallback(
    (tabId: string) => {
      const tabIndex = tabs.findIndex((t) => t.id === tabId);

      if (tabIndex === -1) {
        return;
      }

      const tab = tabs[tabIndex];

      if (tab.type === "operation") {
        deleteOperation(tab.data.id);
      }

      deleteTab(tab.id);

      if (tabIndex === 0) {
        setActiveTab(tabs[1] ?? null);
      } else if (tabIndex > 0) {
        setActiveTab(tabs[tabIndex - 1] ?? null);
      } else {
        setActiveTab(tabs[0] ?? null);
      }
    },
    [tabs, deleteTab, deleteOperation, setActiveTab]
  );

  const handleDeleteAllTabs = useCallback(() => {
    setOperations([]);
    setTabs([]);
  }, [setOperations, setTabs]);

  const handleDeleteOtherTabs = useCallback(
    (excludeTabId: string) => {
      const newActiveTab = tabs.find((t) => t.id === excludeTabId);

      if (newActiveTab) {
        const tabsToDelete = tabs.filter((t) => t.id !== excludeTabId);
        const operationsToDelete = tabsToDelete
          .filter((t) => t.type === "operation")
          .map((t) => t.data.id);

        setOperations(
          operations.filter((o) => !operationsToDelete.includes(o.id))
        );

        setTabs([newActiveTab]);
        setActiveTab(newActiveTab);
      }
    },
    [tabs, setOperations, operations, setTabs, setActiveTab]
  );

  return (
    <div
      className={cn("w-full overflow-hidden h-full relative z-10", className)}
    >
      <div className="absolute bottom-0 left-0 h-px bg-border w-full -z-10" />
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex items-stretch">
          <Sortable.Root
            value={tabs}
            onValueChange={setTabs}
            getItemValue={(item: LabaratoryTab) => item.id}
            orientation="horizontal"
          >
            <Sortable.Content className="flex w-max items-stretch">
              {tabs.map((item) => {
                return (
                  <>
                    <Tab
                      key={item.id}
                      item={item}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      isOperationLoading={isOperationLoading}
                      handleDeleteTab={handleDeleteTab}
                      handleDeleteAllTabs={handleDeleteAllTabs}
                      handleDeleteOtherTabs={handleDeleteOtherTabs}
                    />
                  </>
                );
              })}
            </Sortable.Content>
            <Sortable.Overlay>
              {(activeItem) => {
                const tab = tabs.find((t) => t.id === activeItem.value);

                if (!tab) {
                  return null;
                }

                return (
                  <Tab
                    item={tab}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOperationLoading={isOperationLoading}
                    handleDeleteTab={handleDeleteTab}
                    isOverlay={true}
                    handleDeleteAllTabs={handleDeleteAllTabs}
                    handleDeleteOtherTabs={handleDeleteOtherTabs}
                  />
                );
              }}
            </Sortable.Overlay>
          </Sortable.Root>
          <div className="group border-b-2 border-transparent ml-2 flex items-center h-12.25">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
              onClick={handleAddOperation}
            >
              <CirclePlus className="size-4" />
              Add operation
            </Button>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
