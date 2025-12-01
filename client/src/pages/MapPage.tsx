import type { GeoJsonObject } from "geojson";
import L, { Icon } from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { useNavigate } from "react-router-dom";
import markerIcon from "../assets/images/maps-and-flags.png";
import geoJsonData from "../assets/world.geo.json";
import { useHasFilters } from "../stores/filterStore";

export default function MapPage() {
  const hasFilters = useHasFilters();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFilters) {
      navigate("/search", { state: { redirectedFrom: "/map" } });
    }
  }, [hasFilters]);

  const markers = [
    // Example marker data
    { position: [48.8566, 2.3522], popupText: "Marker 1" },
  ];

  const customIcon = new Icon({
    iconUrl: markerIcon,
    iconSize: [38, 38],
  });

  const createClusterIcon = (cluster: L.MarkerCluster) => {
    return L.divIcon({
      html: `<div class="h-9 w-9 rounded-full -translate-1/4 flex items-center justify-center rounded-full bg-primary font-bold text-lg">${cluster.getChildCount()}</div>`,
      className: "custom-cluster-icon",
    });
  };
  const geoJsonStyle = {
    fillColor: "#D3D3D3",
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7,
  };
  const geoJsonHighlightStyle = {
    fillColor: "#FFA500",
    weight: 2,
    color: "#666",
    fillOpacity: 0.7,
  };
  const zoomToFeature = (e: L.LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle(geoJsonHighlightStyle);
    layer.bringToFront();
  };
  const resetHighlight = (e: L.LeafletMouseEvent) => {
    const layer = e.target;
    layer.setStyle(geoJsonStyle);
  };

  const onEachFeature = (_feature: any, layer: L.Layer) => {
    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle(geoJsonHighlightStyle);
        layer.bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const layer = e.target;
        layer.setStyle(geoJsonStyle);
      },
      click: (e: L.LeafletMouseEvent) => {
        zoomToFeature(e);
      },
    });
  };

  return (
    <div className="h-dvh p-4">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1}
        className="h-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          data={geoJsonData as GeoJsonObject}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          iconCreateFunction={createClusterIcon}
        >
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.position[0], marker.position[1]]}
              icon={customIcon}
            >
              <Popup>{marker.popupText}</Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
