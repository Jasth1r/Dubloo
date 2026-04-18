import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './index.css';

// Custom restroom marker — deep blue dot with hover glow via CSS
// AI was used to help design a custom Leaflet divIcon with CSS-driven hover animations
const restroomIcon = L.divIcon({
  className: 'restroom-marker',
  html: '<div class="restroom-dot"><div class="restroom-glow"></div></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

// AI was used to help find the latitude and longitude of each location
const center = [47.655, -122.308];

// AI was used to help verify and correct the latitude and longitude of each UW campus building
const markerData = [
  // ── Existing restroom locations ──
  {
    building: "Mary Gates Hall",
    location: "Basement Restroom",
    image: "img/marygates.jpeg",
    coordinates: [47.6549, -122.3079],
    hours: "7:00 AM – 10:00 PM",
    access: "Requires Husky Card"
  },
  {
    building: "Kane Hall",
    location: "3rd Floor",
    image: "img/kanehall.jpeg",
    coordinates: [47.6561, -122.3093],
    hours: "7:00 AM – 10:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Savery Hall",
    location: "Ground Floor",
    image: "img/sav.jpeg",
    coordinates: [47.6577, -122.3092],
    hours: "7:00 AM – 10:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Paul G. Allen Center",
    location: "2nd Floor",
    image: "img/allen.jpeg",
    coordinates: [47.6531, -122.3058],
    hours: "7:00 AM – 10:00 PM",
    access: "Requires Husky Card"
  },
  {
    building: "Denny Hall",
    location: "Basement",
    image: "img/denny.jpeg",
    coordinates: [47.6590, -122.3101],
    hours: "7:00 AM – 10:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Bagley Hall",
    location: "1st Floor Restroom",
    image: "img/bagley.jpeg",
    coordinates: [47.6535, -122.3092],
    hours: "7:00 AM – 10:00 PM",
    access: "All visitors welcome"
  },

  // ── Sports & Events Venues ──
  {
    building: "HUB (Husky Union Building)",
    location: "Ground Floor Restroom",
    image: "img/hub.jpeg",
    coordinates: [47.6553, -122.3050],
    hours: "7:00 AM – 10:00 PM",
    access: "Husky Card after 5 PM; visitors use Main Entrance"
  },
  {
    building: "Alaska Airlines Arena",
    location: "Hec Edmundson Pavilion",
    image: "img/alaska-arena.jpeg",
    coordinates: [47.6514, -122.3024],
    hours: "Event days only",
    access: "Opens 1 hr before events"
  },
  {
    building: "Husky Stadium",
    location: "Stadium Restrooms",
    image: "img/husky-stadium.jpeg",
    coordinates: [47.6504, -122.3016],
    hours: "Game days only",
    access: "Gates open 2 hrs before kickoff"
  },
  {
    building: "IMA Building",
    location: "Intramural Activities Building",
    image: "img/ima.jpeg",
    coordinates: [47.6520, -122.3012],
    hours: "6:00 AM – 10:30 PM",
    access: "Requires Husky Card"
  },
  {
    building: "Waterfront Activities Center",
    location: "WAC",
    image: "img/wac.jpeg",
    coordinates: [47.6494, -122.3013],
    hours: "Sat–Sun 10:00 AM – 7:00 PM (Apr)",
    access: "Closed weekdays in April"
  },
  {
    building: "Engineering Library",
    location: "Engineering Library Building",
    image: "img/eng-library.jpeg",
    coordinates: [47.6544, -122.3042],
    hours: "9:00 AM – 6:00 PM",
    access: "All visitors welcome"
  },

  // ── Libraries & Academic Buildings ──
  {
    building: "Meany Hall",
    location: "Performing Arts",
    image: "img/meany.jpeg",
    coordinates: [47.6573, -122.3098],
    hours: "8:00 AM – 6:00 PM (Mon–Fri)",
    access: "Husky Card required outside class hours"
  },
  {
    building: "Odegaard Library",
    location: "1st Floor",
    image: "img/ode.jpeg",
    coordinates: [47.6556, -122.3098],
    hours: "8:00 AM – 12:00 AM",
    access: "Requires Husky Card"
  },
  {
    building: "Suzzallo & Allen Libraries",
    location: "Basement",
    image: "img/suzzalo.jpeg",
    coordinates: [47.6555, -122.3083],
    hours: "8:00 AM – 8:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Paccar Hall",
    location: "Foster Business Library",
    image: "img/paccar.jpeg",
    coordinates: [47.6595, -122.3072],
    hours: "9:00 AM – 8:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Gowen Hall",
    location: "Tateuchi East Asia Library, 3rd Floor",
    image: "img/gowen.jpeg",
    coordinates: [47.6588, -122.3078],
    hours: "9:00 AM – 6:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Padelford Hall",
    location: "Mathematics Research Library",
    image: "img/padelford.jpeg",
    coordinates: [47.6575, -122.3055],
    hours: "10:00 AM – 5:00 PM",
    access: "All visitors welcome"
  },
  {
    building: "Music Building",
    location: "Music Library",
    image: "img/music.jpeg",
    coordinates: [47.6590, -122.3118],
    hours: "10:00 AM – 4:30 PM",
    access: "All visitors welcome"
  },
  {
    building: "Hutchinson Hall",
    location: "Drama Library",
    image: "img/hutchinson.jpeg",
    coordinates: [47.6581, -122.3110],
    hours: "1:00 PM – 5:00 PM",
    access: "All visitors welcome"
  },

  // ── Museums & Galleries ──
  {
    building: "Burke Museum",
    location: "Natural History & Culture",
    image: "img/burke.jpeg",
    coordinates: [47.6604, -122.3138],
    hours: "10:00 AM – 5:00 PM",
    access: "All visitors welcome (last admission 4:30 PM)"
  },
  {
    building: "Henry Art Gallery",
    location: "Art Gallery",
    image: "img/henry.jpeg",
    coordinates: [47.6567, -122.3120],
    hours: "Thu 10–7; Fri–Sun 10–5; Mon–Wed Closed",
    access: "All visitors welcome"
  },
  {
    building: "Jacob Lawrence Gallery",
    location: "Art Gallery",
    image: "img/jacob-lawrence.jpeg",
    coordinates: [47.6580, -122.3090],
    hours: "10:00 AM – 5:00 PM (exhibition days)",
    access: "Open during exhibitions only"
  },

  // ── Health Sciences ──
  {
    building: "Health Sciences Building",
    location: "Health Sciences Library",
    image: "img/health-sci.jpeg",
    coordinates: [47.6507, -122.3075],
    hours: "7:30 AM – 6:00 PM",
    access: "Requires Husky Card"
  }
];

// Dark tile layer — CartoDB Dark Matter
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Custom blue icon for user location
// AI was used to help create a custom Leaflet divIcon for the user's location marker
const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: '<div style="width:16px;height:16px;background:#4A90FF;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(74,144,255,0.6);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// AI was used to help understand how to calculate distance between two coordinates using the Haversine formula
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// AI was used to help understand how to use react-leaflet's useMap hook to programmatically fly to a location
function FlyToLocation({ position }) {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

// Inline personal note widget — saves one note per restroom in localStorage
// AI was used to help design the localStorage-based note persistence pattern
function NoteWidget({ building }) {
  const storageKey = `dubloo-note:${building}`;
  const [note, setNote] = useState(() => localStorage.getItem(storageKey) || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note);

  function handleSave() {
    const trimmed = draft.trim();
    if (trimmed) {
      localStorage.setItem(storageKey, trimmed);
      setNote(trimmed);
    } else {
      localStorage.removeItem(storageKey);
      setNote('');
    }
    setEditing(false);
  }

  function handleDelete() {
    localStorage.removeItem(storageKey);
    setNote('');
    setDraft('');
    setEditing(false);
  }

  if (!editing && !note) {
    return (
      <button className="note-add-btn" onClick={() => { setDraft(''); setEditing(true); }}>
        + Add Note
      </button>
    );
  }

  if (!editing) {
    return (
      <div className="note-display" onClick={() => { setDraft(note); setEditing(true); }}>
        <span className="note-text">{note}</span>
        <span className="note-edit-hint">tap to edit</span>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <textarea
        className="note-textarea"
        rows={2}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Write a personal note…"
        autoFocus
      />
      <div className="note-actions">
        <button className="note-save" onClick={handleSave}>Save</button>
        {note && <button className="note-delete" onClick={handleDelete}>Delete</button>}
        <button className="note-cancel" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}

// I used AI to clarify how to Dynamically render markers on a map using a dataset and Handle marker click events to show detail cards for the following function
function MapComponent() {
  const navigate = useNavigate();
  const [userPos, setUserPos] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [locateError, setLocateError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [lockPrimed, setLockPrimed] = useState(false);
  const nearestMarkerRef = useRef(null);
  const dockRef = useRef(null);
  const lockResetTimerRef = useRef(null);

  function resetLockPrimed() {
    if (lockResetTimerRef.current) {
      window.clearTimeout(lockResetTimerRef.current);
      lockResetTimerRef.current = null;
    }
    setLockPrimed(false);
  }

  React.useEffect(() => {
    function handlePointerDown(event) {
      if (menuOpen && dockRef.current && !dockRef.current.contains(event.target)) {
        setMenuOpen(false);
        resetLockPrimed();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        resetLockPrimed();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  React.useEffect(() => {
    return () => {
      if (lockResetTimerRef.current) {
        window.clearTimeout(lockResetTimerRef.current);
      }
    };
  }, []);

  function toggleDock() {
    setMenuOpen((prev) => {
      if (prev) {
        resetLockPrimed();
      }
      return !prev;
    });
  }

  // AI was used to help understand how to use the browser Geolocation API with React state
  function handleLocateMe() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      return;
    }
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setFlyTarget(coords);
        setNearest(null);
      },
      () => {
        setLocateError('Unable to get your location. Please allow location access.');
      }
    );
  }

  function handleFindNearest() {
    if (!userPos) {
      handleLocateMe();
      // After locating, we need to wait for userPos to update, so we use a geolocation callback directly
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          findAndShowNearest(coords);
        },
        () => {
          setLocateError('Unable to get your location. Please allow location access.');
        }
      );
      return;
    }
    findAndShowNearest(userPos);
  }

  function findAndShowNearest(fromCoords) {
    const sorted = [...markerData].sort((a, b) => {
      const distA = getDistanceKm(fromCoords[0], fromCoords[1], a.coordinates[0], a.coordinates[1]);
      const distB = getDistanceKm(fromCoords[0], fromCoords[1], b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    });
    const closestRestroom = sorted[0];
    setNearest(closestRestroom);
    setFlyTarget(closestRestroom.coordinates);
    // Open the popup after a short delay so the map can fly first
    setTimeout(() => {
      if (nearestMarkerRef.current) {
        nearestMarkerRef.current.openPopup();
      }
    }, 1600);
  }

  const nearestDist = userPos && nearest
    ? (getDistanceKm(userPos[0], userPos[1], nearest.coordinates[0], nearest.coordinates[1]) * 1000).toFixed(0)
    : null;

  function armLockAction() {
    setLockPrimed(true);
    if (lockResetTimerRef.current) {
      window.clearTimeout(lockResetTimerRef.current);
    }
    lockResetTimerRef.current = window.setTimeout(() => {
      setLockPrimed(false);
      lockResetTimerRef.current = null;
    }, 1200);
  }

  function handleLockDoubleClick() {
    resetLockPrimed();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <MapContainer
      center={center}
      zoom={16}
      className="map-leaflet-container"
    >
      <TileLayer
        url={DARK_TILE_URL}
        maxZoom={19}
        attribution={DARK_TILE_ATTR}
      />

      <FlyToLocation position={flyTarget} />

      {/* User location marker */}
      {userPos && (
        <>
          <Marker position={userPos} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <Circle center={userPos} radius={30} pathOptions={{ color: '#4A90FF', fillColor: '#4A90FF', fillOpacity: 0.15 }} />
        </>
      )}

      {markerData.map((data, i) => (
        <Marker
          key={i}
          position={data.coordinates}
          icon={restroomIcon}
          ref={nearest && nearest.building === data.building ? nearestMarkerRef : undefined}
        >
          <Popup className="bubble-popup">
            <div className="map-bubble">
              <img
                src={data.image}
                alt={data.building}
                className="map-bubble-image"
              />
              <div className="map-bubble-title">{data.building}</div>
              <div className="map-bubble-location">{data.location}</div>
              <div className="map-bubble-hours">{data.hours}</div>
              <div className={`map-bubble-access ${data.access === 'All visitors welcome' ? 'access-open' : 'access-restricted'}`}>
                {data.access}
              </div>
              {nearest && nearest.building === data.building && nearestDist && (
                <div className="map-bubble-distance">{nearestDist}m away - Nearest!</div>
              )}
              <NoteWidget building={data.building} />
            </div>
          </Popup>
        </Marker>
      ))}

      <div
        ref={dockRef}
        className={`map-brand-dock ${menuOpen ? 'is-open' : ''}`}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          type="button"
          className="map-logo-trigger logo-3d"
          onClick={(event) => {
            event.stopPropagation();
            toggleDock();
          }}
          aria-label={menuOpen ? 'Close Dubloo controls' : 'Open Dubloo controls'}
          aria-expanded={menuOpen}
        >
          <span className="logo-wordmark" data-text="Dubloo">Dubloo</span>
          <span className={`map-logo-trigger-mark ${menuOpen ? 'is-open' : ''}`} aria-hidden="true"></span>
        </button>

        <div
          className="map-fan-items"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="map-fan-btn"
            style={{ '--fan-index': 0 }}
            onClick={() => {
              handleLocateMe();
              setMenuOpen(false);
              resetLockPrimed();
            }}
          >
            <span className="map-fan-icon">📍</span>
            <span className="map-fan-label">Locate Me</span>
          </button>

          <button
            type="button"
            className="map-fan-btn"
            style={{ '--fan-index': 1 }}
            onClick={() => {
              handleFindNearest();
              setMenuOpen(false);
              resetLockPrimed();
            }}
          >
            <span className="map-fan-icon">🚻</span>
            <span className="map-fan-label">Nearest</span>
          </button>

          <button
            type="button"
            className={`map-fan-btn map-brand-lock ${lockPrimed ? 'is-primed' : ''}`}
            style={{ '--fan-index': 2 }}
            onClick={armLockAction}
            onDoubleClick={handleLockDoubleClick}
          >
            <span className="map-fan-icon">✦</span>
            <span className="map-fan-label">
              {lockPrimed ? 'Double-click now' : 'Lock Screen'}
            </span>
          </button>
        </div>

        {locateError && <div className="map-brand-status map-brand-status-error">{locateError}</div>}
        {nearest && nearestDist && (
          <div className="map-brand-status map-brand-status-info">
            {nearest.building} - {nearestDist}m
          </div>
        )}
      </div>
    </MapContainer>
  );
}

export default MapComponent;
