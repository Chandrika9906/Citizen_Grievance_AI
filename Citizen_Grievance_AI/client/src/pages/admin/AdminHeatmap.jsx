import { useState, useEffect } from 'react';
import { complaintAPI } from '../../services/api';

export default function AdminHeatmap() {
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getHeatmap();
      // Group by coordinate clusters to create 'areas' for the list
      const data = res.data;
      setComplaints(data);

      // Basic clustering for the list view
      const areas = {};
      data.forEach(c => {
        const key = `${c.lat.toFixed(2)},${c.lng.toFixed(2)}`;
        if (!areas[key]) {
          areas[key] = { area: c.department || 'General', count: 0, lat: c.lat, lng: c.lng };
        }
        areas[key].count++;
      });

      setHotspots(Object.values(areas).sort((a, b) => b.count - a.count).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch heatmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Complaint Heatmap</h1>

      <div className="card mb-6">
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600 mb-2">🗺️ Map View</p>
            <p className="text-gray-500">Integrate Leaflet or Mapbox here</p>
            <p className="text-sm text-gray-400 mt-2">
              Display clustered complaint markers with hotspot indicators
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Hotspot Areas</h2>
        <div className="space-y-3">
          {hotspots.map((hotspot, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-l-4 border-red-600">
              <div>
                <p className="font-bold text-lg">{hotspot.area}</p>
                <p className="text-sm text-gray-600">
                  📍 {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-600">{hotspot.count}</p>
                <p className="text-sm text-gray-600">complaints</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
