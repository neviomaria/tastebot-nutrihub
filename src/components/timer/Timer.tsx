import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
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
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `0:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const reset = useCallback(() => {
    setTime(isCountdown ? duration : 0);
    setIsRunning(false);
  }, [duration, isCountdown]);

  useEffect(() => {
    setTime(isCountdown ? duration : 0);
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

  const progress = isCountdown 
    ? (time / duration) * 100 
    : ((duration - time) / duration) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            className="stroke-muted-foreground/20"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            className="stroke-primary transition-all duration-300"
            strokeWidth="6"
            fill="none"
            strokeDasharray={364.425}
            strokeDashoffset={364.425 * (progress / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-medium">{formatTime(time)}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={reset}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}