import {createRoot} from 'react-dom/client';
import * as maplibregl from 'maplibre-gl';
import App from './App.tsx';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';

// Configure MapLibre GL to use the worker script in public directory
if (typeof window !== 'undefined') {
  maplibregl.config.WORKER_URL = '/maplibre-gl-worker.mjs';
}

createRoot(document.getElementById('root')!).render(<App />);
