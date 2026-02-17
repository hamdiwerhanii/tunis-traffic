"use client";

import { useCallback, useRef, useState } from "react";
import type L from "leaflet";
import useMapStore from "@/shared/store/mapStore";

const getLeaflet = async () => {
    const leaflet = await import("leaflet");
    return leaflet.default;
};

type NominatimResult = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
};

type RouteResult = {
    durationText: string;
    durationMinutes: number;
    distanceText: string;
};

export const useLeafletMap = () => {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const leafletRef = useRef<typeof L | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const { setCenter, setUserLocation, setIsLocating, setSelectedPlace } = useMapStore();

    const initMap = useCallback(
        async (mapElement: HTMLDivElement) => {
            if (mapRef.current) return;

            const leaflet = await getLeaflet();
            leafletRef.current = leaflet;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = leaflet.map(mapElement, {
                center: [36.8065, 10.1815],
                zoom: 13,
                zoomControl: false,
            });

            // OpenStreetMap base tiles
            leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // TomTom real-time traffic — always on
            const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
            if (tomtomKey) {
                leaflet.tileLayer(
                    `https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${tomtomKey}&tileSize=256&thickness=20`,
                    { maxZoom: 19, opacity: 0.9 }
                ).addTo(map);

                leaflet.tileLayer(
                    `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${tomtomKey}&tileSize=256`,
                    { maxZoom: 19, opacity: 0.9 }
                ).addTo(map);
            }

            leaflet.control.zoom({ position: "bottomright" }).addTo(map);

            mapRef.current = map;
            setIsLoaded(true);
        },
        []
    );

    const panToPlace = useCallback(
        (lat: number, lng: number, name?: string) => {
            if (!mapRef.current || !leafletRef.current) return;
            const L = leafletRef.current;

            mapRef.current.setView([lat, lng], 16, { animate: true });
            setCenter({ lat, lng });

            if (markerRef.current) {
                markerRef.current.remove();
            }

            const marker = L.marker([lat, lng])
                .addTo(mapRef.current)
                .bindPopup(name || "Selected location")
                .openPopup();

            markerRef.current = marker;
        },
        [setCenter]
    );

    const searchPlace = useCallback(
        async (query: string): Promise<NominatimResult[]> => {
            if (!query.trim()) return [];

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?` +
                    `format=json&q=${encodeURIComponent(query)}&countrycodes=tn&limit=5&addressdetails=1`,
                    { headers: { "Accept-Language": "en" } }
                );
                return await response.json();
            } catch (error) {
                console.error("Search failed:", error);
                return [];
            }
        },
        []
    );

    const selectSearchResult = useCallback(
        (result: NominatimResult) => {
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);

            panToPlace(lat, lng, result.display_name.split(",")[0]);

            setSelectedPlace({
                name: result.display_name.split(",")[0],
                address: result.display_name,
                lat,
                lng,
            });
        },
        [panToPlace, setSelectedPlace]
    );

    const locateUser = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude: lat, longitude: lng } = position.coords;
                setUserLocation({ lat, lng });
                setIsLocating(false);
                panToPlace(lat, lng, "My Location");
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsLocating(false);
                alert("Could not detect your location. Please check permissions.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }, [setUserLocation, setIsLocating, panToPlace]);

    const calculateRoute = useCallback(
        async (
            origin: { lat: number; lng: number },
            destination: { lat: number; lng: number },
            _arrivalTime?: Date
        ): Promise<RouteResult | null> => {
            if (!mapRef.current || !leafletRef.current) return null;
            const L = leafletRef.current;
            const tomtomKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

            if (routeLayerRef.current) {
                routeLayerRef.current.remove();
                routeLayerRef.current = null;
            }

            try {
                const originStr = `${origin.lat},${origin.lng}`;
                const destStr = `${destination.lat},${destination.lng}`;
                const arriveAt = _arrivalTime ? `&arriveAt=${_arrivalTime.toISOString()}` : "";

                // Request 5 alternative routes, then pick the one with LEAST traffic
                const response = await fetch(
                    `https://api.tomtom.com/routing/1/calculateRoute/${originStr}:${destStr}/json` +
                    `?key=${tomtomKey}` +
                    `&traffic=true` +
                    `&travelMode=car` +
                    `&routeType=fastest` +
                    `&maxAlternatives=5` +
                    arriveAt
                );
                const data = await response.json();

                if (!data.routes?.length) return null;

                // Pick route with the LEAST traffic delay (avoids congestion)
                const bestRoute = data.routes.reduce(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (best: any, current: any) => {
                        const bestDelay = best.summary.trafficDelayInSeconds || 0;
                        const currentDelay = current.summary.trafficDelayInSeconds || 0;
                        return currentDelay < bestDelay ? current : best;
                    },
                    data.routes[0]
                );

                const leg = bestRoute.legs[0];
                const summary = bestRoute.summary;

                const durationSeconds = summary.travelTimeInSeconds;
                const durationMinutes = Math.round(durationSeconds / 60);
                const distanceKm = (summary.lengthInMeters / 1000).toFixed(1);

                const delaySeconds = summary.trafficDelayInSeconds || 0;
                const delayMinutes = Math.round(delaySeconds / 60);

                // Draw route on the map
                const coordinates: [number, number][] = leg.points.map(
                    (pt: { latitude: number; longitude: number }) =>
                        [pt.latitude, pt.longitude] as [number, number]
                );

                // Color based on delay
                let routeColor = "#22c55e"; // green
                if (delayMinutes >= 10) {
                    routeColor = "#ef4444"; // red
                } else if (delayMinutes >= 5) {
                    routeColor = "#f59e0b"; // orange
                } else if (delayMinutes >= 2) {
                    routeColor = "#eab308"; // yellow
                }

                const polyline = L.polyline(coordinates, {
                    color: routeColor,
                    weight: 6,
                    opacity: 0.9,
                }).addTo(mapRef.current!);

                routeLayerRef.current = polyline;
                mapRef.current!.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                const hours = Math.floor(durationMinutes / 60);
                const mins = durationMinutes % 60;
                const durationText = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;

                const trafficNote = delayMinutes > 0
                    ? ` (${delayMinutes} min delay)`
                    : " (no traffic delay)";

                return {
                    durationText: durationText + trafficNote,
                    durationMinutes,
                    distanceText: `${distanceKm} km`,
                };
            } catch (error) {
                console.error("Route calculation failed:", error);
                return null;
            }
        },
        []
    );

    const clearRoute = useCallback(() => {
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
            routeLayerRef.current = null;
        }
    }, []);

    return {
        initMap,
        isLoaded,
        panToPlace,
        searchPlace,
        selectSearchResult,
        locateUser,
        calculateRoute,
        clearRoute,
    };
};
