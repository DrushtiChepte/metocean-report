"use client";

import { useEffect } from "react";
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { MapSite } from "../types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ sites, selectedSlug }: { sites: MapSite[]; selectedSlug: string }) {
  const map = useMap();

  useEffect(() => {
    const activeSite = sites.find((site) => site.slug === selectedSlug && site.coordinates);
    const coordSites = sites.filter((site) => site.coordinates);

    if (activeSite?.coordinates) {
      map.setView([activeSite.coordinates.latitude, activeSite.coordinates.longitude], 9);
      return;
    }

    if (coordSites.length) {
      const bounds = L.latLngBounds(
        coordSites.map((site) => [site.coordinates!.latitude, site.coordinates!.longitude]),
      );
      map.fitBounds(bounds, { padding: [40, 40] });
      return;
    }

    map.setView([24.5, 54.1], 6);
  }, [map, selectedSlug, sites]);

  return null;
}

export default function HarborMap({
  mapSites,
  selectedSlug,
}: {
  mapSites: MapSite[];
  selectedSlug: string;
}) {
  return (
    <div className="map-shell">
      <MapContainer className="map-canvas" center={[24.5, 54.1]} zoom={6} scrollWheelZoom={false}>
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <FitBounds sites={mapSites} selectedSlug={selectedSlug} />
        {mapSites
          .filter((site) => site.coordinates)
          .map((site) => (
            <Marker key={site.slug} position={[site.coordinates!.latitude, site.coordinates!.longitude]}>
              <Popup>
                <div className="popup-card">
                  <strong>{site.label}</strong>
                  <div>
                    {site.coordinates!.latitude.toFixed(2)}, {site.coordinates!.longitude.toFixed(2)}
                  </div>
                  <p>{site.note}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
