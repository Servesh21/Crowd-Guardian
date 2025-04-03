const CameraFeed = ({ id, name, location, status, riskLevel }) => {

  return (
    <div className="border rounded-md p-4">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-sm text-muted-foreground">Location: {location}</p>
      <p className={`text-sm font-bold ${riskLevel === "critical" ? "text-red-500" : "text-green-500"}`}>
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
