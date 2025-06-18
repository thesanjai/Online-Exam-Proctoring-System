
import React, { useEffect, useState } from "react";
import { Monitor, MonitorOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { WarningBanner } from "./WarningBanner";

type ScreenResponse = {
  screen_count: number;
  warning?: string | null;
};

const API_URL = "http://localhost:8001/screen-count"; // Change if deployed elsewhere

export function ScreenStatusCard() {
  const [data, setData] = useState<ScreenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchScreenCount = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("API error");
      const json: ScreenResponse = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setData(null);
      toast({
        title: "Failed to fetch screen status.",
        description: "Could not reach the Screen Detector API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenCount();
    // Only on mount
    // eslint-disable-next-line
  }, []);

  const screenCount = data?.screen_count ?? "?";
  const hasWarning = !!data?.warning;

  return (
    <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md flex flex-col items-center mb-2">
      <div className="flex items-center mb-4">
        {hasWarning ? (
          <MonitorOff className="text-red-500 mr-3" size={44} />
        ) : (
          <Monitor className="text-purple-500 mr-3" size={44} />
        )}
        <div>
          <div className="text-4xl font-extrabold text-[#9b87f5]">{screenCount}</div>
          <div className="text-gray-700 text-sm">screen{screenCount !== 1 ? "s" : ""} detected</div>
        </div>
      </div>
      {loading && <div className="text-gray-500 mb-2 animate-pulse">Checking...</div>}
      {hasWarning && <WarningBanner warning={data?.warning || ""} />}
      <Button
        variant="outline"
        onClick={fetchScreenCount}
        disabled={loading}
        className="mt-4"
      >
        Refresh
      </Button>
      {lastUpdated && (
        <div className="mt-2 text-xs text-gray-400">
          Last checked: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
