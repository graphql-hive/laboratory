import { GraphQLType } from "@/components/graphql-type";
import { useLabaratory } from "@/components/labaratory/context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipContent } from "@/components/ui/tooltip";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import type { LabaratoryOperation } from "@/lib/operations";
import {
  getOpenPaths,
  isArgInQuery,
  isPathInQuery,
} from "@/lib/operations.utils";
import { cn } from "@/lib/utils";
import {
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  type GraphQLArgument,
  type GraphQLField,
} from "graphql";
import {
  BoxIcon,
  ChevronDownIcon,
  CopyMinusIcon,
  CuboidIcon,
  FolderIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const BuilderArgument = (props: {
  field: GraphQLArgument;
  path: string[];
  isReadOnly?: boolean;
  operation?: LabaratoryOperation | null;
}) => {
  const {
    schema,
    activeOperation,
    addArgToActiveOperation,
    deleteArgFromActiveOperation,
    activeTab,
  } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  const path = useMemo(() => {
    return props.path.join(".");
  }, [props.path]);

  const isInQuery = useMemo(() => {
    return isArgInQuery(operation?.query ?? "", path, props.field.name);
  }, [operation?.query, path, props.field.name]);

  return (
    <Button
      key={props.field.name}
      variant="ghost"
      className={cn("w-full justify-start p-1! text-muted-foreground text-xs", {
        "text-foreground-primary": isInQuery,
      })}
      size="sm"
    >
      <div className="size-4" />
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={isInQuery}
        disabled={activeTab?.type !== "operation" || props.isReadOnly}
        onCheckedChange={(checked) => {
          if (!schema) {
            return;
          }

          if (checked) {
            addArgToActiveOperation(
              props.path.join("."),
              props.field.name,
              schema
            );
          } else {
            deleteArgFromActiveOperation(
              props.path.join("."),
              props.field.name
            );
          }
        }}
      />
      <BoxIcon className="size-4 text-rose-500 dark:text-rose-400" />
      {props.field.name}: <GraphQLType type={props.field.type} />
    </Button>
  );
};

export const BuilderScalarField = (props: {
  field: GraphQLField<unknown, unknown, unknown>;
  path: string[];
  openPaths: string[];
  setOpenPaths: (openPaths: string[]) => void;
  isReadOnly?: boolean;
  operation?: LabaratoryOperation | null;
}) => {
  const {
    activeOperation,
    addPathToActiveOperation,
    deletePathFromActiveOperation,
    activeTab,
  } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  const isOpen = useMemo(() => {
    return props.openPaths.includes(props.path.join("."));
  }, [props.openPaths, props.path]);

  const setIsOpen = useCallback(
    (isOpen: boolean) => {
      props.setOpenPaths(
        isOpen
          ? [...props.openPaths, props.path.join(".")]
          : props.openPaths.filter((path) => path !== props.path.join("."))
      );
    },
    [props]
  );

  const path = useMemo(() => {
    return props.path.join(".");
  }, [props.path]);

  const isInQuery = useMemo(() => {
    return isPathInQuery(operation?.query ?? "", path);
  }, [operation?.query, path]);

  const args = useMemo(() => {
    return (props.field as GraphQLField<unknown, unknown, unknown>).args ?? [];
  }, [props.field]);

  const hasArgs = useMemo(() => {
    return args.some((arg) =>
      isArgInQuery(operation?.query ?? "", path, arg.name)
    );
  }, [operation?.query, args, path]);

  if (args.length > 0) {
    return (
      <Collapsible
        key={props.field.name}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "sticky top-0 z-10 group w-full justify-start p-1! text-muted-foreground text-xs bg-card overflow-hidden",
              {
                "text-foreground-primary": isInQuery,
              }
            )}
            style={{
              top: `${(props.path.length - 2) * 32}px`,
            }}
            size="sm"
          >
            <div className="absolute top-0 left-0 w-full h-full -z-20 bg-card" />
            <div className="absolute top-0 left-0 w-full h-full -z-10 group-hover:bg-accent dark:group-hover:bg-accent/50 transition-colors" />
            <ChevronDownIcon
              className={cn("size-4 text-muted-foreground transition-all", {
                "-rotate-90": !isOpen,
              })}
            />
            <Checkbox
              onClick={(e) => e.stopPropagation()}
              checked={isInQuery}
              disabled={activeTab?.type !== "operation" || props.isReadOnly}
              onCheckedChange={(checked) => {
                if (checked) {
                  setIsOpen(true);
                  addPathToActiveOperation(path);
                } else {
                  deletePathFromActiveOperation(path);
                }
              }}
            />
            <BoxIcon className="size-4 text-rose-400" />
            {props.field.name}: <GraphQLType type={props.field.type} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col pl-2.25 ml-3 border-l border-border relative z-0">
          {isOpen && (
            <div>
              {args.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "sticky top-0 z-10 group w-full justify-start p-1! text-muted-foreground text-xs bg-card overflow-hidden",
                        {
                          "text-foreground-primary": hasArgs,
                        }
                      )}
                      style={{
                        top: `${(props.path.length - 1) * 32}px`,
                      }}
                      size="sm"
                    >
                      <ChevronDownIcon
                        className={cn(
                          "size-4 text-muted-foreground transition-all",
                          {
                            "-rotate-90": !isOpen,
                          }
                        )}
                      />
                      <Checkbox
                        onClick={(e) => e.stopPropagation()}
                        checked={hasArgs}
                        disabled
                      />
                      <CuboidIcon className="size-4 text-rose-400" />
                      [arguments]
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col pl-2.25 ml-3 border-l border-border">
                    {args.map((arg) => (
                      <BuilderArgument
                        key={arg.name}
                        field={arg}
                        path={[...props.path]}
                        isReadOnly={props.isReadOnly}
                        operation={operation}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      key={props.field.name}
      variant="ghost"
      className={cn("w-full justify-start p-1! text-muted-foreground text-xs", {
        "text-foreground-primary": isInQuery,
      })}
      size="sm"
    >
      <div className="size-4" />
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={isInQuery}
        disabled={activeTab?.type !== "operation"}
        onCheckedChange={(checked) => {
          if (checked) {
            addPathToActiveOperation(props.path.join("."));
          } else {
            deletePathFromActiveOperation(props.path.join("."));
          }
        }}
      />
      <BoxIcon className="size-4 text-rose-400" />
      {props.field.name}: <GraphQLType type={props.field.type} />
    </Button>
  );
};

export const BuilderObjectField = (props: {
  field: GraphQLField<unknown, unknown, unknown>;
  path: string[];
  openPaths: string[];
  setOpenPaths: (openPaths: string[]) => void;
  isReadOnly?: boolean;
  operation?: LabaratoryOperation | null;
}) => {
  const {
    schema,
    activeOperation,
    addPathToActiveOperation,
    deletePathFromActiveOperation,
    activeTab,
  } = useLabaratory();

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  const isOpen = useMemo(() => {
    return props.openPaths.includes(props.path.join("."));
  }, [props.openPaths, props.path]);

  const setIsOpen = useCallback(
    (isOpen: boolean) => {
      props.setOpenPaths(
        isOpen
          ? [...props.openPaths, props.path.join(".")]
          : props.openPaths.filter((path) => path !== props.path.join("."))
      );
    },
    [props]
  );

  const fields = useMemo(
    () =>
      Object.values(
        (
          schema?.getType(
            props.field.type.toString().replace(/\[|\]|!/g, "")
          ) as GraphQLObjectType
        )?.getFields?.() ?? {}
      ),
    [schema, props.field.type]
  );

  const args = useMemo(() => {
    return (props.field as GraphQLField<unknown, unknown, unknown>).args ?? [];
  }, [props.field]);

  const hasArgs = useMemo(() => {
    return args.some((arg) =>
      isArgInQuery(operation?.query ?? "", props.path.join("."), arg.name)
    );
  }, [operation?.query, args, props.path]);

  const path = useMemo(() => {
    return props.path.join(".");
  }, [props.path]);

  const isInQuery = useMemo(() => {
    return isPathInQuery(operation?.query ?? "", path);
  }, [operation?.query, path]);

  return (
    <Collapsible key={props.field.name} open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "sticky top-0 z-10 group w-full justify-start p-1! text-muted-foreground text-xs bg-card overflow-hidden",
            {
              "text-foreground-primary": isInQuery,
            }
          )}
          style={{
            top: `${(props.path.length - 2) * 32}px`,
          }}
          size="sm"
        >
          <div className="absolute top-0 left-0 w-full h-full -z-20 bg-card" />
          <div className="absolute top-0 left-0 w-full h-full -z-10 group-hover:bg-accent dark:group-hover:bg-accent/50 transition-colors" />
          <ChevronDownIcon
            className={cn("size-4 text-muted-foreground transition-all", {
              "-rotate-90": !isOpen,
            })}
          />
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            checked={isInQuery}
            disabled={activeTab?.type !== "operation" || props.isReadOnly}
            onCheckedChange={(checked) => {
              if (checked) {
                setIsOpen(true);
                addPathToActiveOperation(path);
              } else {
                deletePathFromActiveOperation(path);
              }
            }}
          />
          <BoxIcon className="size-4 text-rose-400" />
          {props.field.name}: <GraphQLType type={props.field.type} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col pl-2.25 ml-3 border-l border-border relative z-0">
        {isOpen && (
          <div>
            {args.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "sticky top-0 z-10 group w-full justify-start p-1! text-muted-foreground text-xs bg-card overflow-hidden",
                      {
                        "text-foreground-primary": hasArgs,
                      }
                    )}
                    style={{
                      top: `${(props.path.length - 1) * 32}px`,
                    }}
                    size="sm"
                  >
                    <ChevronDownIcon
                      className={cn(
                        "size-4 text-muted-foreground transition-all",
                        {
                          // "-rotate-90": !isOpen,
                        }
                      )}
                    />
                    <Checkbox
                      onClick={(e) => e.stopPropagation()}
                      checked={hasArgs}
                      disabled
                    />
                    <CuboidIcon className="size-4 text-rose-400" />
                    [arguments]
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col pl-2.25 ml-3 border-l border-border">
                  {args.map((arg) => (
                    <BuilderArgument
                      key={arg.name}
                      field={arg}
                      path={[...props.path]}
                      operation={operation}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
            {fields?.map((child) => (
              <BuilderField
                key={child.name}
                field={child}
                path={[...props.path, child.name]}
                openPaths={props.openPaths}
                setOpenPaths={props.setOpenPaths}
                isReadOnly={props.isReadOnly}
                operation={operation}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const BuilderField = (props: {
  field: GraphQLField<unknown, unknown, unknown>;
  path: string[];
  openPaths: string[];
  setOpenPaths: (openPaths: string[]) => void;
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const { schema } = useLabaratory();

  const type = schema?.getType(
    props.field.type.toString().replaceAll(/\[|\]|!/g, "")
  );

  if (
    !type ||
    type instanceof GraphQLScalarType ||
    type instanceof GraphQLEnumType ||
    type instanceof GraphQLUnionType
  ) {
    return (
      <BuilderScalarField
        field={props.field}
        path={props.path}
        openPaths={props.openPaths}
        setOpenPaths={props.setOpenPaths}
        isReadOnly={props.isReadOnly}
        operation={props.operation}
      />
    );
  }

  return (
    <BuilderObjectField
      field={props.field}
      path={props.path}
      openPaths={props.openPaths}
      setOpenPaths={props.setOpenPaths}
      isReadOnly={props.isReadOnly}
      operation={props.operation}
    />
  );
};

export const Builder = (props: {
  operation?: LabaratoryOperation | null;
  isReadOnly?: boolean;
}) => {
  const { schema, activeOperation, openUpdateEndpointDialog } = useLabaratory();
  const [openPaths, setOpenPaths] = useState<string[]>([]);

  const operation = useMemo(() => {
    return props.operation ?? activeOperation ?? null;
  }, [props.operation, activeOperation]);

  useEffect(() => {
    if (schema) {
      const newOpenPaths = getOpenPaths(operation?.query ?? "");

      if (newOpenPaths.length > 0) {
        setOpenPaths(newOpenPaths);
        setTabValue(newOpenPaths[0]);
      }
    }
  }, [schema, operation?.query]);

  const queryFields = useMemo(
    () => Object.values(schema?.getQueryType()?.getFields?.() ?? {}),
    [schema]
  );

  const mutationFields = useMemo(
    () => Object.values(schema?.getMutationType()?.getFields?.() ?? {}),
    [schema]
  );

  const subscriptionFields = useMemo(
    () => Object.values(schema?.getSubscriptionType()?.getFields?.() ?? {}),
    [schema]
  );

  const [tabValue, setTabValue] = useState<string>("query");

  return (
    <div className="w-full h-full flex flex-col bg-card overflow-hidden">
      <div className="flex items-center pt-3 px-3">
        <span className="text-md font-medium">Builder</span>
        <div className="ml-auto flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setOpenPaths([])}
                variant="ghost"
                size="icon-sm"
                className="p-1! size-6  rounded-sm"
                disabled={openPaths.length === 0}
              >
                <CopyMinusIcon className="size-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Collapse all</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {schema ? (
          <Tabs
            key={operation?.id}
            value={tabValue}
            onValueChange={setTabValue}
            className="w-full h-full gap-0 flex flex-col"
          >
            <div className="flex items-center p-3 px-3 border-b border-border">
              <TabsList className="w-full">
                <TabsTrigger
                  value="query"
                  disabled={queryFields.length === 0}
                  className="text-xs"
                >
                  Query
                </TabsTrigger>
                <TabsTrigger
                  value="mutation"
                  disabled={mutationFields.length === 0}
                  className="text-xs"
                >
                  Mutation
                </TabsTrigger>
                <TabsTrigger
                  value="subscription"
                  disabled={subscriptionFields.length === 0}
                  className="text-xs"
                >
                  Subscription
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="font-mono h-full">
                <div className="p-3">
                  <TabsContent value="query">
                    {queryFields?.map((field) => (
                      <BuilderField
                        key={field.name}
                        field={field}
                        path={["query", field.name]}
                        openPaths={openPaths}
                        setOpenPaths={setOpenPaths}
                        isReadOnly={props.isReadOnly}
                        operation={operation}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="mutation">
                    {mutationFields?.map((field) => (
                      <BuilderField
                        key={field.name}
                        field={field}
                        path={["mutation", field.name]}
                        openPaths={openPaths}
                        setOpenPaths={setOpenPaths}
                        isReadOnly={props.isReadOnly}
                        operation={operation}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="subscription">
                    {subscriptionFields?.map((field) => (
                      <BuilderField
                        key={field.name}
                        field={field}
                        path={["subscription", field.name]}
                        openPaths={openPaths}
                        setOpenPaths={setOpenPaths}
                        isReadOnly={props.isReadOnly}
                        operation={operation}
                      />
                    ))}
                  </TabsContent>
                </div>
                <ScrollBar className="relative z-100" />
                <ScrollBar
                  orientation="horizontal"
                  className="relative z-100"
                />
              </ScrollArea>
            </div>
          </Tabs>
        ) : (
          <Empty className="w-full px-0! h-97.5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="text-md">No endpoint selected</EmptyTitle>
              <EmptyDescription className="text-xs">
                You haven't selected any endpoint yet. Get started by selecting
                an endpoint.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="secondary"
                size="sm"
                onClick={openUpdateEndpointDialog}
              >
                Update endpoint
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
};
