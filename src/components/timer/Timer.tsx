import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Timer as TimerIcon, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  isCountdown?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function Timer({ duration, isCountdown = true, onComplete, className }: TimerProps) {
  const [time, setTime] = useState(isCountdown ? duration : 0);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const reset = useCallback(() => {
    setTime(isCountdown ? duration : 0);
    setIsRunning(false);
  }, [duration, isCountdown]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (isCountdown) {
            if (prevTime <= 1) {
              setIsRunning(false);
              onComplete?.();
              return 0;
            }
            return prevTime - 1;
          } else {
            if (prevTime >= duration - 1) {
              setIsRunning(false);
              onComplete?.();
              return duration;
            }
            return prevTime + 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isCountdown, duration, onComplete]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <TimerIcon className="h-5 w-5" />
        <span className="text-2xl font-mono">{formatTime(time)}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}