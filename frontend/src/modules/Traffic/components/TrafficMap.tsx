"use client";

import type * as Leaflet from "leaflet";
import { useEffect, useRef, useState } from "react";

import { isMobileLayout, prefersReducedMotion } from "@/lib/media";
import {
  BASE_TILES,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  ROUTE_COLORS,
  TRAFFIC_TILES,
  TUNIS_CENTER,
  TUNISIA_BOUNDS,
} from "@/modules/Traffic/constants/map";
import { useTrafficStatus } from "@/modules/Traffic/hooks/useTrafficStatus";
import { useMapStore } from "@/modules/Traffic/store/map.store";
import type { RoutePlan } from "@/modules/Traffic/types";

type LeafletModule = typeof Leaflet;

const routeColor = (route: RoutePlan): string => {
  if (!route.liveTraffic) return ROUTE_COLORS.noTraffic;
  if (route.delayMinutes >= 10) return ROUTE_COLORS.heavy;
  if (route.delayMinutes >= 3) return ROUTE_COLORS.moderate;
  return ROUTE_COLORS.clear;
};

const textPopup = (text: string): HTMLElement => {
  const element = document.createElement("span");
  element.textContent = text;
  return element;
};


const TrafficMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { liveTraffic } = useTrafficStatus();
  const focus = useMapStore((state) => state.focus);
  const selectedPlace = useMapStore((state) => state.selectedPlace);
  const userLocation = useMapStore((state) => state.userLocation);
  const route = useMapStore((state) => state.route);
  const destination = useMapStore((state) => state.destination);

  useEffect(() => {
    let cancelled = false;

    void import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [TUNIS_CENTER.lat, TUNIS_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        maxBounds: TUNISIA_BOUNDS,
        maxBoundsViscosity: 0.8,
        zoomControl: false,
      });

      L.tileLayer(BASE_TILES.url, { attribution: BASE_TILES.attribution, maxZoom: 19 }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      map.attributionControl.setPrefix(false);

      leafletRef.current = L;
      mapRef.current = map;
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!isReady || !map || !L || !liveTraffic) return;

    const options = {
      minZoom: TRAFFIC_TILES.minZoom,
      maxZoom: MAX_ZOOM,
      opacity: 0.85,
      attribution: TRAFFIC_TILES.attribution,
    };
    const layer = L.layerGroup([
      L.tileLayer(TRAFFIC_TILES.flow, options),
      L.tileLayer(TRAFFIC_TILES.incidents, options),
    ]).addTo(map);

    return () => {
      layer.remove();
    };
  }, [isReady, liveTraffic]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isReady || !map || !focus) return;

    const target: [number, number] = [focus.lat, focus.lng];
    if (prefersReducedMotion()) map.setView(target, focus.zoom);
    else map.flyTo(target, focus.zoom, { duration: 0.8 });
  }, [isReady, focus]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!isReady || !map || !L || !selectedPlace) return;

    const marker = L.marker([selectedPlace.lat, selectedPlace.lng], {
      icon: L.divIcon({ className: "map-pin map-pin--place", iconSize: [28, 28], iconAnchor: [14, 28] }),
      title: selectedPlace.name,
      alt: selectedPlace.name,
    })
      .bindPopup(textPopup(selectedPlace.name), { offset: [0, -24] })
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [isReady, selectedPlace]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!isReady || !map || !L || !userLocation) return;

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({ className: "map-user", iconSize: [18, 18], iconAnchor: [9, 9] }),
      title: "Your location",
      alt: "Your location",
      zIndexOffset: 1000,
    }).addTo(map);

    return () => {
      marker.remove();
    };
  }, [isReady, userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!isReady || !map || !L || !route) return;

    const line = L.polyline(route.path, { color: routeColor(route), weight: 6, opacity: 0.9 });
    const group = L.layerGroup([line]);

    if (destination) {
      L.marker([destination.lat, destination.lng], {
        icon: L.divIcon({ className: "map-pin map-pin--destination", iconSize: [28, 28], iconAnchor: [14, 28] }),
        title: destination.name,
        alt: destination.name,
      })
        .bindPopup(textPopup(destination.name), { offset: [0, -24] })
        .addTo(group);
    }

    group.addTo(map);
    map.fitBounds(line.getBounds(), {
      paddingTopLeft: isMobileLayout() ? [24, 170] : [440, 40],
      paddingBottomRight: isMobileLayout() ? [24, 230] : [40, 40],
      animate: !prefersReducedMotion(),
    });

    return () => {
      group.remove();
    };
  }, [isReady, route, destination]);

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="region"
        aria-label="Map of Tunis with live traffic"
      />
      {!isReady && (
        <div className="absolute inset-0 grid place-items-center bg-background" role="status">
          <span className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <span className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            Loading map…
          </span>
        </div>
      )}
    </div>
  );
};

export default TrafficMap;
