import { useLabaratory } from "@/components/labaratory/context";
import { Editor } from "@/components/labaratory/editor";

export const Env = () => {
  const { env, setEnv } = useLabaratory();

  return (
    <div className="w-full h-full bg-card">
      <Editor
        defaultValue={Object.entries(env?.variables ?? {})
          .map(([key, value]) => `${key}=${value}`)
          .join("\n")}
        onChange={(value) => {
          setEnv({
            variables:
              Object.fromEntries(
                value?.split("\n").map((line) => line.split("=")) ?? []
              ) ?? {},
          });
        }}
        language="dotenv"
        options={{
          scrollbar: {
            horizontal: "hidden",
          },
        }}
      />
    </div>
  );
};
