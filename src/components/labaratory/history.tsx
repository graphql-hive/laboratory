import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ClockIcon,
  FolderClockIcon,
  FolderOpenIcon,
  HistoryIcon,
  TrashIcon,
} from "lucide-react";
import { useLabaratory } from "@/components/labaratory/context";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type {
  LabaratoryHistory,
  LabaratoryHistoryRequest,
} from "@/lib/history";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const HistoryOperationItem = (props: {
  historyItem: LabaratoryHistoryRequest;
}) => {
  const { activeTab, addTab, setActiveTab, deleteHistory } = useLabaratory();

  const isActive = useMemo(() => {
    return (
      activeTab?.type === "history" &&
      activeTab.data.id === props.historyItem.id
    );
  }, [activeTab, props.historyItem]);

  const isError = useMemo(() => {
    return (
      props.historyItem.status < 200 ||
      props.historyItem.status >= 300 ||
      ("response" in props.historyItem &&
        JSON.parse(props.historyItem.response).errors)
    );
  }, [props.historyItem]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "group sticky top-0 w-full justify-start px-2 bg-background",
        {
          "bg-accent dark:bg-accent/50": isActive,
        }
      )}
      onClick={() => {
        setActiveTab(
          addTab({
            type: "history",
            data: props.historyItem,
            readOnly: true,
          })
        );
      }}
    >
      <HistoryIcon
        className={cn("size-4 text-indigo-400", {
          "text-green-500":
            props.historyItem.status >= 200 && props.historyItem.status < 300,
          "text-red-500": isError,
        })}
      />
      <span className="text-muted-foreground">
        {format(new Date(props.historyItem.createdAt), "HH:mm")}
      </span>
      <div className="text-ellipsis overflow-hidden whitespace-nowrap">
        {props.historyItem.operation.name || "Untitled"}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="link"
                  className="ml-auto text-muted-foreground hover:text-destructive p-1! pr-0! opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <TrashIcon />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete history?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This history operation will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(props.historyItem.id);
                      }}
                    >
                      Delete
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent>Delete history</TooltipContent>
        </Tooltip>
      </div>
    </Button>
  );
};

export const HistoryGroup = (props: {
  group: { date: string; items: LabaratoryHistory[] };
}) => {
  const { deleteHistoryByDay } = useLabaratory();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group sticky top-0 w-full justify-start px-2 bg-background"
          size="sm"
        >
          {isOpen ? (
            <FolderOpenIcon className="size-4 text-muted-foreground" />
          ) : (
            <FolderClockIcon className="size-4 text-muted-foreground" />
          )}
          {props.group.date}
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="link"
                    className="ml-auto text-muted-foreground hover:text-destructive p-1! pr-0! opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete history?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      All history for {props.group.date} will be permanently
                      deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryByDay(props.group.date);
                        }}
                      >
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>Delete history</TooltipContent>
          </Tooltip>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "flex flex-col pl-2.25 gap-1 py-1 ml-4 border-l border-border"
        )}
      >
        {props.group.items.map((h) => {
          return (
            <HistoryOperationItem
              key={h.id}
              historyItem={h as LabaratoryHistoryRequest}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const History = () => {
  const { history, deleteAllHistory, tabs, setTabs, setActiveTab } =
    useLabaratory();

  const historyItems = useMemo(() => {
    return history.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [history]);

  const goupedByDate = useMemo(() => {
    return historyItems.reduce((acc, h) => {
      const date = format(new Date(h.createdAt), "dd MMM yyyy");
      let item = acc.find((i) => i.date === date);

      if (!item) {
        item = { date, items: [] };

        acc.push(item);
      }

      item.items.push(h);

      return acc;
    }, [] as { date: string; items: LabaratoryHistory[] }[]);
  }, [historyItems]);

  const handleDeleteAllHistory = useCallback(() => {
    deleteAllHistory();
    setTabs(tabs.filter((t) => t.type !== "history"));

    const newTab = tabs.find((t) => t.type !== "history");

    if (newTab) {
      setActiveTab(newTab);
    }
  }, [deleteAllHistory, setTabs, tabs, setActiveTab]);

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <div className="flex items-center gap-2 border-b border-border p-3 h-12.25">
        <span className="text-md font-medium">History</span>
        <div className="ml-auto flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="p-1! size-6  rounded-sm  text-muted-foreground hover:text-destructive"
                    disabled={history.length === 0}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete all history?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      All history will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAllHistory();
                        }}
                      >
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>Delete all</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="w-full h-full overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="p-3 flex flex-col gap-1">
            {goupedByDate.length > 0 ? (
              goupedByDate.map((group) => {
                return <HistoryGroup key={group.date} group={group} />;
              })
            ) : (
              <Empty className="w-full px-0!">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ClockIcon className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle className="text-md">No history yet</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    You haven't run any operations yet. Get started by running
                    your first operation.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
};
