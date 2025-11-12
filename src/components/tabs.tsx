import { cn } from "@/lib/utils";
import { Children, Fragment, useEffect, useMemo, useState } from "react";

interface ItemProps {
  label: string;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Item = (_props: ItemProps) => {
  return null;
};

export interface TabsProps {
  children: (React.ReactElement<ItemProps> | null)[];
  suffix?: React.ReactNode;
}

export const Tabs = ({ children, suffix }: TabsProps) => {
  const filteredChildren = useMemo(() => {
    return children.filter((child) => child !== null);
  }, [children]);

  const [activeTab, setActiveTab] = useState<string | null>(
    filteredChildren[0].props.label ?? null
  );

  useEffect(() => {
    if (
      activeTab &&
      !filteredChildren.some((child) => child.props.label === activeTab)
    ) {
      setActiveTab(filteredChildren[0].props.label ?? null);
    }
  }, [activeTab, filteredChildren]);

  const activeChild = useMemo(() => {
    return (
      filteredChildren.find((child) => child.props.label === activeTab)?.props
        .children ?? null
    );
  }, [filteredChildren, activeTab]);

  return (
    <div className="w-full h-full grid grid-rows-[auto_1fr] pb-0">
      <div className="w-full overflow-hidden h-12.25 relative z-10 bg-background flex items-center">
        <div className="absolute bottom-0 left-0 h-px bg-border w-full -z-10" />
        <div className="flex h-full w-max items-stretch">
          {Children.map(filteredChildren, (child) => (
            <Fragment key={child?.props.label}>
              <div
                className={cn(
                  "group relative border-t-2 border-transparent pb-1 px-3 flex items-center gap-2 transition-all font-medium text-muted-foreground cursor-pointer hover:text-foreground",
                  {
                    "border-primary bg-card text-foreground-primary":
                      activeTab === child.props.label,
                  }
                )}
                onClick={() => setActiveTab(child.props.label)}
              >
                {child.props.label}
              </div>
              <div className="w-px mb-px bg-border" />
            </Fragment>
          ))}
        </div>
        {suffix}
      </div>
      <div className="w-full h-full">{activeChild}</div>
    </div>
  );
};

Tabs.Item = Item;
