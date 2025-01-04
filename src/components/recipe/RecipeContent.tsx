interface RecipeContentProps {
  ingredients: Array<{ ingredient_item: string }>;
  instructions: Array<{ instructions_step: string }>;
}

export function RecipeContent({ ingredients, instructions }: RecipeContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pl-5 list-disc">
          {ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient.ingredient_item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction.instructions_step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}