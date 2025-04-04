import { useEffect, useState } from "react";

const CrowdDensityMap = () => {
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    setVideoSrc("http://localhost:5000/video_heatmap");
  }, []);

  return (
    <div className="w-full h-[400px] flex justify-center items-center">
      {videoSrc ? (
        <img src={videoSrc} alt="Crowd Density Heatmap" className="w-full h-full object-cover rounded-lg shadow" />
      ) : (
        <p>Loading heatmap...</p>
      )}
    </div>
  );
};

export default CrowdDensityMap;
