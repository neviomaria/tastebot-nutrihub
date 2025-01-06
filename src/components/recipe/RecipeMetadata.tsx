import { Clock, Users, Timer } from "lucide-react";

interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  servings?: string;
}

export function RecipeMetadata({ prepTime, cookTime, servings = "4" }: RecipeMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 px-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-sidebar-text shrink-0" />
        <div>
          <span className="font-medium block text-gray-600">Servings</span>
          <p className="mt-1">{servings}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-sidebar-text shrink-0" />
        <div>
          <span className="font-medium block text-gray-600">Prep Time</span>
          <p className="mt-1">{prepTime}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Timer className="w-5 h-5 text-sidebar-text shrink-0" />
        <div>
          <span className="font-medium block text-gray-600">Cook Time</span>
          <p className="mt-1">{cookTime}</p>
        </div>
      </div>
    </div>
  );
}