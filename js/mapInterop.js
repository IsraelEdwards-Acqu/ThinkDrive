// wwwroot/js/mapInterop.js
window.mapInterop = {
    initSchoolsHeatMap: function (schools, options) {
        try {
            if (!schools || schools.length === 0) {
                console.warn("[mapInterop] No schools provided");
                return;
            }
            if (typeof L === "undefined") {
                console.error("[mapInterop] Leaflet not loaded");
                return;
            }

            const map = L.map("schools-map").setView([5.55, -0.2], 7); // Ghana center
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map);

            const heatPoints = [];
            const markers = L.markerClusterGroup ? L.markerClusterGroup() : L.layerGroup();

            schools.forEach(s => {
                if (s.latitude && s.longitude) {
                    const pop = s.popularity || 0;

                    // Custom school icon
                    const icon = L.icon({
                        iconUrl: "/images/school-marker.png",
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -28]
                    });

                    const marker = L.marker([s.latitude, s.longitude], { icon })
                        .bindPopup(
                            `<strong>${s.name}</strong><br/>${s.city}<br/>Students: ${pop}`
                        );

                    markers.addLayer(marker);

                    // Heatmap weighting
                    heatPoints.push([s.latitude, s.longitude, Math.max(0.1, pop / 50)]);
                }
            });

            map.addLayer(markers);

            if (heatPoints.length > 0 && L.heatLayer) {
                const heatOpts = {
                    radius: options?.radius ?? 25,
                    blur: options?.blur ?? 15,
                    maxZoom: options?.maxZoom ?? 17
                };
                L.heatLayer(heatPoints, heatOpts).addTo(map);
            }

            // Fit map bounds to markers
            if (schools.length > 1) {
                const bounds = markers.getBounds ? markers.getBounds() : L.latLngBounds(heatPoints.map(p => [p[0], p[1]]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        } catch (e) {
            console.error("[mapInterop] initSchoolsHeatMap error:", e);
        }
    }
};
