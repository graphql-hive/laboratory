import type { LabaratoryEnv, LabaratoryEnvActions, LabaratoryEnvState } from "@/lib/env";
import { useCallback, useState } from "react";

export interface LabaratoryPreflightLog {
  level: "log" | "warn" | "error";
  message: unknown[];
  createdAt: string;
}

export interface LabaratoryPreflightResult {
  status: "success" | "error";
  error?: string;
  logs: LabaratoryPreflightLog[];
  env: LabaratoryEnv;
}

export interface LabaratoryPreflight {
  script: string;
  lastTestResult?: LabaratoryPreflightResult | null;
}

export interface LabaratoryPreflightState {
  preflight: LabaratoryPreflight | null;
}

export interface LabaratoryPreflightActions {
  setPreflight: (preflight: LabaratoryPreflight) => void;
  runPreflight: () => Promise<LabaratoryPreflightResult | null>;
  setLastTestResult: (result: LabaratoryPreflightResult | null) => void;
}

export const usePreflight = (props: {
  defaultPreflight?: LabaratoryPreflight | null;
  onPreflightChange?: (preflight: LabaratoryPreflight | null) => void;
  envApi: LabaratoryEnvState & LabaratoryEnvActions;
}): LabaratoryPreflightState & LabaratoryPreflightActions => {
  const [preflight, _setPreflight] = useState<LabaratoryPreflight | null>(
    props.defaultPreflight ?? null
  );

  const setPreflight = useCallback(
    (preflight: LabaratoryPreflight) => {
      _setPreflight(preflight);
      props.onPreflightChange?.(preflight);
    },
    [props]
  );

  const runPreflight = useCallback(async () => {
    if (!preflight) {
      return null;
    }

    return runIsolatedLabScript(preflight.script, props.envApi?.env ?? { variables: {} });
  }, [preflight, props.envApi.env]);

  const setLastTestResult = useCallback(
    (result: LabaratoryPreflightResult | null) => {
      _setPreflight({ ...preflight ?? { script: "" }, lastTestResult: result });
      props.onPreflightChange?.({ ...preflight ?? { script: "" }, lastTestResult: result });
    },
    [preflight, props]
  );

  return {
    preflight,
    setPreflight,
    runPreflight,
    setLastTestResult,
  };
};

export async function runIsolatedLabScript(
  script: string,
  env: LabaratoryEnv
): Promise<LabaratoryPreflightResult> {
  return new Promise((resolve, reject) => {
    const blob = new Blob(
      [
        `
        const env = ${JSON.stringify(env)};

        self.onmessage = async (event) => {
          try {
            const lab = Object.freeze({
              fetch,
              graphql: (endpoint, query, options) => {
                return fetch(endpoint, {
                  method: 'POST',
                  body: JSON.stringify({ query, variables: options?.variables, extensions: options?.extensions }),
                  headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                  },
                });
              },
              console: {
                log: (...args) => {
                  self.postMessage({ type: 'log', level: 'log', message: args });
                },
                warn: (...args) => {
                  self.postMessage({ type: 'log', level: 'warn', message: args });
                },
                error: (...args) => {
                  self.postMessage({ type: 'log', level: 'error', message: args });
                },
              },
              env: {
                get: (key) => env.variables[key],
                set: (key, value) => {
                  env.variables[key] = value;
                },
                delete: (key) => {
                  delete env.variables[key];
                }
              }
            });

            const AsyncFunction = async function () {}.constructor;
            await new AsyncFunction('lab', 'with(lab){' + event.data.script + '}')(lab);
            
            self.postMessage({ type: 'result', status: 'success', env: env });
          } catch (err) {
            self.postMessage({ type: 'result', status: 'error', error: err.message || String(err) });
          }
        };
      `,
      ],
      { type: "application/javascript" }
    );

    const logs: LabaratoryPreflightLog[] = [];

    const worker = new Worker(URL.createObjectURL(blob), { type: "module" });

    worker.onmessage = ({ data }) => {
      if (data.type === "result") {
        worker.terminate();

        if (data.status === "success") {
          resolve({
            status: "success",
            logs,
            env: data.env,
          });
        } else if (data.status === "error") {
          console.error(data.error);
          reject({
            status: "error",
            error: data.error,
            logs,
          });
        }
      } else if (data.type === "log") {
        if (data.level === "log") {
          logs.push({ level: "log", message: data.message, createdAt: new Date().toISOString() });
        } else if (data.level === "warn") {
          logs.push({ level: "warn", message: data.message, createdAt: new Date().toISOString() });
        } else if (data.level === "error") {
          logs.push({ level: "error", message: data.message, createdAt: new Date().toISOString() });
        }
      }
    };

    worker.onerror = (error) => {
      console.error(error);
      reject({
        status: "error",
        error: error.message,
        logs,
      });
    };

    worker.postMessage({ script });
  });
}
