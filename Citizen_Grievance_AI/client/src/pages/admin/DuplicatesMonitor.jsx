import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

export default function DuplicatesMonitor() {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await analyticsAPI.getDuplicates();
      setDuplicates(res.data.duplicates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Scanning for duplicates...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Duplicate & Spam Monitoring</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="card bg-yellow-50">
          <h3 className="text-gray-600 text-sm">Flagged as Duplicate</h3>
          <p className="text-4xl font-bold text-yellow-600">18</p>
        </div>
        <div className="card bg-red-50">
          <h3 className="text-gray-600 text-sm">Marked as Spam</h3>
          <p className="text-4xl font-bold text-red-600">5</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Duplicate Clusters Detected</h2>
        <div className="space-y-6">
          {duplicates.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No major duplicates detected currently.</p>
          ) : (
            duplicates.map((dup, idx) => (
              <div key={idx} className="p-4 bg-white border border-yellow-200 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Primary Complaint</p>
                    <p className="font-bold text-lg">{dup.primary.description}</p>
                    <p className="text-sm text-gray-500 mt-1">ID: #{dup.primary.id.slice(-6)} | {dup.primary.department}</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                    {dup.similar.length} POTENTIAL DUPLICATES
                  </span>
                </div>

                <div className="ml-6 space-y-3 border-l-2 border-yellow-100 pl-4">
                  {dup.similar.map((sim, sIdx) => (
                    <div key={sIdx} className="p-3 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm">{sim.description}</p>
                        <p className="text-xs text-gray-400 mt-1">Similarity Score: {sim.similarity}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded">Ignore</button>
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md">Merge All</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
