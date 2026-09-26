import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* =========================================
   LEAFLET ICON
========================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* =========================================
   MAP CENTER
========================================= */

const defaultCenter = [43.65, 51.16];

/* =========================================
   MOVE MAP
========================================= */

function MapController({ selectedPlace }) {
  const map = useMap();

  React.useEffect(() => {
    if (!selectedPlace) return;

    const lat = Number(selectedPlace.latitude);
    const lng = Number(selectedPlace.longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      map.flyTo([lat, lng], 10, {
        duration: 1,
      });
    }
  }, [selectedPlace, map]);

  return null;
}

/* =========================================
   MAP
========================================= */

function Map({
  places = [],
  selectedPlace = null,
  onSelectPlace,
}) {
  return (
    <div className="mangystau-map-wrapper">

      {/* =====================================
          MAP
      ===================================== */}

      <MapContainer
        center={defaultCenter}
        zoom={8}
        scrollWheelZoom={true}
        className="mangystau-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedPlace={selectedPlace}
        />

        {places.map((place) => {
          const latitude = Number(place.latitude);
          const longitude = Number(place.longitude);

          if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
          ) {
            return null;
          }

          return (
            <Marker
              key={place.id}
              position={[
                latitude,
                longitude,
              ]}
              eventHandlers={{
                click: () => {
                  if (onSelectPlace) {
                    onSelectPlace(place);
                  }
                },
              }}
            >
              <Popup>
                <div className="map-popup">

                  <div className="map-popup-emoji">
                    {place.emoji || "📍"}
                  </div>

                  <h3>
                    {place.name}
                  </h3>

                  {place.category && (
                    <div className="map-popup-category">
                      {place.category}
                    </div>
                  )}

                  {place.description && (
                    <p>
                      {place.description}
                    </p>
                  )}

                  {place.distance && (
                    <div className="map-popup-distance">
                      📍 {place.distance}
                    </div>
                  )}

                  <button
                    className="map-popup-button"
                    onClick={() => {
                      if (onSelectPlace) {
                        onSelectPlace(place);
                      }
                    }}
                  >
                    Подробнее
                  </button>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* =====================================
          TOP LEFT LABEL
      ===================================== */}

      <div className="map-overlay-label">

        <span>
          🗺️
        </span>

        <div>
          <strong>
            MANGYSTAU
          </strong>

          <small>
            GO MAP
          </small>
        </div>

      </div>

      {/* =====================================
          PLACES COUNT
      ===================================== */}

      <div className="map-info-badge">
        📍 {places.length} мест
      </div>

    </div>
  );
}

export default Map;