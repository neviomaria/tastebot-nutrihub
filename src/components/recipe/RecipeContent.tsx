interface RecipeContentProps {
  ingredients: Array<{ ingredient_item: string }>;
  instructions: Array<{ instructions_step: string }>;
}

export function RecipeContent({ ingredients, instructions }: RecipeContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
        <ul className="list-disc pl-5 space-y-2">
          {ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient.ingredient_item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction.instructions_step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}