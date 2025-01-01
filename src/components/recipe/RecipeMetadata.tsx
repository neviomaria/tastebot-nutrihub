interface RecipeMetadataProps {
  prepTime: string;
  cookTime: string;
  mealType: string;
}

export function RecipeMetadata({ prepTime, cookTime, mealType }: RecipeMetadataProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
      <div>
        <span className="font-medium">Prep Time:</span>
        <p>{prepTime}</p>
      </div>
      <div>
        <span className="font-medium">Cook Time:</span>
        <p>{cookTime}</p>
      </div>
      <div>
        <span className="font-medium">Meal Type:</span>
        <p>{mealType}</p>
      </div>
    </div>
  );
}