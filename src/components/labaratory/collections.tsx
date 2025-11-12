import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  SearchIcon,
  TrashIcon,
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
import type { LabaratoryCollection } from "@/lib/collections";
import { useState } from "react";
import { GraphQLIcon } from "@/components/icons";

export const CollectionItem = (props: { collection: LabaratoryCollection }) => {
  const {
    activeOperation,
    operations,
    addOperation,
    setActiveOperation,
    deleteCollection,
    deleteOperationFromCollection,
    addTab,
    setActiveTab,
  } = useLabaratory();

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
            <FolderIcon className="size-4 text-muted-foreground" />
          )}
          {props.collection.name}
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
                      Are you sure you want to delete collection?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {props.collection.name} will be permanently deleted. All
                      operations in this collection will be deleted as well.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCollection(props.collection.id);
                        }}
                      >
                        Delete
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>Delete collection</TooltipContent>
          </Tooltip>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "flex flex-col pl-2.25 gap-1 py-1 ml-4 border-l border-border"
        )}
      >
        {props.collection.operations.map((operation) => {
          const isActive = activeOperation?.id === operation.id;

          return (
            <Button
              key={operation.name}
              variant="ghost"
              className={cn("group w-full justify-start px-2 gap-2", {
                "bg-accent dark:bg-accent/50": isActive,
              })}
              size="sm"
              onClick={() => {
                if (operations.some((o) => o.id === operation.id)) {
                  setActiveOperation(operation.id);
                } else {
                  const newOperation = addOperation(operation);
                  const tab = addTab({
                    type: "operation",
                    data: newOperation,
                  });

                  setActiveTab(tab);
                }
              }}
            >
              <GraphQLIcon className="size-4 text-pink-500" />
              {operation.name}
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
                          Are you sure you want to delete operation{" "}
                          {operation.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {operation.name} will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOperationFromCollection(
                                props.collection.id,
                                operation.id
                              );
                            }}
                          >
                            Delete
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent>Delete operation</TooltipContent>
              </Tooltip>
            </Button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Collections = () => {
  const { collections, openAddCollectionDialog } = useLabaratory();

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-border p-3">
          <span className="text-md font-medium">Collections</span>
          <div className="ml-auto flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="p-1! size-6 rounded-sm"
                  onClick={openAddCollectionDialog}
                >
                  <FolderPlusIcon className="size-4 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add collection</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="relative border-b border-border">
          <SearchIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-9 border-none rounded-none h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      <div className="w-full h-full overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="p-3">
            {collections.length > 0 ? (
              collections.map((item) => (
                <CollectionItem key={item.id} collection={item} />
              ))
            ) : (
              <Empty className="w-full px-0!">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderIcon className="size-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle className="text-md">
                    No collections yet
                  </EmptyTitle>
                  <EmptyDescription className="text-xs">
                    You haven't created any collections yet. Get started by
                    adding your first collection.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openAddCollectionDialog}
                  >
                    Add collection
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
