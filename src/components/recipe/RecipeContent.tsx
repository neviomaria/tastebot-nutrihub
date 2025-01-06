import { Beef, Egg, Brain, Banana, Milk, LeafyGreen, Heart, Gauge, Carrot, Fish, Wheat } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface RecipeContentProps {
  ingredients: Array<{ ingredient_item: string }>;
  instructions: Array<{ instructions_step: string }>;
  nutritionFacts?: Array<{ instructions_step: string }>;
  defaultServings?: number;
}

const getIngredientIcon = (ingredient: string): LucideIcon => {
  const lowerIngredient = ingredient.toLowerCase();
  if (lowerIngredient.includes('chicken') || lowerIngredient.includes('beef') || lowerIngredient.includes('meat')) return Beef;
  if (lowerIngredient.includes('egg')) return Egg;
  if (lowerIngredient.includes('milk') || lowerIngredient.includes('cream') || lowerIngredient.includes('cheese')) return Milk;
  if (lowerIngredient.includes('carrot') || lowerIngredient.includes('vegetable')) return Carrot;
  if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') || lowerIngredient.includes('tuna')) return Fish;
  if (lowerIngredient.includes('flour') || lowerIngredient.includes('bread') || lowerIngredient.includes('pasta')) return Wheat;
  if (lowerIngredient.includes('salt') || lowerIngredient.includes('seasoning')) return Gauge;
  if (lowerIngredient.includes('sugar') || lowerIngredient.includes('honey')) return Banana;
  if (lowerIngredient.includes('oil') || lowerIngredient.includes('butter')) return Milk;
  return LeafyGreen;
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
  return Beef;
};

const parseIngredientQuantity = (ingredient: string) => {
  const match = ingredient.match(/^([\d./]+)\s*(.+)/);
  if (!match) return { quantity: 1, unit: '', rest: ingredient };
  
  const quantity = eval(match[1]) || 1; // Safely evaluate fractions like "1/2"
  const rest = match[2];
  
  // Try to extract unit if present
  const unitMatch = rest.match(/^(\w+)\s+(.+)/);
  if (!unitMatch) return { quantity, unit: '', rest };
  
  return {
    quantity,
    unit: unitMatch[1],
    rest: unitMatch[2]
  };
};

const formatQuantity = (quantity: number): string => {
  if (quantity === Math.floor(quantity)) return quantity.toString();
  // Convert to fraction if it's close to common fractions
  const fractions: [number, string][] = [
    [1/4, "¼"], [1/3, "⅓"], [1/2, "½"], [2/3, "⅔"], [3/4, "¾"]
  ];
  for (const [value, symbol] of fractions) {
    if (Math.abs(quantity - value) < 0.05) return symbol;
  }
  return quantity.toFixed(2);
};

export function RecipeContent({ ingredients, instructions, nutritionFacts, defaultServings = 4 }: RecipeContentProps) {
  const [servings, setServings] = useState(defaultServings);

  const scaleIngredient = (ingredient: string, scale: number) => {
    const { quantity, unit, rest } = parseIngredientQuantity(ingredient);
    const scaledQuantity = quantity * scale;
    const formattedQuantity = formatQuantity(scaledQuantity);
    return `${formattedQuantity}${unit ? ` ${unit} ` : ' '}${rest}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="servings" className="text-sm text-gray-600">
              Adjust servings:
            </label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20"
            />
          </div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pl-5">
          {ingredients.map((ingredient, index) => {
            const Icon = getIngredientIcon(ingredient.ingredient_item);
            const scaledIngredient = scaleIngredient(
              ingredient.ingredient_item,
              servings / defaultServings
            );
            return (
              <li key={index} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <span>{scaledIngredient}</span>
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Nutrition Facts per Serving</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nutritionFacts.map((fact, index) => {
              const Icon = getNutritionIcon(fact.instructions_step);
              return (
                <li key={index} className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-gray-600">{fact.instructions_step}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}