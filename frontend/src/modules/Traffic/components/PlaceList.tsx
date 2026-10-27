import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/shared/components/Button";

type PlaceListProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  empty: ReactNode;
  errorText: string;
  onRetry: () => void;
  children: ReactNode;
};

const PlaceList = ({ isLoading, isError, isEmpty, empty, errorText, onRetry, children }: PlaceListProps) => {
  if (isLoading) {
    return (
      <p role="status" className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Loading…
      </p>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="space-y-2 py-4 text-center text-xs text-red-200">
        <p>{errorText}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (isEmpty) return <p className="py-6 text-center text-xs leading-relaxed text-muted-foreground">{empty}</p>;

  return <ul className="space-y-1">{children}</ul>;
};

export default PlaceList;
