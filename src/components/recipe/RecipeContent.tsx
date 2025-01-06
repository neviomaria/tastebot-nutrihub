import { Beef, Egg, Brain, Banana, Milk, LeafyGreen, Heart, Gauge, Carrot, Fish, Wheat, Salt, Cookie, Oil } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface RecipeContentProps {
  ingredients: Array<{ ingredient_item: string }>;
  instructions: Array<{ instructions_step: string }>;
  nutritionFacts?: Array<{ instructions_step: string }>;
}

const getIngredientIcon = (ingredient: string): LucideIcon => {
  const lowerIngredient = ingredient.toLowerCase();
  if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || lowerIngredient.includes('meat')) return Beef;
  if (lowerIngredient.includes('egg')) return Egg;
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('cream') || lowerIngredient.includes('cheese')) return Milk;
  if (lowerIngredient.includes('carrot') || lowerIngredient.includes('vegetable')) return Carrot;
  if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') || lowerIngredient.includes('tuna')) return Fish;
  if (lowerIngredient.includes('flour') || lowerIngredient.includes('bread') || lowerIngredient.includes('pasta')) return Wheat;
  if (lowerIngredient.includes('salt')) return Salt;
  if (lowerIngredient.includes('sugar') || lowerIngredient.includes('honey')) return Cookie;
  if (lowerIngredient.includes('oil')) return Oil;
  return LeafyGreen; // default icon for other ingredients
};

const getNutritionIcon = (fact: string): LucideIcon => {
  const lowerFact = fact.toLowerCase();
  if (lowerFact.includes('protein')) return Egg;
  if (lowerFact.includes('carb')) return Brain;
  if (lowerFact.includes('calor')) return Banana;
  if (lowerFact.includes('fat')) return Milk;
  if (lowerFact.includes('fiber')) return LeafyGreen;
  if (lowerFact.includes('cholesterol')) return Heart;
  if (lowerFact.includes('sodium')) return Gauge;
  return Beef; // default icon
};

export function RecipeContent({ ingredients, instructions, nutritionFacts }: RecipeContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-5">
          {ingredients.map((ingredient, index) => {
            const Icon = getIngredientIcon(ingredient.ingredient_item);
            return (
              <li key={index} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span>{ingredient.ingredient_item}</span>
              </li>
            );
          })}
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
      {nutritionFacts && nutritionFacts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Nutrition Facts per Serving</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nutritionFacts.map((fact, index) => {
                const Icon = getNutritionIcon(fact.instructions_step);
                return (
                  <li key={index} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">{fact.instructions_step}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}