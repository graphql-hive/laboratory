import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useLabaratory } from "@/components/labaratory/context";
import { Editor } from "@/components/labaratory/editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  BookmarkIcon,
  HistoryIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  FileTextIcon,
  PlayIcon,
  SquarePenIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  LabaratoryHistory,
  LabaratoryHistoryRequest,
  LabaratoryHistorySubscription,
} from "@/lib/history";
import { cn } from "@/lib/utils";
import { Tabs } from "@/components/tabs";
import { Toggle } from "@/components/ui/toggle";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { compressToEncodedURIComponent } from "lz-string";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Builder } from "@/components/labaratory/builder";
import type { LabaratoryOperation } from "@/lib/operations";

const Variables = (props: {
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const { activeOperation, updateActiveOperation } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  return (
    <Editor
      uri={monaco.Uri.file("variables.json")}
      value={operation?.variables ?? ""}
      onChange={(value) => {
        updateActiveOperation({
          variables: value ?? "",
        });
      }}
      options={{
        readOnly: props.isReadOnly,
      }}
    />
  );
};

const Headers = (props: {
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const { activeOperation, updateActiveOperation } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  return (
    <Editor
      uri={monaco.Uri.file("headers.json")}
      value={operation?.headers ?? ""}
      onChange={(value) => {
        updateActiveOperation({
          headers: value ?? "",
        });
      }}
      options={{
        readOnly: props.isReadOnly,
      }}
    />
  );
};

const Extensions = (props: {
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const { activeOperation, updateActiveOperation } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  return (
    <Editor
      uri={monaco.Uri.file("extensions.json")}
      value={operation?.extensions ?? ""}
      onChange={(value) => {
        updateActiveOperation({
          extensions: value ?? "",
        });
      }}
      options={{
        readOnly: props.isReadOnly,
      }}
    />
  );
};

export const ResponseBody = ({
  historyItem,
}: {
  historyItem?: LabaratoryHistory | null;
}) => {
  return (
    <Editor
      value={JSON.stringify(
        JSON.parse((historyItem as LabaratoryHistoryRequest)?.response ?? "{}"),
        null,
        2
      )}
      defaultLanguage="json"
      theme="hive-laboratory"
      options={{
        readOnly: true,
      }}
    />
  );
};

export const ResponseHeaders = ({
  historyItem,
}: {
  historyItem?: LabaratoryHistory | null;
}) => {
  return (
    <Editor
      value={JSON.stringify(
        JSON.parse((historyItem as LabaratoryHistoryRequest)?.headers ?? "{}"),
        null,
        2
      )}
      defaultLanguage="json"
      theme="hive-laboratory"
    />
  );
};

export const ResponsePreflight = ({
  historyItem,
}: {
  historyItem?: LabaratoryHistory | null;
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-3 gap-1.5">
        {historyItem?.preflightLogs?.map((log) => (
          <div className="gap-2 font-mono">
            <span className="text-xs text-muted-foreground">
              {log.createdAt}
            </span>{" "}
            <span
              className={cn("text-xs font-medium", {
                "text-green-400": log.level === "log",
                "text-yellow-400": log.level === "warn",
                "text-red-400": log.level === "error",
              })}
            >
              {log.level.toUpperCase()}
            </span>{" "}
            <span className="text-xs">{log.message.join(" ")}</span>
          </div>
        ))}
      </div>
      <ScrollBar />
    </ScrollArea>
  );
};

export const ResponseSubscription = ({
  historyItem,
}: {
  historyItem?: LabaratoryHistorySubscription | null;
}) => {
  const { isActiveOperationLoading } = useLabaratory();

  return (
    <div className="h-full flex flex-col">
      <div className="flex p-3 border-b border-border text-md font-medium h-12.25">
        Subscription
        <div className="ml-auto flex items-center gap-2">
          {isActiveOperationLoading ? (
            <Badge variant="default" className="bg-green-400/10 text-green-500">
              Listening
            </Badge>
          ) : (
            <Badge variant="default" className="bg-red-400/10 text-red-500">
              Not listening
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {historyItem?.responses
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((response) => {
                const value = [
                  `// ${response.createdAt}`,
                  "",
                  JSON.stringify(JSON.parse(response.data), null, 2),
                ].join("\n");

                const height = 20.5 * value.split("\n").length;

                return (
                  <div
                    className="border-b border-border"
                    style={{ height: `${height}px` }}
                  >
                    <Editor
                      key={response.createdAt}
                      value={value}
                      defaultLanguage="json"
                      theme="hive-laboratory"
                      options={{
                        readOnly: true,
                        scrollBeyondLastLine: false,
                        scrollbar: {
                          vertical: "hidden",
                          handleMouseWheel: false,
                          alwaysConsumeMouseWheel: false,
                        },
                      }}
                    />
                  </div>
                );
              })}
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
};

export const Response = ({
  historyItem,
}: {
  historyItem?: LabaratoryHistoryRequest | null;
}) => {
  const isError = useMemo(() => {
    if (!historyItem) {
      return false;
    }

    return (
      historyItem.status < 200 ||
      historyItem.status >= 300 ||
      ("response" in historyItem && JSON.parse(historyItem.response).errors)
    );
  }, [historyItem]);

  return (
    <Tabs
      suffix={
        historyItem ? (
          <div className="ml-auto flex items-center gap-2 pr-3">
            <Badge
              className={cn("bg-green-400/10 text-green-500", {
                "bg-red-400/10 text-red-500": isError,
              })}
            >
              {!isError ? (
                <CircleCheckIcon className="size-3" />
              ) : (
                <CircleXIcon className="size-3" />
              )}
              <span>{(historyItem as LabaratoryHistoryRequest).status}</span>
            </Badge>
            <Badge variant="outline" className="bg-card">
              <ClockIcon className="size-3" />
              <span>
                {Math.round((historyItem as LabaratoryHistoryRequest).duration)}
                ms
              </span>
            </Badge>
            <Badge variant="outline" className="bg-card">
              <FileTextIcon className="size-3" />
              <span>
                {Math.round(
                  (historyItem as LabaratoryHistoryRequest).size / 1024
                )}
                KB
              </span>
            </Badge>
          </div>
        ) : null
      }
    >
      <Tabs.Item label="Response">
        <ResponseBody historyItem={historyItem} />
      </Tabs.Item>
      <Tabs.Item label="Headers">
        <ResponseHeaders historyItem={historyItem} />
      </Tabs.Item>
      {historyItem?.preflightLogs && historyItem?.preflightLogs.length > 0 ? (
        <Tabs.Item label="Preflight">
          <ResponsePreflight historyItem={historyItem} />
        </Tabs.Item>
      ) : null}
    </Tabs>
  );
};

const saveToCollectionFormSchema = z.object({
  collectionId: z.string().min(1, "Collection is required"),
});

export const Query = (props: {
  onAfterOperationRun?: (historyItem: LabaratoryHistory | null) => void;
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const {
    endpoint,
    runActiveOperation,
    activeOperation,
    isActiveOperationLoading,
    updateActiveOperation,
    collections,
    addOperationToCollection,
    addHistory,
    stopActiveOperation,
    addResponseToHistory,
    isActiveOperationSubscription,
    runPreflight,
    addTab,
    setActiveTab,
    addOperation,
  } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  const handleRunOperation = useCallback(async () => {
    if (!operation || !endpoint) {
      return;
    }

    const result = await runPreflight?.();

    if (isActiveOperationSubscription) {
      const newItemHistory = addHistory({
        responses: [],
        operation: operation,
        preflightLogs: result?.logs ?? [],
        createdAt: new Date().toISOString(),
      } as Omit<LabaratoryHistorySubscription, "id">);

      runActiveOperation(endpoint, {
        env: result?.env,
        onResponse: (data) => {
          addResponseToHistory(newItemHistory.id, data);
        },
      });

      props.onAfterOperationRun?.(newItemHistory);
    } else {
      const startTime = performance.now();

      const response = await runActiveOperation(endpoint, {
        env: result?.env,
      });

      if (!response) {
        return;
      }

      const status = response.status;
      const duration = performance.now() - startTime;
      const responseText = await response.text();
      const size = responseText.length;

      const newItemHistory = addHistory({
        status,
        duration,
        size,
        headers: JSON.stringify(
          Object.fromEntries([...response.headers.entries()]),
          null,
          2
        ),
        operation: operation,
        preflightLogs: result?.logs ?? [],
        response: responseText,
        createdAt: new Date().toISOString(),
      } as Omit<LabaratoryHistoryRequest, "id">);

      props.onAfterOperationRun?.(newItemHistory);
    }
  }, [
    operation,
    endpoint,
    isActiveOperationSubscription,
    addHistory,
    runActiveOperation,
    props,
    addResponseToHistory,
    runPreflight,
  ]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();

        handleRunOperation();
      }
    };

    document.addEventListener("keydown", down, { capture: true });
    return () =>
      document.removeEventListener("keydown", down, { capture: true });
  }, [handleRunOperation]);

  const [isSaveToCollectionDialogOpen, setIsSaveToCollectionDialogOpen] =
    useState(false);

  const saveToCollectionForm = useForm({
    defaultValues: {
      collectionId: "",
    },
    validators: {
      onSubmit: saveToCollectionFormSchema,
    },
    onSubmit: ({ value }) => {
      if (!operation) {
        return;
      }

      addOperationToCollection(value.collectionId, {
        id: operation.id ?? "",
        name: operation.name ?? "",
        query: operation.query ?? "",
        variables: operation.variables ?? "",
        headers: operation.headers ?? "",
        extensions: operation.extensions ?? "",
        description: "",
      });

      setIsSaveToCollectionDialogOpen(false);
    },
  });

  const openSaveToCollectionDialog = useCallback(() => {
    saveToCollectionForm.reset({
      collectionId: collections[0]?.id ?? "",
    });

    setIsSaveToCollectionDialogOpen(true);
  }, [saveToCollectionForm, collections]);

  const isActiveOperationSavedToCollection = useMemo(() => {
    return collections.some((c) =>
      c.operations.some((o) => o.id === operation?.id)
    );
  }, [operation?.id, collections]);

  const share = useCallback(
    (options: {
      variables?: boolean;
      headers?: boolean;
      extensions?: boolean;
    }) => {
      const value = compressToEncodedURIComponent(
        JSON.stringify({
          n: operation?.name,
          q: operation?.query,
          v: options.variables ? operation?.variables : undefined,
          h: options.headers ? operation?.headers : undefined,
          e: options.extensions ? operation?.extensions : undefined,
        })
      );

      navigator.clipboard.writeText(`${window.location.origin}?share=${value}`);

      toast.success("Operation copied to clipboard");
    },
    [operation]
  );

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <Dialog
        open={isSaveToCollectionDialogOpen}
        onOpenChange={setIsSaveToCollectionDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add collection</DialogTitle>
            <DialogDescription>
              Add a new collection of operations to your labaratory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <form
              id="save-to-collection"
              onSubmit={(e) => {
                e.preventDefault();
                saveToCollectionForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <saveToCollectionForm.Field
                  name="collectionId"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Collection</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={isInvalid}
                          >
                            <SelectValue placeholder="Select collection" />
                          </SelectTrigger>
                          <SelectContent>
                            {collections.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </form>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form="save-to-collection">
              Save to collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center p-3 border-b border-border w-full gap-2">
        <span className="text-md font-medium">Operation</span>
        <Toggle
          aria-label="Save operation"
          size="sm"
          variant="default"
          pressed={isActiveOperationSavedToCollection}
          disabled={isActiveOperationSavedToCollection}
          className="h-6 data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500"
          onClick={openSaveToCollectionDialog}
        >
          <BookmarkIcon />
          {isActiveOperationSavedToCollection ? "Saved" : "Save"}
        </Toggle>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 rounded-sm">
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => share({ variables: true })}>
                Share with variables
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => share({ variables: true, extensions: true })}
              >
                Share with variables and extensions
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  share({ variables: true, headers: true, extensions: true })
                }
              >
                Share with variables, extensions, headers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!props.isReadOnly ? (
            <Button
              variant="default"
              size="sm"
              className="h-6 rounded-sm"
              onClick={() => {
                if (isActiveOperationLoading) {
                  stopActiveOperation?.();
                } else {
                  handleRunOperation();
                }
              }}
              disabled={!operation || !endpoint}
            >
              {isActiveOperationLoading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <PlayIcon className="size-4" />
                  <span>Run</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="h-6 rounded-sm"
              onClick={() => {
                if (!operation) {
                  return;
                }

                setActiveTab(
                  addTab({
                    type: "operation",
                    data: addOperation(operation),
                  })
                );
              }}
            >
              <SquarePenIcon className="size-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
      <div className="w-full h-full">
        <Editor
          uri={monaco.Uri.file("operation.graphql")}
          variablesUri={monaco.Uri.file("variables.json")}
          value={operation?.query ?? ""}
          onChange={(value) => {
            updateActiveOperation({
              query: value ?? "",
            });
          }}
          language="graphql"
          theme="hive-laboratory"
          options={{
            readOnly: props.isReadOnly,
          }}
        />
      </div>
    </div>
  );
};

export const Operation = (props: {
  operation?: LabaratoryOperation;
  historyItem?: LabaratoryHistory;
}) => {
  const { activeOperation, history } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  const historyItem = useMemo(() => {
    return (
      props.historyItem ??
      history
        .filter((h) => h.operation.id === operation?.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] ??
      null
    );
  }, [history, props.historyItem, operation?.id]);

  const isReadOnly = useMemo(() => {
    return !!props.historyItem;
  }, [props.historyItem]);

  return (
    <div className="w-full h-full bg-card">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel defaultSize={25}>
          <Builder operation={operation} isReadOnly={isReadOnly} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={10} defaultSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <Query operation={operation} isReadOnly={isReadOnly} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              minSize={10}
              defaultSize={30}
              className="overflow-visible!"
            >
              <Tabs>
                <Tabs.Item label="Variables">
                  <Variables operation={operation} isReadOnly={isReadOnly} />
                </Tabs.Item>
                <Tabs.Item label="Headers">
                  <Headers operation={operation} isReadOnly={isReadOnly} />
                </Tabs.Item>
                <Tabs.Item label="Extensions">
                  <Extensions operation={operation} isReadOnly={isReadOnly} />
                </Tabs.Item>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={10} defaultSize={35}>
          {historyItem ? (
            <>
              {"responses" in historyItem ? (
                <ResponseSubscription historyItem={historyItem} />
              ) : (
                <Response historyItem={historyItem} />
              )}
            </>
          ) : (
            <Empty className="w-full h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HistoryIcon className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No history yet</EmptyTitle>
                <EmptyDescription>
                  No response available yet. Run your operation to see the
                  response here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
