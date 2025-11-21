import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  FlaskConicalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useLabaratory } from "@/components/labaratory/context";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
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
import { useMemo, useState } from "react";
import { type LabaratoryTest } from "@/lib/tests";

export const TestItem = (props: { test: LabaratoryTest }) => {
  const { deleteTest, tabs, activeTab, addTab, setActiveTab } = useLabaratory();

  const isActive = useMemo(() => {
    return activeTab?.type === "test" && activeTab.data.id === props.test.id;
  }, [activeTab, props.test]);

  return (
    <Button
      variant="ghost"
      className={cn("group w-full justify-start px-2 gap-2", {
        "bg-accent dark:bg-accent/50": isActive,
      })}
      onClick={() => {
        const tab = tabs.find(
          (t) => t.type === "test" && t.data.id === props.test.id
        );

        if (tab) {
          setActiveTab(tab);
        } else {
          const newTab = addTab({
            type: "test",
            data: props.test,
          });
          setActiveTab(newTab);
        }
      }}
      size="sm"
    >
      <FlaskConicalIcon className="size-4 text-lime-400" />
      {props.test.name}
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
                  Are you sure you want to delete test {props.test.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {props.test.name} will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTest(props.test.id);
                    }}
                  >
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TooltipTrigger>
        <TooltipContent>Delete test</TooltipContent>
      </Tooltip>
    </Button>
  );
};

export const TestsSearchResult = (props: { items: LabaratoryTest[] }) => {
  const { tabs, addTab, setActiveTab } = useLabaratory();

  return (
    <div className="flex flex-col gap-1">
      {props.items.map((test) => {
        return (
          <Button
            key={test.name}
            variant="ghost"
            className={cn("group w-full justify-start px-2 gap-2", {
              // "bg-accent dark:bg-accent/50": isActive,
            })}
            size="sm"
            onClick={() => {
              const tab = tabs.find(
                (t) => t.type === "test" && t.data.id === test.id
              );

              if (tab) {
                setActiveTab(tab);
              } else {
                const newTab = addTab({
                  type: "test",
                  data: test,
                });
                setActiveTab(newTab);
              }
            }}
          >
            <FlaskConicalIcon className="size-4 text-lime-400" />
            {test.name}
          </Button>
        );
      })}
    </div>
  );
};

export const Tests = () => {
  const [search, setSearch] = useState("");
  const { tests, openAddTestDialog } = useLabaratory();

  const searchResults = useMemo(() => {
    return tests.filter((item) => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [tests, search]);

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 p-3 pb-0">
          <span className="text-md font-medium">Tests</span>
          <div className="ml-auto flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="p-1! size-6 rounded-sm"
                  onClick={openAddTestDialog}
                >
                  <PlusIcon className="size-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add test</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="relative p-3 border-b border-border">
          <SearchIcon className="size-4 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search..."
            className={cn("px-7")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="p-1! size-6 rounded-sm absolute right-5 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <XIcon className="size-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      <div className="w-full h-full overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="p-3 flex flex-col gap-1">
            {search.length > 0 ? (
              searchResults.length > 0 ? (
                <TestsSearchResult items={searchResults} />
              ) : (
                <Empty className="w-full px-0!">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchIcon className="size-6 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle className="text-md">
                      No results found
                    </EmptyTitle>
                    <EmptyDescription className="text-xs">
                      No tests found matching your search.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )
            ) : tests.length > 0 ? (
              tests.map((item) => <TestItem key={item.id} test={item} />)
            ) : (
              <Empty className="w-full px-0!">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FlaskConicalIcon className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle className="text-md">No tests yet</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    You haven't created any tests yet. Get started by adding
                    your first test.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openAddTestDialog}
                  >
                    Add test
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
};
