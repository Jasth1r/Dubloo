# Dubloo

A crowdsourced restroom finder for the University of Washington campus. Built with React, Leaflet, and Three.js.

**Author:** Jacob Zhang

## Features

- **Interactive Campus Map** — Full-screen dark-themed map displaying 24 UW restroom locations across libraries, academic buildings, sports venues, and museums
- **Building Info Popups** — Click any marker to see the building photo, restroom floor, operating hours, and access policy (e.g. Husky Card required)
- **Locate Me** — Uses browser geolocation to show your current position on the map
- **Find Nearest Restroom** — Calculates the closest restroom from your location and flies to it automatically
- **Personal Notes** — Add private notes to any restroom, saved locally in the browser (no account needed)
- **Particle Onboarding** — Animated landing page where particles assemble into the "Dubloo" logo, with interactive mouse repulsion
- **Fan-shaped Dock** — Floating toolbar that expands into an arc menu for quick access to Locate Me, Nearest, and Lock Screen

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite |
| Map | Leaflet + react-leaflet |
| 3D Animation | Three.js |
| Routing | React Router v7 |
| Styling | Custom CSS (dark glassmorphism theme) |
| Storage | Browser localStorage |

## Project Structure

```
src/
  main.jsx          # App entry point
  App.jsx           # Router setup (Onboarding → Homepage)
  Onboarding.jsx    # Three.js particle landing page
  Homepage.jsx      # Full-screen map wrapper
  Map.jsx           # Leaflet map, markers, popups, notes, dock
  index.css         # All styles (dark theme, map, animations)

public/img/         # Building photos (24 locations)

Draft1/             # Early HTML/CSS wireframe prototype
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Onboarding | Particle animation welcome screen, click to enter |
| `/home` | Homepage | Full-screen interactive restroom map |

## Architecture Details

### Particle Onboarding (`Onboarding.jsx`)

The landing page renders "Dubloo" as a particle system using Three.js. Text is rasterized to an offscreen canvas, sampled at every 3px, and converted into `BufferGeometry` points. Each particle starts at a random position and springs toward its target using velocity + damping physics. Mouse proximity triggers a repulsion force:

```js
if (dist < repulsionRadius && dist > 0.1) {
  const force = ((repulsionRadius - dist) / repulsionRadius) * repulsionStrength;
  velocities[idx] += (dx / dist) * force;
  velocities[idx + 1] += (dy / dist) * force;
}
velocities[idx] += (originalPositions[idx] - px) * returnStrength;
velocities[idx] *= damping;
```

A background layer of 15,000 stars with per-particle phase/speed creates a twinkling effect via batched color updates.

### Map & Markers (`Map.jsx`)

The map uses CartoDB Dark Matter tiles with custom `divIcon` markers styled via CSS (`.restroom-dot` + `.restroom-glow`). Each marker opens a styled popup (`bubble-popup`) showing building info and a `NoteWidget`.

**Nearest restroom** uses the Haversine formula to sort all 24 locations by distance from the user:

```js
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
```

### Fan-shaped Dock

The toolbar uses CSS custom properties to position buttons along an arc:

```css
.map-fan-btn {
  --fan-angle: calc(var(--fan-start) + var(--fan-index) * var(--fan-step));
  transform:
    rotate(var(--fan-angle))
    translateY(var(--fan-radius))
    rotate(calc(-1 * var(--fan-angle)))
    scale(0);
}

.map-brand-dock.is-open .map-fan-btn {
  transform: ... scale(1);
  opacity: 1;
}
```

Each button is rotated to its arc position, pushed outward by `--fan-radius`, then counter-rotated to stay upright. The `scale(0) → scale(1)` transition with staggered `transition-delay` creates the fan-open animation.

### Personal Notes (`NoteWidget`)

A lightweight per-restroom note system using `localStorage`:

```js
const storageKey = `dubloo-note:${building}`;
const [note, setNote] = useState(() => localStorage.getItem(storageKey) || '');
```

Three states: empty (show "+ Add Note" button) → saved (show note with "tap to edit") → editing (textarea with Save/Delete/Cancel). No backend required.
