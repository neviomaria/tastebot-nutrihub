import { Clock, Users, Flame } from "lucide-react";
import { Timer } from "@/components/timer/Timer";

interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  servings?: string;
}

export function RecipeMetadata({ prepTime, cookTime, servings = "4" }: RecipeMetadataProps) {
  const convertTimeToSeconds = (timeString: string) => {
    const number = parseInt(timeString);
    return number ? number * 60 : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 px-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-secondary p-3 rounded-lg">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="font-medium block text-gray-600 text-sm">Servings</span>
          <p className="mt-0.5 font-semibold">{servings}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-secondary p-3 rounded-lg">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="font-medium block text-gray-600 text-sm">Prep Time</span>
          <p className="mt-0.5 font-semibold">{prepTime}</p>
        </div>
        <Timer 
          duration={convertTimeToSeconds(prepTime)} 
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-secondary p-3 rounded-lg">
          <Flame className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="font-medium block text-gray-600 text-sm">Cook Time</span>
          <p className="mt-0.5 font-semibold">{cookTime}</p>
        </div>
        <Timer 
          duration={convertTimeToSeconds(cookTime)} 
        />
      </div>
    </div>
  );
}