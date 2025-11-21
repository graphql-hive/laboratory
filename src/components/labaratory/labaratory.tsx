import { Collections } from "@/components/labaratory/collections";
import { Command } from "@/components/labaratory/command";
import {
  LabaratoryProvider,
  useLabaratory,
  type LabaratoryApi,
} from "@/components/labaratory/context";
import { Operation } from "@/components/labaratory/operation";
import { Tabs } from "@/components/labaratory/tabs";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useCollections } from "@/lib/collections";
import { useEndpoint } from "@/lib/endpoint";
import { useHistory } from "@/lib/history";
import { useOperations } from "@/lib/operations";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  FlaskConicalIcon,
  FoldersIcon,
  HistoryIcon,
  SettingsIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTabs } from "@/lib/tabs";
import { Preflight } from "@/components/labaratory/preflight";
import { usePreflight } from "@/lib/preflight";
import { useEnv } from "@/lib/env";
import { Env } from "@/components/labaratory/env";
import { History } from "@/components/labaratory/history";
import { HistoryItem } from "@/components/labaratory/history-item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/lib/settings";
import { Settings } from "@/components/labaratory/settings";
import { useTests } from "@/lib/tests";
import { Tests } from "@/components/labaratory/tests";
import { Test } from "@/components/labaratory/test";

const addCollectionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const updateEndpointFormSchema = z.object({
  endpoint: z.string().min(1, "Endpoint is required"),
});

const addTestFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const PreflightPromptModal = (props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder: string;
  defaultValue?: string;
  onSubmit?: (value: string | null) => void;
}) => {
  const form = useForm({
    defaultValues: {
      value: props.defaultValue || null,
    },
    validators: {
      onSubmit: z.object({
        value: z.string().min(1, "Value is required").nullable(),
      }),
    },
    onSubmit: ({ value }) => {
      props.onSubmit?.(value.value || null);
      props.onOpenChange(false);
      form.reset();
    },
  });

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!form.state.isSubmitted) {
          form.handleSubmit();
        }

        props.onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preflight prompt</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter values for the preflight script.
        </DialogDescription>
        <form
          id="preflight-prompt-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="value"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ""}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={props.placeholder}
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="preflight-prompt-form"
            onClick={() => {
              form.handleSubmit();
            }}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LabaratoryContent = () => {
  const {
    activeTab,
    addOperation,
    collections,
    addTab,
    setActiveTab,
    preflight,
    tabs,
    env,
  } = useLabaratory();
  const [activePanel, setActivePanel] = useState<
    "collections" | "history" | "tests" | "settings" | null
  >(collections.length > 0 ? "collections" : null);
  const [commandOpen, setCommandOpen] = useState(false);

  const contentNode = useMemo(() => {
    switch (activeTab?.type) {
      case "operation":
        return <Operation />;
      case "preflight":
        return <Preflight />;
      case "env":
        return <Env />;
      case "history":
        return <HistoryItem />;
      case "settings":
        return <Settings />;
      case "test":
        return <Test />;
      default:
        return (
          <Empty className="w-full px-0!">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileIcon className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No operation selected</EmptyTitle>
              <EmptyDescription>
                You haven't selected any operation yet. Get started by selecting
                an operation or add a new one.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                onClick={() => {
                  const operation = addOperation({
                    name: "",
                    query: "",
                    variables: "",
                    headers: "",
                    extensions: "",
                  });

                  const tab = addTab({
                    type: "operation",
                    data: operation,
                  });

                  setActiveTab(tab);
                }}
              >
                Add operation
              </Button>
            </EmptyContent>
          </Empty>
        );
    }
  }, [activeTab?.type, addOperation, addTab, setActiveTab]);

  return (
    <div className="w-full h-full flex">
      <Command open={commandOpen} onOpenChange={setCommandOpen} />
      <div className="h-full w-12.25 flex flex-col">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full relative z-10 h-12.25 aspect-square flex items-center justify-center border-l-2 border-transparent",
                {
                  "border-primary": activePanel === "collections",
                }
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(
                    activePanel === "collections" ? null : "collections"
                  )
                }
                className={cn("text-muted-foreground hover:text-foreground", {
                  "text-foreground": activePanel === "collections",
                })}
              >
                <FoldersIcon className="size-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Collections</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full relative z-10 h-12.25 aspect-square flex items-center justify-center border-l-2 border-transparent",
                {
                  "border-primary": activePanel === "history",
                }
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "history" ? null : "history")
                }
                className={cn("text-muted-foreground hover:text-foreground", {
                  "text-foreground": activePanel === "history",
                })}
              >
                <HistoryIcon className="size-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">History</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full relative z-10 h-12.25 aspect-square flex items-center justify-center border-l-2 border-transparent",
                {
                  "border-primary": activePanel === "tests",
                }
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "tests" ? null : "tests")
                }
                className={cn("text-muted-foreground hover:text-foreground", {
                  "text-foreground": activePanel === "tests",
                })}
              >
                <FlaskConicalIcon className="size-5" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Tests</TooltipContent>
        </Tooltip>
        <div
          className={cn(
            "mt-auto w-full relative z-10 h-12.25 aspect-square flex items-center justify-center border-l-2 border-transparent",
            {
              "border-primary": activePanel === "settings",
            }
          )}
        >
          <Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setActivePanel(
                        activePanel === "history" ? null : "history"
                      )
                    }
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      {
                        "text-foreground": activePanel === "history",
                      }
                    )}
                  >
                    <SettingsIcon className="size-5" />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mb-2"
                align="start"
                side="right"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setCommandOpen(true)}>
                    Command Palette...
                    <DropdownMenuShortcut>⌘J</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    const tab =
                      tabs.find((t) => t.type === "env") ??
                      addTab({
                        type: "env",
                        data: env ?? { variables: {} },
                      });

                    setActiveTab(tab);
                  }}
                >
                  Environment Variables
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    const tab =
                      tabs.find((t) => t.type === "preflight") ??
                      addTab({
                        type: "preflight",
                        data: preflight ?? { script: "" },
                      });

                    setActiveTab(tab);
                  }}
                >
                  Preflight Script
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    const tab =
                      tabs.find((t) => t.type === "settings") ??
                      addTab({
                        type: "settings",
                        data: {},
                      });

                    setActiveTab(tab);
                  }}
                >
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        <ResizablePanel
          minSize={10}
          defaultSize={17}
          hidden={!activePanel}
          className="border-l"
        >
          {activePanel === "collections" && <Collections />}
          {activePanel === "history" && <History />}
          {activePanel === "tests" && <Tests />}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={10} defaultSize={83} className="flex flex-col">
          <div className="w-full">
            <Tabs />
          </div>
          <div className="flex-1 overflow-hidden">{contentNode}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export type LabaratoryProps = LabaratoryApi;

export const Labaratory = (
  props: Pick<
    LabaratoryProps,
    | "defaultEndpoint"
    | "onEndpointChange"
    | "defaultCollections"
    | "onCollectionsChange"
    | "onCollectionCreate"
    | "onCollectionUpdate"
    | "onCollectionDelete"
    | "onCollectionOperationCreate"
    | "onCollectionOperationUpdate"
    | "onCollectionOperationDelete"
    | "defaultOperations"
    | "onOperationsChange"
    | "defaultActiveOperationId"
    | "onActiveOperationIdChange"
    | "onOperationCreate"
    | "onOperationUpdate"
    | "onOperationDelete"
    | "defaultHistory"
    | "onHistoryChange"
    | "onHistoryCreate"
    | "onHistoryUpdate"
    | "onHistoryDelete"
    | "defaultTabs"
    | "onTabsChange"
    | "defaultPreflight"
    | "onPreflightChange"
    | "defaultEnv"
    | "onEnvChange"
    | "defaultActiveTabId"
    | "onActiveTabIdChange"
    | "defaultSettings"
    | "onSettingsChange"
    | "defaultTests"
    | "onTestsChange"
  >
) => {
  const settingsApi = useSettings(props);
  const envApi = useEnv(props);
  const preflightApi = usePreflight({
    ...props,
    envApi,
  });
  const testsApi = useTests(props);
  const tabsApi = useTabs(props);
  const endpointApi = useEndpoint(props);
  const collectionsApi = useCollections({
    ...props,
    tabsApi,
  });
  const operationsApi = useOperations({
    ...props,
    collectionsApi,
    tabsApi,
    envApi,
    preflightApi,
  });
  const historyApi = useHistory(props);

  const [isAddCollectionDialogOpen, setIsCollectionDialogOpen] =
    useState(false);

  const [isUpdateEndpointDialogOpen, setIsUpdateEndpointDialogOpen] =
    useState(false);

  const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);

  const openAddCollectionDialog = useCallback(() => {
    setIsCollectionDialogOpen(true);
  }, []);

  const openUpdateEndpointDialog = useCallback(() => {
    setIsUpdateEndpointDialogOpen(true);
  }, []);

  const openAddTestDialog = useCallback(() => {
    setIsAddTestDialogOpen(true);
  }, []);

  const addCollectionForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: addCollectionFormSchema,
    },
    onSubmit: ({ value }) => {
      collectionsApi.addCollection({
        name: value.name,
      });
      setIsCollectionDialogOpen(false);
    },
  });

  const updateEndpointForm = useForm({
    defaultValues: {
      endpoint: endpointApi.endpoint ?? "",
    },
    validators: {
      onSubmit: updateEndpointFormSchema,
    },
    onSubmit: ({ value }) => {
      endpointApi.setEndpoint(value.endpoint);
      setIsUpdateEndpointDialogOpen(false);
    },
  });

  const addTestForm = useForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onSubmit: addTestFormSchema,
    },
    onSubmit: ({ value }) => {
      testsApi.addTest({ name: value.name });
      setIsAddTestDialogOpen(false);
    },
  });

  const [isPreflightPromptModalOpen, setIsPreflightPromptModalOpen] =
    useState(false);

  const [preflightPromptModalProps, setPreflightPromptModalProps] = useState<{
    placeholder: string;
    defaultValue?: string;
    onSubmit?: (value: string | null) => void;
  }>({
    placeholder: "",
    defaultValue: undefined,
    onSubmit: undefined,
  });

  const openPreflightPromptModal = useCallback(
    (props: {
      placeholder: string;
      defaultValue?: string;
      onSubmit?: (value: string | null) => void;
    }) => {
      setIsPreflightPromptModalOpen(true);

      setPreflightPromptModalProps({
        placeholder: props.placeholder,
        defaultValue: props.defaultValue,
        onSubmit: props.onSubmit,
      });

      setIsPreflightPromptModalOpen(true);
    },
    []
  );

  return (
    <div className="hive-labaratory w-full h-full">
      <Toaster richColors closeButton position="top-right" />
      <Dialog
        open={isUpdateEndpointDialogOpen}
        onOpenChange={setIsUpdateEndpointDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update endpoint</DialogTitle>
            <DialogDescription>
              Update the endpoint of your labaratory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <form
              id="update-endpoint-form"
              onSubmit={(e) => {
                e.preventDefault();
                updateEndpointForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <updateEndpointForm.Field
                  name="endpoint"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter endpoint"
                        autoComplete="off"
                      />
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
            <Button type="submit" form="update-endpoint-form">
              Update endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PreflightPromptModal
        open={isPreflightPromptModalOpen}
        onOpenChange={setIsPreflightPromptModalOpen}
        {...preflightPromptModalProps}
      />
      <Dialog
        open={isAddCollectionDialogOpen}
        onOpenChange={setIsCollectionDialogOpen}
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
              id="add-collection-form"
              onSubmit={(e) => {
                e.preventDefault();
                addCollectionForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <addCollectionForm.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter name of the collection"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
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
            <Button type="submit" form="add-collection-form">
              Add collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddTestDialogOpen} onOpenChange={setIsAddTestDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add test</DialogTitle>
            <DialogDescription>
              Add a new test to your labaratory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <form
              id="add-test-form"
              onSubmit={(e) => {
                e.preventDefault();
                addTestForm.handleSubmit();
              }}
            >
              <FieldGroup>
                <addTestForm.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter name of the test"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
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
            <Button type="submit" form="add-test-form">
              Add test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LabaratoryProvider
        {...props}
        {...testsApi}
        {...settingsApi}
        {...envApi}
        {...preflightApi}
        {...tabsApi}
        {...endpointApi}
        {...collectionsApi}
        {...operationsApi}
        {...historyApi}
        openAddCollectionDialog={openAddCollectionDialog}
        openUpdateEndpointDialog={openUpdateEndpointDialog}
        openAddTestDialog={openAddTestDialog}
        openPreflightPromptModal={openPreflightPromptModal}
      >
        <LabaratoryContent />
      </LabaratoryProvider>
    </div>
  );
};
