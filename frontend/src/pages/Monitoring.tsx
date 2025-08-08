import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { listVideos, uploadVideos, getStreamUrl } from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Monitoring = () => {
  const { toast } = useToast();
  const [riskLevel, setRiskLevel] = useState('Loading...');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [available, setAvailable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  // Fetch risk level periodically
  useEffect(() => {
    const fetchRiskLevel = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/detect/risk-analysis');
        setRiskLevel(response.data.risk_level);
      } catch (error) {
        console.error('Error fetching risk level:', error);
        setRiskLevel('Unavailable');
      }
    };

    fetchRiskLevel();
    const interval = setInterval(fetchRiskLevel, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load available uploaded videos
  const refreshList = async () => {
    try {
      const vids = await listVideos();
      setAvailable(vids);
      if (!selected && vids.length > 0) setSelected(vids[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const onUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      await uploadVideos(files);
      toast({ title: 'Upload complete', description: `${files.length} video(s) uploaded.` });
      setFiles([]);
      await refreshList();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || 'Error uploading videos', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const streamSrc = useMemo(() => getStreamUrl(selected), [selected]);

  const riskClass = useMemo(() => {
    const r = (riskLevel || '').toLowerCase();
    if (r === 'high') return 'text-red-500';
    if (r === 'medium') return 'text-yellow-500';
    if (r === 'low') return 'text-green-500';
    return 'text-gray-500';
  }, [riskLevel]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Detection Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 text-sm">
              <span className="font-medium">Risk:</span>{' '}
              <span className={riskClass}>{riskLevel}</span>
            </div>
            <div className="border rounded-md overflow-hidden">
              <img src={streamSrc} alt="Live Camera Feed" className="w-full h-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={onFileChange}
              className="block w-full text-sm mb-3"
            />
            <Button onClick={onUpload} disabled={isUploading || files.length === 0}>
              {isUploading ? 'Uploading…' : `Upload ${files.length || ''}`}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">No uploaded videos yet.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {available.map((f) => (
                  <li key={f} className={`p-2 rounded border cursor-pointer ${selected === f ? 'bg-accent' : ''}`} onClick={() => setSelected(f)}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm" title={f}>{f}</span>
                      {selected === f && <span className="text-xs">Selected</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Monitoring;
