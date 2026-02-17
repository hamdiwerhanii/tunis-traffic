import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-white/5 text-muted-foreground hover:text-foreground",
                outline:
                    "border border-border bg-transparent hover:bg-white/5 text-foreground",
                destructive:
                    "bg-destructive text-white hover:bg-destructive/90",
                accent:
                    "bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3 text-xs",
                lg: "h-12 px-6 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
