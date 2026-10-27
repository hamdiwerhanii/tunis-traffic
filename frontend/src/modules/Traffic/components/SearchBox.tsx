"use client";

import { LoaderCircle, MapPin, Search, X } from "lucide-react";
import { type KeyboardEvent, useId, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { MIN_QUERY_LENGTH, usePlaceSearch } from "@/modules/Traffic/hooks/usePlaceSearch";
import { useSearchHistory } from "@/modules/Traffic/hooks/useSearchHistory";
import { useMapStore } from "@/modules/Traffic/store/map.store";
import type { PlaceResult } from "@/modules/Traffic/types";

const SearchBox = () => {
  const [term, setTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const { places, isSearching, isError, isSettled } = usePlaceSearch(term);
  const { record } = useSearchHistory();
  const selectPlace = useMapStore((state) => state.selectPlace);

  const hasQuery = term.trim().length >= MIN_QUERY_LENGTH;
  const showList = isOpen && hasQuery && (places.length > 0 || isError || isSettled);

  const choose = (place: PlaceResult) => {
    selectPlace(place);
    record.mutate({ query: term.trim() || place.name, place });
    setTerm(place.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!places.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + places.length) % places.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(places[Math.max(activeIndex, 0)]);
    }
  };

  const clear = () => {
    setTerm("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
    }}>
      <div className="panel flex items-center gap-2 rounded-xl px-3.5 focus-within:outline-2 focus-within:outline-ring">
        {isSearching ? (
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        )}
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search a street or place in Tunisia
        </label>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          value={term}
          placeholder="Search a street or place…"
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          onChange={(event) => {
            setTerm(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
        />
        {term && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
          >
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Places found"
          className="panel absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl py-1"
        >
          {isError && (
            <li role="option" aria-selected={false} aria-disabled className="px-4 py-3 text-sm text-red-300">
              Search is unavailable right now. Try again in a moment.
            </li>
          )}
          {!isError && places.length === 0 && (
            <li role="option" aria-selected={false} aria-disabled className="px-4 py-3 text-sm text-muted-foreground">
              No place found in Tunisia for &quot;{term.trim()}&quot;.
            </li>
          )}
          {places.map((place, index) => (
            <li
              key={place.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "flex cursor-pointer items-start gap-3 px-4 py-2.5",
                index === activeIndex ? "bg-primary/20" : "hover:bg-white/5",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(place)}
            >
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{place.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{place.address}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
