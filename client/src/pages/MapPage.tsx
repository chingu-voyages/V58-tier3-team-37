import L, { Icon } from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import { nanoid } from "nanoid";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { useNavigate } from "react-router-dom";
import countries from "../assets/countries.json";
import markerIcon from "../assets/images/maps-and-flags.png";
import FilterBar from "../components/FilterBar";
import {
  useCountryCode,
  useGender,
  useHasFilters,
  useRole,
  useSoloProjectTier,
  useVoyageTier,
  useYearJoined,
} from "../stores/filterStore";
import { useMembers, useMembersActions } from "../stores/membersStore";
import buildFilters from "../utils/buildFilters";

const customIcon = new Icon({
  iconUrl: markerIcon,
  iconSize: [38, 38],
});

// const geoJsonStyle = {
//   fillColor: "#D3D3D3",
//   weight: 1,
//   opacity: 1,
//   color: "white",
//   fillOpacity: 0.7,
// };
// const geoJsonHighlightStyle = {
//   fillColor: "#FFA500",
//   weight: 2,
//   color: "#666",
//   fillOpacity: 0.7,
// };

const createClusterIcon = (cluster: L.MarkerCluster) => {
  return L.divIcon({
    html: `<div class="h-9 w-9 rounded-full -translate-1/4 flex items-center justify-center rounded-full bg-primary-brand font-bold text-lg">${cluster.getChildCount()}</div>`,
    className: "custom-cluster-icon",
  });
};

// const zoomToFeature = (e: L.LeafletMouseEvent) => {
//   const layer = e.target;
//   layer.setStyle(geoJsonHighlightStyle);
//   layer.bringToFront();
// };

// const onEachFeature = (_feature: any, layer: L.Layer) => {
//   layer.on({
//     mouseover: (e: L.LeafletMouseEvent) => {
//       const layer = e.target;
//       layer.setStyle(geoJsonHighlightStyle);
//       layer.bringToFront();
//     },
//     mouseout: (e: L.LeafletMouseEvent) => {
//       const layer = e.target;
//       layer.setStyle(geoJsonStyle);
//     },
//     click: (e: L.LeafletMouseEvent) => {
//       const layer = e.target;
//       const map = layer._map;
//       if (map && typeof layer.getBounds === "function") {
//         map.fitBounds(layer.getBounds(), { padding: [30, 30] });
//       }
//     },
//   });
// };

export default function MapPage() {
  const hasFilters = useHasFilters();
  const navigate = useNavigate();
  const members = useMembers();
  const { fetchAllMembers, resetMembers, resetOffset } = useMembersActions();
  const gender = useGender();
  const countryCode = useCountryCode();
  const yearJoined = useYearJoined();
  const role = useRole();
  const soloProjectTier = useSoloProjectTier();
  const voyageTier = useVoyageTier();
  //   const isLoading = useIsLoading();

  useEffect(() => {
    if (!hasFilters) {
      navigate("/search", { state: { redirectedFrom: "/map" } });
    }
  }, [hasFilters]);

  const filters = buildFilters(gender, countryCode, role, soloProjectTier);

  useEffect(() => {
    resetMembers();
    resetOffset();
    fetchAllMembers(filters);
  }, [gender, countryCode, role, soloProjectTier]);

  const filteredMembers = members.filter((member) => {
    if (gender !== "" && member.gender.toLowerCase() !== gender.toLowerCase()) {
      return false;
    }
    if (
      countryCode !== "" &&
      member.countryCode.toLowerCase() !== countryCode.toLowerCase()
    ) {
      return false;
    }
    if (role !== "" && member.role.toLowerCase() !== role.toLowerCase()) {
      return false;
    }
    if (
      soloProjectTier !== null &&
      member.soloProjectTier !== soloProjectTier
    ) {
      return false;
    }
    if (voyageTier !== "" && !member.voyageTiers.includes(voyageTier)) {
      return false;
    }
    if (
      yearJoined !== "" &&
      new Date(member.timestamp).getFullYear().toString() !== yearJoined
    ) {
      return false;
    }
    return true;
  });

  const countryLookup = Object.fromEntries(
    countries.map((c) => [
      c.country,
      { lat: c.latitude, lng: c.longitude, name: c.name },
    ]),
  );

  const markers = useMemo(() => {
    return filteredMembers
      .map((member) => {
        const data = countryLookup[member.countryCode];
        if (!data) return null;
        return {
          position: [data.lat, data.lng],
          popupText: `Chingu_${member.id}`,
          id: member.id,
        };
      })
      .filter(Boolean);
  }, [filteredMembers, countryLookup]);

  return (
    <div className="flex h-screen flex-col">
      <FilterBar />
      <div className="z-0 m-auto h-11/12 w-11/12 p-4">
        <MapContainer
          center={[40, -100]}
          zoom={4}
          minZoom={3}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={1}
          className="h-full"
        >
          <TileLayer
            url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=37f92206f78e4b5488df71090004fce9"
            attribution='Maps &copy; <a href="https://www.thunderforest.com">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            maxZoom={19}
            noWrap={true}
          />

          {/* <GeoJSON
          data={geoJsonData as GeoJsonObject}
          style={geoJsonStyle}
            onEachFeature={onEachFeature}
        /> */}
          <MarkerClusterGroup
            chunkedLoading={true}
            chunkInterval={50}
            chunkDelay={20}
            removeOutsideVisibleBounds={true}
            maxClusterRadius={60}
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            iconCreateFunction={createClusterIcon}
          >
            {markers.map((marker) => {
              if (!marker) {
                return null;
              }
              return (
                <Marker
                  key={marker.id + nanoid()}
                  position={[marker.position[0], marker.position[1]]}
                  icon={customIcon}
                >
                  <Popup>{marker.popupText}</Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
