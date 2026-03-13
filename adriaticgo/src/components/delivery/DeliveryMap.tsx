"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in webpack/Next.js
const createIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background-color:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const restaurantIcon = createIcon("#1E40AF"); // primary blue
const deliveryIcon = createIcon("#16A34A"); // green
const driverIcon = createIcon("#F59E0B"); // amber

interface DeliveryMapProps {
  restaurantLat: number;
  restaurantLng: number;
  deliveryLat: number;
  deliveryLng: number;
  driverLat?: number | null;
  driverLng?: number | null;
  restaurantName?: string;
  deliveryAddress?: string;
  className?: string;
}

function FitBounds({
  points,
}: {
  points: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, points]);
  return null;
}

export function DeliveryMap({
  restaurantLat,
  restaurantLng,
  deliveryLat,
  deliveryLng,
  driverLat,
  driverLng,
  restaurantName = "Restaurant",
  deliveryAddress = "Delivery address",
  className = "h-[280px] w-full rounded-xl",
}: DeliveryMapProps) {
  const points = useMemo(() => {
    const pts: [number, number][] = [
      [restaurantLat, restaurantLng],
      [deliveryLat, deliveryLng],
    ];
    if (driverLat != null && driverLng != null) {
      pts.push([driverLat, driverLng]);
    }
    return pts;
  }, [restaurantLat, restaurantLng, deliveryLat, deliveryLng, driverLat, driverLng]);

  const center: [number, number] = [
    (restaurantLat + deliveryLat) / 2,
    (restaurantLng + deliveryLng) / 2,
  ];

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <Marker
          position={[restaurantLat, restaurantLng]}
          icon={restaurantIcon}
        >
          <Popup>{restaurantName}</Popup>
        </Marker>
        <Marker
          position={[deliveryLat, deliveryLng]}
          icon={deliveryIcon}
        >
          <Popup>{deliveryAddress}</Popup>
        </Marker>
        {driverLat != null && driverLng != null && (
          <Marker
            position={[driverLat, driverLng]}
            icon={driverIcon}
          >
            <Popup>You</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
