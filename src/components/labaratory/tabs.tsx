import { useLabaratory } from "@/components/labaratory/context";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CirclePlus,
  GlobeIcon,
  HistoryIcon,
  LockIcon,
  ScrollTextIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphQLIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/spinner";
import * as Sortable from "@/components/ui/sortable";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { LabaratoryTab } from "@/lib/tabs";

export const Tab = (props: {
  item: LabaratoryTab;
  activeTab: LabaratoryTab | null;
  setActiveTab: (tab: LabaratoryTab) => void;
  isOperationLoading: (id: string) => boolean;
  handleDeleteTab: (id: string) => void;
  isOverlay?: boolean;
}) => {
  const { history } = useLabaratory();
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

  const getHistoryItemName = useCallback(
    (historyItem: LabaratoryTab) => {
      if (historyItem.type !== "history") {
        return null;
      }

      return (
        history.find((h) => h.id === historyItem.data.id)?.operation.name ||
        "Untitled"
      );
    },
    [history]
  );

  return (
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
          {props.item.type === "operation" && (
            <GraphQLIcon className="size-4 text-pink-500" />
          )}
          {props.item.type === "preflight" && (
            <ScrollTextIcon className="size-4 text-teal-400" />
          )}
          {props.item.type === "env" && (
            <GlobeIcon className="size-4 text-blue-400" />
          )}
          {props.item.type === "history" && (
            <HistoryIcon className="size-4 text-gray-400" />
          )}
          {props.item.type === "operation" &&
            (props.item.data.name || "Untitled")}
          {props.item.type === "preflight" && "Preflight"}
          {props.item.type === "env" && "Environment Variables"}
          {props.item.type === "history" && getHistoryItemName(props.item)}
          {props.isOperationLoading(props.item.id) && (
            <Spinner className="size-3" />
          )}
          {props.item.readOnly && <LockIcon className="size-3 text-gray-400" />}
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
        <div className="w-px mb-px bg-border" />
      </div>
    </Sortable.Item>
  );
};

export const Tabs = ({ className }: { className?: string }) => {
  const {
    tabs,
    setTabs,
    activeTab,
    addTab,
    deleteTab,
    setActiveTab,
    addOperation,
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
                  <Tab
                    key={item.id}
                    item={item}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isOperationLoading={isOperationLoading}
                    handleDeleteTab={handleDeleteTab}
                  />
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
