import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CircleCheckIcon, CircleXIcon, ClockIcon } from "lucide-react";
import { useLabaratory } from "@/components/labaratory/context";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { LabaratoryHistoryRequest } from "@/lib/history";

export const HistoryOperationItem = (props: {
  historyItem: LabaratoryHistoryRequest;
}) => {
  const { addTab, setActiveTab } = useLabaratory();

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_auto_1fr_auto] gap-2 p-1 px-1.5 rounded-md hover:bg-accent dark:hover:bg-accent/50"
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
      <Badge
        className={cn("bg-green-400/10 text-green-500 p-1", {
          "bg-red-400/10 text-red-500":
            props.historyItem.status < 200 || props.historyItem.status >= 300,
        })}
      >
        {props.historyItem.status >= 200 && props.historyItem.status < 300 ? (
          <CircleCheckIcon className="size-3" />
        ) : (
          <CircleXIcon className="size-3" />
        )}
      </Badge>
      <div className="text-ellipsis overflow-hidden whitespace-nowrap">
        {props.historyItem.operation.name || "Untitled"}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span>{format(new Date(props.historyItem.createdAt), "HH:mm")}</span>
      </div>
    </div>
  );
};

export const History = () => {
  const { history } = useLabaratory();

  const historyItems = useMemo(() => {
    return history.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [history]);

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <div className="flex items-center gap-2 border-b border-border p-3 h-12.25">
        <span className="text-md font-medium">History</span>
      </div>
      <div className="w-full h-full overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="p-3 flex flex-col gap-1">
            {historyItems.length > 0 ? (
              historyItems.map((h) => {
                return (
                  <HistoryOperationItem
                    key={h.id}
                    historyItem={h as LabaratoryHistoryRequest}
                  />
                );
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
