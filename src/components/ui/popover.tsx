import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef(
  (
    props: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
      className?: string;
      align?: "start" | "center" | "end";
      sideOffset?: number;
    },
    ref: React.Ref<React.ComponentRef<typeof PopoverPrimitive.Content>>
  ) => {
    const { className, align = "center", sideOffset = 4, ...rest } = props;
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
            className
          )}
          {...rest}
        />
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
