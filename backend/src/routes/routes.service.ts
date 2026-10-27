import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { fetchJson } from '../common/http/fetch-upstream.js';
import { AppConfigService } from '../config/app-config.service.js';
import { PlanRouteQueryDto } from './dto/plan-route.query.dto.js';
import { RouteResponseDto } from './dto/route-response.dto.js';

type TomTomRoute = {
  summary: {
    lengthInMeters: number;
    travelTimeInSeconds: number;
    trafficDelayInSeconds?: number;
    departureTime: string;
    arrivalTime: string;
  };
  legs: { points: { latitude: number; longitude: number }[] }[];
};

type OsrmResponse = {
  code: string;
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
};

const MAX_PLANNING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const PAST_TOLERANCE_MS = 60 * 1000;

const toMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));
const toKm = (meters: number) => Math.round(meters / 100) / 10;

@Injectable()
export class RoutesService {
  constructor(private readonly config: AppConfigService) {}

  plan(query: PlanRouteQueryDto): Promise<RouteResponseDto> {
    const arriveAt = query.arriveAt ? this.parseArrival(query.arriveAt) : undefined;
    return this.config.tomtomApiKey
      ? this.planWithTomTom(query, this.config.tomtomApiKey, arriveAt)
      : this.planWithOsrm(query, arriveAt);
  }

  private parseArrival(value: string): Date {
    const arriveAt = new Date(value);
    const now = Date.now();

    if (arriveAt.getTime() < now - PAST_TOLERANCE_MS) {
      throw new BadRequestException('Arrival time must be in the future');
    }
    if (arriveAt.getTime() > now + MAX_PLANNING_WINDOW_MS) {
      throw new BadRequestException('Arrival time must be within the next 7 days');
    }
    return arriveAt;
  }

  private async planWithTomTom(
    query: PlanRouteQueryDto,
    key: string,
    arriveAt?: Date,
  ): Promise<RouteResponseDto> {
    const locations = `${query.fromLat},${query.fromLng}:${query.toLat},${query.toLng}`;
    const params = new URLSearchParams({
      key,
      traffic: 'true',
      travelMode: 'car',
      routeType: 'fastest',
      maxAlternatives: '2',
    });
    if (arriveAt) params.set('arriveAt', arriveAt.toISOString());

    const data = await fetchJson<{ routes?: TomTomRoute[] }>(
      `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?${params.toString()}`,
      { service: 'Route planning' },
    );
    if (!data.routes?.length) throw new ServiceUnavailableException('No route found');

    const best = data.routes.reduce((fastest, route) =>
      route.summary.travelTimeInSeconds < fastest.summary.travelTimeInSeconds ? route : fastest,
    );

    return {
      provider: 'tomtom',
      liveTraffic: true,
      distanceKm: toKm(best.summary.lengthInMeters),
      durationMinutes: toMinutes(best.summary.travelTimeInSeconds),
      delayMinutes: Math.round((best.summary.trafficDelayInSeconds ?? 0) / 60),
      departAt: new Date(best.summary.departureTime).toISOString(),
      arriveAt: new Date(best.summary.arrivalTime).toISOString(),
      path: best.legs.flatMap((leg) =>
        leg.points.map((point): [number, number] => [point.latitude, point.longitude]),
      ),
    };
  }

  private async planWithOsrm(query: PlanRouteQueryDto, arriveAt?: Date): Promise<RouteResponseDto> {
    const coordinates = `${query.fromLng},${query.fromLat};${query.toLng},${query.toLat}`;
    const data = await fetchJson<OsrmResponse>(
      `${this.config.osrmUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
      { service: 'Route planning', headers: { 'User-Agent': this.config.userAgent } },
    );
    const route = data.routes?.[0];
    if (data.code !== 'Ok' || !route) throw new ServiceUnavailableException('No route found');

    const durationMs = route.duration * 1000;
    const arrival = arriveAt ?? new Date(Date.now() + durationMs);
    const departure = new Date(arrival.getTime() - durationMs);

    return {
      provider: 'osrm',
      liveTraffic: false,
      distanceKm: toKm(route.distance),
      durationMinutes: toMinutes(route.duration),
      delayMinutes: 0,
      departAt: departure.toISOString(),
      arriveAt: arrival.toISOString(),
      path: route.geometry.coordinates.map(([lng, lat]): [number, number] => [lat, lng]),
    };
  }
}
