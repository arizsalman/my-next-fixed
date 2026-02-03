// app/component/MapComponent.jsx
"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import MarkerClusterGroup from "leaflet.markercluster";

// Fix Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// User location icon (blue circle)
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3B82F6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Pulsing animation for user location
const userLocationPulseIcon = L.divIcon({
  className: "user-location-pulse",
  html: `<div style="
    width: 20px;
    height: 20px;
    background: rgba(59, 130, 246, 0.4);
    border-radius: 50%;
    animation: pulse 2s infinite;
  "></div>
  <style>
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.5); opacity: 0; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const statusColors = {
  "Pending": "bg-yellow-500",
  "In Progress": "bg-blue-500",
  "Resolved": "bg-green-500",
};

// Component to handle user location detection
function UserLocationMarker({ showUserLocation, onLocationFound }) {
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!showUserLocation) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);
          if (onLocationFound) onLocationFound(location);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, [showUserLocation, onLocationFound]);

  if (!userLocation) return null;

  return (
    <>
      <Marker position={userLocation} icon={userLocationPulseIcon} zIndexOffset={1000}>
        <Popup>
          <div className="text-center">
            <p className="font-medium">Your Location</p>
          </div>
        </Popup>
      </Marker>
      <Marker position={userLocation} icon={userLocationIcon} zIndexOffset={1001}>
      </Marker>
    </>
  );
}

// Component to fly to user location
function FlyToUserLocation({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.5,
      });
    }
  }, [userLocation, map]);

  return null;
}

// Location picker component
function LocationPicker({ onSelectLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onSelectLocation) {
        onSelectLocation(e.latlng);
      }
    },
  });

  return position ? (
    <Marker position={position} icon={icon}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({ onSelectLocation, issues = [], showUserLocation = false }) {
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create marker cluster group
  const clusterGroup = useMemo(() => {
    return L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let size = "small";
        if (count > 100) size = "large";
        else if (count > 10) size = "medium";

        const className = `marker-cluster marker-cluster-${size}`;

        return L.divIcon({
          html: `<div>${count}</div>`,
          className: className,
          iconSize: L.point(40, 40),
        });
      },
    });
  }, []);

  // Component to handle marker clustering
  function MarkerCluster({ clusterGroup, issues }) {
    const map = useMap();

    useEffect(() => {
      if (!clusterGroup || !issues) return;

      clusterGroup.clearLayers();

      issues.forEach((issue) => {
        const marker = L.marker([issue.latitude, issue.longitude], { icon })
          .bindPopup(`
          <div class="min-w-[200px]">
            <h3 class="font-bold text-lg mb-1">${issue.title}</h3>
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">${issue.description}</p>
            <div class="flex items-center gap-2 mb-2">
              <span class="inline-block px-2 py-0.5 text-xs text-white rounded-full ${statusColors[issue.status] || "bg-gray-500"}">
                ${issue.status || "Pending"}
              </span>
              <span class="text-xs text-gray-500">${issue.category}</span>
            </div>
            <a href="/issues/id?id=${issue._id}" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Details →
            </a>
          </div>
        `);

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);

      return () => {
        if (clusterGroup) {
          map.removeLayer(clusterGroup);
        }
      };
    }, [issues, clusterGroup, map]);

    return null;
  }

  if (!mounted) {
    return (
      <div className="h-[500px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[24.86, 67.00]}
      zoom={12}
      style={{ height: "500px", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* User location marker */}
      <UserLocationMarker
        showUserLocation={showUserLocation}
        onLocationFound={setUserLocation}
      />

      {/* Fly to user location when available */}
      <FlyToUserLocation userLocation={userLocation} />

      {/* Issue markers with clustering */}
      {(issues && issues.length > 0) && <MarkerCluster clusterGroup={clusterGroup} issues={issues} />}

      {/* Location picker (for report page) */}
      <LocationPicker onSelectLocation={onSelectLocation} />
    </MapContainer>
  );
}
