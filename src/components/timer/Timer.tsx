import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number;
  isCountdown?: boolean;
  onComplete?: () => void;
  className?: string;
  size?: 'small' | 'large'; 
}

export function Timer({ 
  duration, 
  isCountdown = true, 
  onComplete, 
  className,
  size = 'small' 
}: TimerProps) {
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

  const sizeConfig = {
    small: {
      container: "flex items-center gap-2",
      svg: "w-16 h-16",
      circle: {
        cx: "32",
        cy: "32",
        r: "28",
        strokeWidth: "4",
        dashArray: "175.93"
      },
      text: "text-sm",
      button: "h-8 w-8",
      icon: "h-3 w-3"
    },
    large: {
      container: "flex flex-col items-center gap-4",
      svg: "w-32 h-32",
      circle: {
        cx: "64",
        cy: "64",
        r: "58",
        strokeWidth: "6",
        dashArray: "364.425"
      },
      text: "text-2xl font-medium",
      button: "h-12 w-12",
      icon: "h-5 w-5"
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn(config.container, className)}>
      <div className="relative">
        <svg className={cn(config.svg, "transform -rotate-90")}>
          <circle
            cx={config.circle.cx}
            cy={config.circle.cy}
            r={config.circle.r}
            className="stroke-muted-foreground/20"
            strokeWidth={config.circle.strokeWidth}
            fill="none"
          />
          <circle
            cx={config.circle.cx}
            cy={config.circle.cy}
            r={config.circle.r}
            className="stroke-primary transition-all duration-300"
            strokeWidth={config.circle.strokeWidth}
            fill="none"
            strokeDasharray={config.circle.dashArray}
            strokeDashoffset={Number(config.circle.dashArray) * (progress / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-mono", config.text)}>{formatTime(time)}</span>
        </div>
      </div>
      <div className={cn(size === 'large' ? "flex gap-3" : "flex flex-col gap-1")}>
        <Button
          variant="outline"
          size="icon"
          className={config.button}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className={config.icon} />
          ) : (
            <Play className={config.icon} />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={config.button}
          onClick={reset}
        >
          <RotateCcw className={config.icon} />
        </Button>
      </div>
    </div>
  );
}
