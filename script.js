// GIS Portfolio Website JS
// Extensive comments for easy customization

// 1. Dark Mode Toggle (with localStorage)
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (localStorage.getItem('darkMode') === 'true' || prefersDark) {
  document.body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// 2. Smooth Scroll Navigation
const navLinks = document.querySelectorAll('.nav-list a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 3. ScrollReveal Animations
function revealOnScroll() {
  document.querySelectorAll('.sr').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('DOMContentLoaded', revealOnScroll);

// Add .sr class to all major sections for animation
['.hero-section', '.projects-section', '.gallery-section', '.map-section', '.contact-section'].forEach(sel => {
  const el = document.querySelector(sel);
  if (el) el.classList.add('sr');
});

// 4. Gallery Lightbox
const galleryItems = document.querySelectorAll('.gallery-item img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
galleryItems.forEach(img => {
  img.addEventListener('click', () => {
    // Use data-full if available, otherwise fallback to src
    const fullImg = img.getAttribute('data-full') || img.src;
    lightboxImg.src = fullImg;
    lightboxImg.alt = img.alt || 'Map Preview';
    lightbox.classList.add('active');
  });
});
lightboxClose.addEventListener('click', () => {
  lightbox.classList.remove('active');
  lightboxImg.src = '';
});
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    lightboxImg.src = '';
  }
});

// 5. Leaflet Map Initialization
// Placeholder geoJSON data for markers, polygons, polylines
const markerGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [106.8272, -6.1751] },
      "properties": {
        "title": "Jakarta Project",
        "description": "Urban growth analysis in Jakarta.",
        "image": "https://via.placeholder.com/120x80?text=Jakarta",
        "link": "#"
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [110.3695, -7.7956] },
      "properties": {
        "title": "Yogyakarta StoryMap",
        "description": "Cultural mapping in Yogyakarta.",
        "image": "https://via.placeholder.com/120x80?text=Yogya",
        "link": "#"
      }
    }
  ]
};
const polygonGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [106.80, -6.18], [106.85, -6.18], [106.85, -6.16], [106.80, -6.16], [106.80, -6.18]
        ]]
      },
      "properties": { "name": "Jakarta Study Area" }
    }
  ]
};
const polylineGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [110.36, -7.80], [110.37, -7.79], [110.38, -7.78]
        ]
      },
      "properties": { "name": "Yogyakarta Survey Route" }
    }
  ]
};

// Heatmap points (lat, lng, intensity)
const heatmapPoints = [
  [-6.1751, 106.8272, 0.8],
  [-7.7956, 110.3695, 0.6],
  [-6.17, 106.83, 0.4]
];

// Choropleth sample data (Jakarta districts)
const choroplethGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [106.80, -6.18], [106.85, -6.18], [106.85, -6.16], [106.80, -6.16], [106.80, -6.18]
        ]]
      },
      "properties": { "name": "Central Jakarta", "density": 120 }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [106.85, -6.18], [106.90, -6.18], [106.90, -6.16], [106.85, -6.16], [106.85, -6.18]
        ]]
      },
      "properties": { "name": "East Jakarta", "density": 80 }
    }
  ]
};

// Map initialization
const map = L.map('leaflet-map', {
  center: [-6.5, 107],
  zoom: 6,
  minZoom: 4,
  maxZoom: 18
});

// Base layers
const baseLayers = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }),
  "CartoDB Light": L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '© CartoDB'
  }),
  "CartoDB Dark": L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '© CartoDB'
  }),
  "Esri World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri & contributors'
  })
};
baseLayers["OpenStreetMap"].addTo(map);

// Marker layer with clustering
const markerLayer = L.markerClusterGroup();
L.geoJSON(markerGeoJSON, {
  pointToLayer: function(feature, latlng) {
    const marker = L.marker(latlng);
    const props = feature.properties;
    let popupContent = `<strong>${props.title}</strong><br>${props.description}<br>`;
    if (props.image) popupContent += `<img src='${props.image}' style='width:100px;border-radius:8px;margin:6px 0;'>`;
    if (props.link) popupContent += `<br><a href='${props.link}' target='_blank'>View Project</a>`;
    marker.bindPopup(popupContent);
    marker.bindTooltip(props.title);
    return marker;
  }
}).addTo(markerLayer);

// Polygon layer
const polygonLayer = L.geoJSON(polygonGeoJSON, {
  style: { color: '#2980B9', weight: 2, fillOpacity: 0.2 }
});

// Polyline layer
const polylineLayer = L.geoJSON(polylineGeoJSON, {
  style: { color: '#2C3E50', weight: 3, dashArray: '6 6' }
});

// Heatmap layer
const heatLayer = L.heatLayer(heatmapPoints, { radius: 25, blur: 15, gradient: { 0.4: '#2980B9', 0.8: '#FF5733' } });

// Choropleth layer
function getColor(density) {
  return density > 100 ? '#2980B9' : '#AED6F1';
}
const choroplethLayer = L.geoJSON(choroplethGeoJSON, {
  style: feature => ({
    fillColor: getColor(feature.properties.density),
    weight: 2,
    color: '#fff',
    fillOpacity: 0.6
  }),
  onEachFeature: (feature, layer) => {
    layer.bindPopup(`<strong>${feature.properties.name}</strong><br>Density: ${feature.properties.density}`);
  }
});

// Overlay layers
const overlays = {
  "Project Markers": markerLayer,
  "Study Areas": polygonLayer,
  "Survey Routes": polylineLayer,
  "Heatmap": heatLayer,
  "Choropleth": choroplethLayer
};

// Add overlays to map
markerLayer.addTo(map);
polygonLayer.addTo(map);
polylineLayer.addTo(map);

// Layer control
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

// Scale bar
L.control.scale().addTo(map);

// Attribution
map.attributionControl.setPrefix('GIS Portfolio | Leaflet');

// Search bar (simple implementation)
const searchInput = L.DomUtil.create('input', 'map-search');
searchInput.type = 'text';
searchInput.placeholder = 'Search project...';
searchInput.style = 'position:absolute;top:10px;right:60px;z-index:1000;padding:6px 12px;border-radius:8px;border:1px solid #2980B9;';
document.getElementById('leaflet-map').appendChild(searchInput);
searchInput.addEventListener('input', function() {
  const val = this.value.toLowerCase();
  markerLayer.eachLayer(function(marker) {
    const popup = marker.getPopup();
    if (popup && popup.getContent().toLowerCase().includes(val)) {
      marker.setOpacity(1);
    } else {
      marker.setOpacity(val ? 0.2 : 1);
    }
  });
});

// Legend for choropleth
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function(map) {
  const div = L.DomUtil.create('div', 'map-legend');
  div.innerHTML = '<b>Density Legend</b><br>' +
    '<i style="background:#2980B9;width:18px;height:18px;display:inline-block;border-radius:4px;margin-right:6px;"></i> > 100<br>' +
    '<i style="background:#AED6F1;width:18px;height:18px;display:inline-block;border-radius:4px;margin-right:6px;"></i> ≤ 100';
  return div;
};
legend.addTo(map);

// Contact Form (no backend, just alert)
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for your message! (Form is a front-end demo only)');
  this.reset();
});

// Image optimization: lazy loading
[...document.querySelectorAll('img')].forEach(img => {
  img.loading = 'lazy';
});
