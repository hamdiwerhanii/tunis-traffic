import { type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-white/10 hover:text-foreground",
        outline: "border border-border text-foreground hover:bg-white/5",
        favorite:
          "border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const Button = ({ className, variant, size, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
);

export default Button;
