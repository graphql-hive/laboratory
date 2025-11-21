import "@xyflow/react/dist/style.css";
import { GraphQLIcon } from "@/components/icons";
import { useLabaratory } from "@/components/labaratory/context";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollBar } from "@/components/ui/scroll-area";
import type {
  LabaratoryCollection,
  LabaratoryCollectionOperation,
} from "@/lib/collections";
import type { LabaratoryTabTest } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  FolderIcon,
  FolderOpenIcon,
  SearchIcon,
  TrashIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionLineType,
  ReactFlow,
  addEdge,
  type Connection,
  type NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import type {
  LabaratoryTest,
  LabaratoryTestTask,
  LabaratoryTestTaskOperation,
} from "@/lib/tests";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export const OperationNode = (
  props: NodeProps & { test: LabaratoryTest; task: LabaratoryTestTask }
) => {
  const { collections, deleteTaskFromTest } = useLabaratory();

  const operation = useMemo(() => {
    return collections.reduce((acc, collection) => {
      const result = collection.operations.find(
        (operation) =>
          operation.id === (props.task as LabaratoryTestTaskOperation).data.id
      );

      return result ?? acc;
    }, null as LabaratoryCollectionOperation | null);
  }, [collections, props.task]);

  if (!operation) {
    return null;
  }

  return (
    <div className="bg-card border shadow-xl flex items-center gap-2 rounded-md p-3 w-full">
      <GraphQLIcon className="size-4 text-pink-500" />
      <span className="text-sm">{operation.name}</span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="p-1! size-6 rounded-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <TrashIcon className="size-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete task {operation.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {operation.name} will be deleted from the test.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTaskFromTest(props.test.id, props.task.id);
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Handle
        type="target"
        position={Position.Left}
        className="size-3! rounded-full bg-card! border border-border! hover:bg-border shadow-xl"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="size-3! rounded-full bg-card! border border-border! hover:bg-border shadow-xl"
      />
    </div>
  );
};

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const direction = "LR";

  if (nodes.every((node) => node.measured)) {
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, node.measured!);
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);
  }

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: node.measured
        ? {
            x: nodeWithPosition.x - node.measured.width! / 2,
            y: nodeWithPosition.y - node.measured.height! / 2,
          }
        : node.position,
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

export const TestTaskCollectionItem = (props: {
  collection: LabaratoryCollection;
  onOperationClick: (operationId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group sticky top-0 w-full justify-start px-2"
          size="sm"
        >
          {isOpen ? (
            <FolderOpenIcon className="size-4 text-muted-foreground" />
          ) : (
            <FolderIcon className="size-4 text-muted-foreground" />
          )}
          {props.collection.name}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col pl-2.25 gap-1 py-1 ml-4 border-l border-border">
        {isOpen &&
          props.collection.operations.map((operation) => {
            return (
              <Button
                key={operation.name}
                variant="ghost"
                className="w-full justify-start px-2 gap-2"
                size="sm"
                onClick={() => props.onOperationClick(operation.id)}
              >
                <GraphQLIcon className="size-4 text-pink-500" />
                {operation.name}
              </Button>
            );
          })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const Test = () => {
  const { activeTab, tests, collections, addTaskToTest } = useLabaratory();
  const [search, setSearch] = useState("");

  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);

  const test = useMemo(() => {
    if (activeTab?.type !== "test") {
      return null;
    }

    return tests.find((t) => t.id === (activeTab as LabaratoryTabTest).data.id);
  }, [activeTab, tests]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useLayoutEffect(() => {
    if (test) {
      setNodes(
        test.tasks.map((task) => ({
          id: task.id,
          type: task.type,
          data: {
            label: task.id,
            task,
          },
          position: {
            x: -1,
            y: -1,
          },
          style: {
            width: 240,
          },
        }))
      );
      setEdges(
        test?.tasks
          ?.map((task) => {
            if (!task.next) {
              return null;
            }

            return {
              id: `${task.id}-${task.next}`,
              source: task.id,
              target: task.next,
              type: ConnectionLineType.SmoothStep,
              animated: true,
            };
          })
          .filter((edge) => edge !== null) ?? []
      );
    }
  }, [setEdges, setNodes, test]);

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    if (
      nodes.length > 0 &&
      nodes.every(
        (node) =>
          node.position.x === -1 && node.position.y === -1 && node.measured
      )
    ) {
      onLayout();
    }
  }, [onLayout, nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds
        )
      ),
    [setEdges]
  );

  if (!test) {
    return null;
  }

  return (
    <div className="relative w-full h-full bg-card">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel defaultSize={20}>
          <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 p-3 pb-0">
                <span className="text-md font-medium">Tasks</span>
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
                <div className="p-3 flex flex-col gap-3">
                  <Collapsible
                    open={isUtilitiesOpen}
                    onOpenChange={setIsUtilitiesOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="group sticky top-0 w-full justify-start px-2"
                        size="sm"
                      >
                        <WrenchIcon className="size-4 text-muted-foreground" />
                        Utilities
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                  <Collapsible
                    open={isOperationsOpen}
                    onOpenChange={setIsOperationsOpen}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="group sticky top-0 w-full justify-start px-2"
                        size="sm"
                      >
                        <GraphQLIcon className="size-4 text-muted-foreground" />
                        Collections
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex flex-col pl-2.25 gap-1 py-1 ml-4 border-l border-border">
                      <div className="flex flex-col gap-1">
                        {collections.map((collection) => (
                          <TestTaskCollectionItem
                            key={collection.id}
                            collection={collection}
                            onOperationClick={(operationId) => {
                              addTaskToTest(test.id, {
                                type: "operation",
                                data: {
                                  id: operationId,
                                },
                              });
                            }}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <ScrollBar />
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80} className="select-none">
          <ReactFlow
            colorMode="dark"
            nodes={nodes}
            edges={edges}
            nodeTypes={{
              operation: (props) => (
                <OperationNode {...props} test={test} task={props.data.task} />
              ),
            }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            fitViewOptions={{
              maxZoom: 1,
              minZoom: 1,
            }}
          >
            {/* <Background /> */}
          </ReactFlow>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
