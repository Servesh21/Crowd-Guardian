import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CameraFeed = ({ id, name, location, status }) => {
  const [riskLevel, setRiskLevel] = useState("Loading...");

  useEffect(() => {
    const fetchRiskLevel = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/detect/risk-analysis');
        setRiskLevel(response.data.risk_level);
      } catch (error) {
        console.error("Error fetching risk level:", error);
        setRiskLevel("Unavailable");
      }
    };

    fetchRiskLevel(); // Initial fetch
    const interval = setInterval(fetchRiskLevel, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="border rounded-md p-4">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-muted-foreground">Location: {location}</p>
      <p className={`text-sm font-bold ${
        riskLevel.toLowerCase() === "high" ? "text-red-500" :
        riskLevel.toLowerCase() === "medium" ? "text-yellow-500" :
        riskLevel.toLowerCase() === "low" ? "text-green-500" :
        "text-gray-500"
      }`}>
        Risk: {riskLevel}
      </p>
      <div className="mt-2">
        <img
          src={`http://localhost:5000/api/detect/stream`}  // Flask stream URL
          alt="Live Camera Feed"
          className="w-full h-auto rounded-md"
        />
      </div>
    </div>
  );
};

export default CameraFeed;
