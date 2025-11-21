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
  const {
    preflight,
    setLastTestResult,
    setPreflight,
    env,
    setEnv,
    openPreflightPromptModal,
  } = useLabaratory();

  const run = useCallback(async () => {
    if (!preflight?.script) {
      return;
    }

    const result = await runIsolatedLabScript(
      preflight?.script ?? "",
      env ?? { variables: {} },
      (placeholder, defaultValue) => {
        return new Promise((resolve) => {
          openPreflightPromptModal?.({
            placeholder,
            defaultValue,
            onSubmit: (value) => {
              resolve(value);
            },
          });
        });
      }
    );

    setEnv(result?.env ?? { variables: {} });
    setLastTestResult(result);
  }, [env, setEnv, preflight, setLastTestResult, openPreflightPromptModal]);

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
                    request: (endpoint: string, query: string, options?: { variables?: Record<string, unknown>; extensions?: Record<string, unknown>; headers?: Record<string, string> }) => Promise<Response>;
                    environment: {
                      set: (key: string, value: string) => void;
                      get: (key: string) => string;
                      delete: (key: string) => void;
                    };
                    prompt: (placeholder: string, defaultValue: string) => Promise<string | null>;
                    CryptoJS: typeof CryptoJS;
                  }

                  declare namespace CryptoJS {
                    namespace lib {
                      interface WordArray {
                        words: number[];
                        sigBytes: number;
                        toString(encoder?: Encoder): string;
                        concat(wordArray: WordArray): WordArray;
                        clone(): WordArray;
                      }
                      interface CipherParams {
                        ciphertext: WordArray;
                        key: WordArray;
                        iv: WordArray;
                        salt: WordArray;
                        toString(formatter?: Format): string;
                      }
                    }
                    namespace enc {
                      interface Encoder {
                        stringify(wordArray: lib.WordArray): string;
                        parse(str: string): lib.WordArray;
                      }
                      const Hex: Encoder;
                      const Latin1: Encoder;
                      const Utf8: Encoder;
                      const Base64: Encoder;
                    }
                    namespace algo {
                      interface HasherStatic {
                        create(cfg?: object): Hasher;
                      }
                      interface Hasher {
                        update(messageUpdate: lib.WordArray | string): Hasher;
                        finalize(messageUpdate?: lib.WordArray | string): lib.WordArray;
                      }
                      const MD5: HasherStatic;
                      const SHA1: HasherStatic;
                      const SHA256: HasherStatic;
                      const SHA224: HasherStatic;
                      const SHA512: HasherStatic;
                      const SHA384: HasherStatic;
                      const SHA3: HasherStatic;
                      const RIPEMD160: HasherStatic;
                      interface CipherStatic {
                        createEncryptor(key: lib.WordArray, cfg?: CipherOption): Cipher;
                        createDecryptor(key: lib.WordArray, cfg?: CipherOption): Cipher;
                      }
                      interface Cipher {
                        process(dataUpdate: lib.WordArray | string): lib.WordArray;
                        finalize(dataUpdate?: lib.WordArray | string): lib.WordArray;
                      }
                      interface CipherHelper {
                        encrypt(message: lib.WordArray | string, key: lib.WordArray | string, cfg?: CipherOption): lib.CipherParams;
                        decrypt(ciphertext: lib.CipherParams | string, key: lib.WordArray | string, cfg?: CipherOption): lib.WordArray;
                      }
                      const AES: CipherStatic;
                      const DES: CipherStatic;
                      const TripleDES: CipherStatic;
                      const RC4: CipherStatic;
                    }
                    namespace mode {
                      interface BlockCipherMode {
                        createEncryptor(cipher: algo.Cipher, iv: number[]): Mode;
                        createDecryptor(cipher: algo.Cipher, iv: number[]): Mode;
                      }
                      const CBC: BlockCipherMode;
                      const CFB: BlockCipherMode;
                      const CTR: BlockCipherMode;
                      const OFB: BlockCipherMode;
                      const ECB: BlockCipherMode;
                    }
                    namespace pad {
                      interface Padding {
                        pad(data: lib.WordArray, blockSize: number): void;
                        unpad(data: lib.WordArray): void;
                      }
                      const Pkcs7: Padding;
                      const AnsiX923: Padding;
                      const Iso10126: Padding;
                      const Iso97971: Padding;
                      const ZeroPadding: Padding;
                      const NoPadding: Padding;
                    }
                    namespace format {
                      interface Format {
                        stringify(cipherParams: lib.CipherParams): string;
                        parse(str: string): lib.CipherParams;
                      }
                      const OpenSSL: Format;
                      const Hex: Format;
                    }
                    interface CipherOption {
                      iv?: lib.WordArray;
                      mode?: mode.BlockCipherMode;
                      padding?: pad.Padding;
                      format?: format.Format;
                      [key: string]: any;
                    }
                    interface Mode {
                      processBlock(words: number[], offset: number): void;
                    }
                    type HasherHelper = (message: lib.WordArray | string, cfg?: object) => lib.WordArray;
                    type HmacHasherHelper = (message: lib.WordArray | string, key: lib.WordArray | string) => lib.WordArray;
                    type CipherHelper = {
                      encrypt(message: lib.WordArray | string, key: lib.WordArray | string, cfg?: CipherOption): lib.CipherParams;
                      decrypt(ciphertext: lib.CipherParams | string, key: lib.WordArray | string, cfg?: CipherOption): lib.WordArray;
                    };
                    const MD5: HasherHelper;
                    const SHA1: HasherHelper;
                    const SHA256: HasherHelper;
                    const SHA224: HasherHelper;
                    const SHA512: HasherHelper;
                    const SHA384: HasherHelper;
                    const SHA3: HasherHelper;
                    const RIPEMD160: HasherHelper;
                    const HmacMD5: HmacHasherHelper;
                    const HmacSHA1: HmacHasherHelper;
                    const HmacSHA256: HmacHasherHelper;
                    const HmacSHA224: HmacHasherHelper;
                    const HmacSHA512: HmacHasherHelper;
                    const HmacSHA384: HmacHasherHelper;
                    const HmacSHA3: HmacHasherHelper;
                    const HmacRIPEMD160: HmacHasherHelper;
                    const AES: CipherHelper;
                    const DES: CipherHelper;
                    const TripleDES: CipherHelper;
                    const RC4: CipherHelper;
                    const RC4Drop: CipherHelper;
                    const Rabbit: CipherHelper;
                    const RabbitLegacy: CipherHelper;
                    function PBKDF2(password: lib.WordArray | string, salt: lib.WordArray | string, cfg?: { keySize?: number; hasher?: algo.HasherStatic; iterations?: number }): lib.WordArray;
                    function EvpKDF(password: lib.WordArray | string, salt: lib.WordArray | string, cfg?: { keySize: number; hasher?: algo.HasherStatic; iterations: number }): lib.WordArray;
                  }

                  declare var lab: Lab;
                  declare var CryptoJS: typeof CryptoJS;
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
