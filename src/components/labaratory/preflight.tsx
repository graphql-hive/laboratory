import { useLabaratory } from "@/components/labaratory/context";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Editor } from "@/components/labaratory/editor";
import { HistoryIcon, PlayIcon } from "lucide-react";
import { runIsolatedLabScript } from "@/lib/preflight";
import { useCallback } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const Preflight = () => {
  const { preflight, setLastTestResult, setPreflight, env, setEnv } =
    useLabaratory();

  const run = useCallback(async () => {
    const result = await runIsolatedLabScript(
      preflight?.script ?? "",
      env ?? { variables: {} }
    );

    setEnv(result?.env ?? { variables: {} });
    setLastTestResult(result);
  }, [env, setEnv, preflight, setLastTestResult]);

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      <ResizablePanel defaultSize={50} className="bg-card">
        <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
          <div className="flex items-center p-3 border-b border-border w-full gap-2">
            <span className="text-md font-medium">Preflight</span>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="h-6 rounded-sm"
                onClick={run}
              >
                <PlayIcon className="size-4" />
                <span>Test</span>
              </Button>
            </div>
          </div>
          <div className="w-full h-full">
            <Editor
              value={preflight?.script ?? ""}
              onChange={(value) => {
                setPreflight({
                  ...(preflight ?? { script: "" }),
                  script: value ?? "",
                });
              }}
              language="typescript"
              extraLibs={[
                `
                  interface Lab {
                    fetch: (url: string, options: RequestInit) => Promise<Response>;
                    graphql: (endpoint: string, query: string, options: { variables?: Record<string, unknown>; extensions?: Record<string, unknown>; headers?: Record<string, string> }) => Promise<Response>;
                    console: {
                      log: (...args: string[]) => void;
                      warn: (...args: string[]) => void;
                      error: (...args: string[]) => void;
                    };
                    env: {
                      set: (key: string, value: string) => void;
                      get: (key: string) => string;
                      delete: (key: string) => void;
                    }
                  };

                  declare var lab: Lab;
                  `,
              ]}
            />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={10} defaultSize={50} className="bg-card">
        {preflight?.lastTestResult?.logs &&
        preflight?.lastTestResult?.logs.length > 0 ? (
          <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
            <div className="flex items-center p-3 border-b border-border w-full gap-2 h-12.25">
              <span className="text-md font-medium">Logs</span>
              <div className="ml-auto flex items-center gap-2"></div>
            </div>
            <ScrollArea className="h-full">
              <div className="flex flex-col p-3 gap-1.5">
                {preflight?.lastTestResult?.logs.map((log) => (
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
          </div>
        ) : (
          <Empty className="w-full h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No logs yet</EmptyTitle>
              <EmptyDescription>
                No logs available yet. Run your preflight to see the logs here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
