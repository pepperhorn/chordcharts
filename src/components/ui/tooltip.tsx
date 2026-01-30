import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(
  (
    props: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
      className?: string;
      sideOffset?: number;
    },
    ref: React.Ref<React.ComponentRef<typeof TooltipPrimitive.Content>>
  ) => {
    const { className, sideOffset = 4, ...rest } = props;
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-primary px-3 py-1.5 text-sm text-primary-foreground",
            className
          )}
          {...rest}
        />
      </TooltipPrimitive.Portal>
    );
  }
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
