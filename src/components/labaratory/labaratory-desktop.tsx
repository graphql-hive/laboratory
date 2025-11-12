import { Builder } from "@/components/labaratory/builder";
import { Collections } from "@/components/labaratory/collections";
import { Command } from "@/components/labaratory/command";
import {
  LabaratoryProvider,
  useLabaratory,
  type LabaratoryContextProps,
} from "@/components/labaratory/context";
// import { History } from "@/components/labaratory/history";
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
  ArrowRightIcon,
  FileIcon,
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
import { Badge } from "@/components/ui/badge";
import { useTabs } from "@/lib/tabs";
import { Preflight } from "@/components/labaratory/preflight";
import { usePreflight } from "@/lib/preflight";
import { useEnv } from "@/lib/env";
import { Env } from "@/components/labaratory/env";
import { History } from "@/components/labaratory/history";

const addCollectionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const updateEndpointFormSchema = z.object({
  endpoint: z.string().min(1, "Endpoint is required"),
});

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
    "collections" | "history" | "settings" | null
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
        <div
          className={cn(
            "mt-auto w-full relative z-10 h-12.25 aspect-square flex items-center justify-center border-l-2 border-transparent",
            {
              "border-primary": activePanel === "settings",
            }
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
                <SettingsIcon className="size-5" />
              </Button>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        <ResizablePanel
          minSize={10}
          defaultSize={20}
          hidden={!activePanel}
          className="border-l"
        >
          {activePanel === "collections" && <Collections />}
          {activePanel === "history" && <History />}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={10} defaultSize={20} className="bg-card">
          <Builder />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={10} defaultSize={60} className="flex flex-col">
          <div className="w-full">
            <Tabs />
          </div>
          {contentNode}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export type LabaratoryProps = LabaratoryContextProps;

export const Labaratory = (
  props: Pick<
    LabaratoryProps,
    | "defaultEndpoint"
    | "onEndpointChange"
    | "defaultCollections"
    | "onCollectionsChange"
    | "defaultOperations"
    | "onOperationsChange"
    | "defaultActiveOperationId"
    | "onActiveOperationIdChange"
    | "defaultHistory"
    | "onHistoryChange"
    | "defaultTabs"
    | "onTabsChange"
    | "defaultPreflight"
    | "onPreflightChange"
    | "defaultEnv"
    | "onEnvChange"
    | "defaultActiveTabId"
    | "onActiveTabIdChange"
  >
) => {
  const envApi = useEnv(props);
  const preflightApi = usePreflight({
    ...props,
    envApi,
  });
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

  const openAddCollectionDialog = useCallback(() => {
    setIsCollectionDialogOpen(true);
  }, []);

  const openUpdateEndpointDialog = useCallback(() => {
    setIsUpdateEndpointDialogOpen(true);
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

  let result: React.ReactNode = null;

  if (!endpointApi.endpoint) {
    result = (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="absolute left-4 top-4 flex items-center gap-1.5">
          <svg
            width="51"
            height="54"
            viewBox="0 0 51 54"
            fill="currentColor"
            className="h-9 w-auto"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M2.06194 20.2745C2.68522 20.4867 3.35002 20.6073 4.04393 20.6073C4.6672 20.6073 5.26838 20.5117 5.83612 20.3391V36.7481C5.83612 37.328 6.14561 37.8684 6.64488 38.1582L22.3391 47.2835C23.0814 46.4108 24.1808 45.8554 25.4084 45.8554C26.7446 45.8554 27.927 46.5134 28.6639 47.5218C28.6769 47.5403 28.6909 47.5576 28.7039 47.5756C28.7557 47.6494 28.8041 47.7248 28.8511 47.8026L28.9049 47.891C28.9465 47.9626 28.9849 48.0355 29.0214 48.1093C29.0414 48.1489 29.0603 48.1891 29.0792 48.2294C29.1105 48.2978 29.14 48.3673 29.1681 48.4378C29.1881 48.4882 29.2059 48.5388 29.2237 48.5899C29.2462 48.6544 29.2684 48.7195 29.2873 48.7852C29.3056 48.8477 29.3202 48.9107 29.3359 48.9737L29.3762 49.1513C29.3918 49.23 29.4021 49.3097 29.4129 49.3902C29.4188 49.4379 29.428 49.4847 29.4323 49.5324C29.4448 49.6627 29.4523 49.7941 29.4523 49.9277C29.4523 50.1406 29.4313 50.3474 29.3994 50.5516L29.3881 50.6275C29.0576 52.5406 27.4007 54 25.4084 54C23.6318 54 22.1227 52.8386 21.5809 51.2314L4.7578 41.4502C3.08905 40.4806 2.06194 38.6876 2.06194 36.7481V20.2745ZM46.0991 10.2908C48.3291 10.2908 50.1428 12.1173 50.1428 14.3631C50.1428 15.5848 49.6037 16.6794 48.755 17.4265V36.7481C48.755 38.6876 47.7279 40.4806 46.0591 41.4502L31.6051 49.8539C31.5889 48.479 31.1274 47.2135 30.3619 46.1876L44.1722 38.1582C44.6713 37.8684 44.9809 37.328 44.9809 36.7481V18.2736C43.2938 17.7838 42.0554 16.2179 42.0554 14.3631C42.0554 13.4601 42.3524 12.6277 42.8485 11.9517C42.856 11.9409 42.8641 11.9306 42.8717 11.9197C42.9655 11.7948 43.0657 11.6743 43.1725 11.5608L43.187 11.545C43.4086 11.3127 43.6567 11.1079 43.9274 10.9337C43.9553 10.9152 43.985 10.8984 44.0136 10.8804C44.1209 10.8158 44.2303 10.755 44.3435 10.7002C44.3765 10.6844 44.4094 10.6671 44.4427 10.6519C44.5846 10.5878 44.7291 10.5286 44.879 10.4814C44.879 10.4819 44.8796 10.4814 44.879 10.4814L45.173 10.3994C45.4705 10.3287 45.7805 10.2908 46.0991 10.2908ZM40.5727 19.0708V32.5386C40.5727 34.1339 39.7202 35.6206 38.3486 36.4181L27.5398 42.696L26.5424 43.2466L26.5543 42.0944V37.3194L35.4506 32.1471V27.4102L27.8779 25.24L40.5727 19.0708ZM10.2444 19.0627L15.3665 21.593V32.1467L24.1279 37.2409V43.1973L12.4684 36.4189C11.0968 35.6206 10.2444 34.1339 10.2444 32.5388V19.0627ZM23.1844 9.96788C24.5349 9.18328 26.2818 9.18328 27.6325 9.96788L39.4904 16.8956L38.3636 17.4327L33.9644 19.6061L25.4084 14.6315L16.8523 19.6061L11.3442 16.8843L12.4026 16.2425C12.4123 16.2338 12.4398 16.2153 12.4694 16.1985L23.1844 9.96788ZM25.4083 0C26.3394 0 27.27 0.242165 28.1041 0.72704L42.644 9.18112C41.5737 9.9076 40.7455 10.9637 40.2899 12.2006L26.217 4.01908C25.9718 3.87572 25.6919 3.80081 25.4083 3.80081C25.1248 3.80081 24.8454 3.87572 24.5995 4.01908L8.02283 13.6574C8.06272 13.887 8.08753 14.1216 8.08753 14.3632C8.08753 16.1154 6.98116 17.608 5.43643 18.1814C5.42457 18.1858 5.41217 18.1906 5.40031 18.1944C5.27792 18.2385 5.15392 18.2765 5.02666 18.3085L4.95065 18.328C4.83419 18.3551 4.71503 18.3764 4.59533 18.3931L4.49775 18.4079C4.3484 18.4246 4.19742 18.4356 4.04377 18.4356C3.87932 18.4356 3.71758 18.4225 3.55743 18.403C3.5143 18.3974 3.47225 18.3899 3.42965 18.3834C3.30673 18.3643 3.18595 18.34 3.06679 18.3101C3.03012 18.3008 2.99347 18.2921 2.95681 18.2819C2.64139 18.1922 2.3416 18.0679 2.06177 17.9088L1.82144 17.7607C0.725648 17.0318 0 15.7822 0 14.3632C0 12.1175 1.81431 10.2909 4.04377 10.2909C4.62229 10.2909 5.17117 10.4158 5.66881 10.6368L22.7124 0.72704C23.5465 0.242165 24.4777 0 25.4083 0Z"
            />
          </svg>
          <svg
            width="75"
            height="40"
            viewBox="0 0 47 25"
            fill="currentColor"
            className="w-11"
          >
            <path d="M0.313477 2.77294H3.57946V10.6541H6.26751V2.77294H9.53349V0.163818H0.313477V2.77294Z" />
            <path d="M17.8588 0.163818V4.23889H13.5848V0.163818H10.9102V10.6541H13.5848V6.75386H17.8588V10.6541H20.5468V0.163818H17.8588Z" />
            <path d="M22.568 10.6541H30.6187V8.05842H25.2561V6.71352H29.6645V4.27923H25.2561V2.77294H30.6187V0.163818H22.568V10.6541Z" />
            <path d="M5.53497 20.9193H8.05247V21.2043C7.55963 21.9036 6.76042 22.3569 5.82801 22.3569C4.25624 22.3569 3.00414 21.1395 3.00414 19.6113C3.00414 18.0831 4.25624 16.8657 5.82801 16.8657C6.73378 16.8657 7.53299 17.2672 8.05247 17.9018L10.2237 16.4772C9.22464 15.208 7.61291 14.3661 5.82801 14.3661C2.81766 14.3661 0.313477 16.7232 0.313477 19.6113C0.313477 22.4994 2.81766 24.8564 5.82801 24.8564C6.89362 24.8564 7.94591 24.4679 8.45208 23.7167V24.6622H10.5433V18.7695H5.53497V20.9193Z" />
            <path d="M19.0352 14.5604V20.0905C19.0352 21.5539 18.3026 22.3569 16.904 22.3569C15.5187 22.3569 14.7994 21.5539 14.7994 20.0905V14.5604H12.1354V20.2459C12.1354 22.849 13.7871 24.8564 16.904 24.8564C20.0076 24.8564 21.6859 22.849 21.6859 20.2459V14.5604H19.0352Z" />
            <path d="M23.5364 14.5604V24.6622H26.2004V14.5604H23.5364Z" />
            <path d="M28.1958 24.6622H35.8283V22.1626H30.8465V14.5604H28.1958V24.6622Z" />
            <path d="M37.1999 24.6622H42.0218C45.2719 24.6622 46.937 22.3698 46.937 19.6113C46.937 16.8657 45.2719 14.5604 42.0218 14.5604H37.1999V24.6622ZM41.822 17.0729C43.4071 17.0729 44.2463 18.096 44.2463 19.6113C44.2463 21.1266 43.4071 22.1626 41.822 22.1626H39.864V17.0729H41.822Z" />
          </svg>
        </div>
        <div className="relative bg-background border border-border overflow-hidden p-16 rounded-4xl">
          <div className="absolute inset-0 animate-pulse animation-duration-[4000ms]">
            <svg
              width="432"
              height="432"
              viewBox="0 0 432 432"
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none absolute left-[-46px] top-[-20px] size-[200px] rotate-180 md:left-[-186px] md:top-[-76px] md:size-auto"
            >
              <path
                d="M.75 431v.25h90.24V160.868c0-38.596 31.282-69.878 69.878-69.878H431.25V.75H191.864a47.017 47.017 0 0 0-33.23 13.771l-68.07 68.071-7.972 7.971-68.07 68.071A47.018 47.018 0 0 0 .75 191.864V431Z"
                fill="url(#arch-decoration-a)"
                stroke="url(#arch-decoration-b)"
                stroke-width="0.5"
              />
            </svg>
            <svg
              width="432"
              height="432"
              viewBox="0 0 432 432"
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none absolute bottom-0 right-[-53px] size-[200px] md:-bottom-32 md:size-auto lg:bottom-0 lg:right-[-72px]"
            >
              <path
                d="M.75 431v.25h90.24V160.868c0-38.596 31.282-69.878 69.878-69.878H431.25V.75H191.864a47.017 47.017 0 0 0-33.23 13.771l-68.07 68.071-7.972 7.971-68.07 68.071A47.018 47.018 0 0 0 .75 191.864V431Z"
                fill="url(#arch-decoration-a)"
                stroke="url(#arch-decoration-b)"
                stroke-width="0.5"
              />
            </svg>
            <svg
              width="432"
              height="432"
              viewBox="0 0 432 432"
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none absolute bottom-0 right-[-53px] size-[200px] md:-bottom-32 md:size-auto lg:bottom-0 lg:right-[-72px]"
            >
              <path
                d="M.75 431v.25h90.24V160.868c0-38.596 31.282-69.878 69.878-69.878H431.25V.75H191.864a47.017 47.017 0 0 0-33.23 13.771l-68.07 68.071-7.972 7.971-68.07 68.071A47.018 47.018 0 0 0 .75 191.864V431Z"
                fill="url(#arch-decoration-a)"
                stroke="url(#arch-decoration-b)"
                stroke-width="0.5"
              />
            </svg>
            <svg
              width="432"
              height="432"
              viewBox="0 0 432 432"
              className="absolute -z-10"
            >
              <defs>
                <linearGradient
                  id="arch-decoration-a"
                  x1="48.5"
                  y1="53.5"
                  x2="302.5"
                  y2="341"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#fff" stop-opacity="0.1"></stop>
                  <stop offset="1" stop-color="#fff" stop-opacity="0.3"></stop>
                </linearGradient>
                <linearGradient
                  id="arch-decoration-b"
                  x1="1"
                  y1="1"
                  x2="431"
                  y2="431"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#fff" stop-opacity="0.1"></stop>
                  <stop offset="1" stop-color="#fff" stop-opacity="0.4"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col items-center justify-center max-w-3xl">
            <Badge variant="outline" className="text-md">
              Community Edition
            </Badge>
            <div className="mb-4 text-6xl font-medium leading-tight text-center">
              A Modern Playground for GraphQL Experiments
            </div>
            <div className="text-xl text-muted-foreground mb-8">
              Run, visualize, and share GraphQL queries — built with love by The
              Guild.
            </div>
            <form
              className="w-full"
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
                      <div className="relative backdrop-blur-xs rounded-lg overflow-hidden">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your GraphQL endpoint..."
                          autoComplete="off"
                          className="h-12 px-4 text-lg rounded-lg"
                        />
                        <Button
                          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-sm"
                          onClick={() => updateEndpointForm.handleSubmit()}
                        >
                          Start exploring
                          <ArrowRightIcon className="size-4" />
                        </Button>
                      </div>
                    );
                  }}
                />
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    );
  } else {
    result = (
      <div className="w-full h-full">
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

        <LabaratoryProvider
          {...props}
          {...envApi}
          {...preflightApi}
          {...tabsApi}
          {...endpointApi}
          {...collectionsApi}
          {...operationsApi}
          {...historyApi}
          openAddCollectionDialog={openAddCollectionDialog}
          openUpdateEndpointDialog={openUpdateEndpointDialog}
        >
          <LabaratoryContent />
        </LabaratoryProvider>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {import.meta.env.VITE_TARGET === "electron" && (
        <div className="h-9 min-h-9 border-b border-border flex items-center justify-center text-sm" />
      )}
      <div
        className="relative flex-1 h-full"
        style={
          {
            "app-region": "no-drag",
          } as React.CSSProperties
        }
      >
        {result}
      </div>
    </div>
  );
};
