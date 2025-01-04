interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  servings?: string;
}

export function RecipeMetadata({ prepTime, cookTime, servings = "4" }: RecipeMetadataProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 px-6 bg-white rounded-lg shadow-sm">
      <div className="text-center">
        <span className="font-medium block text-gray-600">Servings</span>
        <p className="mt-1">{servings}</p>
      </div>
      <div className="text-center">
        <span className="font-medium block text-gray-600">Prep Time</span>
        <p className="mt-1">{prepTime}</p>
      </div>
      <div className="text-center">
        <span className="font-medium block text-gray-600">Cook Time</span>
        <p className="mt-1">{cookTime}</p>
      </div>
    </div>
  );
}