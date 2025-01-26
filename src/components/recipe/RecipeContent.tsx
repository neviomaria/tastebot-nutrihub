import { Beef, Egg, Brain, Banana, Milk, LeafyGreen, Heart, Gauge, Carrot, Fish, Wheat } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RecipeContentProps {
  ingredients: Array<{ ingredient_item: string }>;
  instructions: Array<{ instructions_step: string }>;
  nutritionFacts?: Array<{ instructions_step: string }>;
  defaultServings?: number;
  imageUrl?: string;
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

const getRecipeImageSize = (url: string | undefined) => {
  if (!url) return "/placeholder.svg";
  const urlParts = url.split('.');
  const extension = urlParts.pop();
  return `${urlParts.join('.')}-768x768.${extension}`;
};

export function RecipeContent({ ingredients, instructions, nutritionFacts, defaultServings = 4, imageUrl }: RecipeContentProps) {
  const [servings, setServings] = useState(defaultServings);

  const handleServingsChange = (value: string) => {
    const newValue = parseInt(value);
    if (!isNaN(newValue) && newValue > 0) {
      setServings(newValue);
    }
  };

  const adjustServings = (increment: boolean) => {
    setServings(prev => Math.max(1, increment ? prev + 1 : prev - 1));
  };

  const scaleIngredient = (ingredient: string, scale: number) => {
    const { quantity, unit, rest } = parseIngredientQuantity(ingredient);
    const scaledQuantity = quantity * scale;
    const formattedQuantity = formatQuantity(scaledQuantity);
    return `${formattedQuantity}${unit ? ` ${unit} ` : ' '}${rest}`;
  };

  return (
    <div className="space-y-6">
      {imageUrl && (
        <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
          <img 
            src={getRecipeImageSize(imageUrl)} 
            alt="Recipe" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
      
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <label htmlFor="servings" className="text-sm text-gray-600 whitespace-nowrap">
              Adjust servings:
            </label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustServings(false)}
              >
                -
              </Button>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => handleServingsChange(e.target.value)}
                className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => adjustServings(true)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {ingredients.map((ingredient, index) => {
            const Icon = getIngredientIcon(ingredient.ingredient_item);
            const scaledIngredient = scaleIngredient(
              ingredient.ingredient_item,
              servings / defaultServings
            );
            return (
              <li key={index} className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 text-primary" />
                <span className="text-gray-700">{scaledIngredient}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-3">
          {instructions.map((instruction, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex-shrink-0 font-medium text-primary">{index + 1}.</span>
              <span className="text-gray-700">{instruction.instructions_step}</span>
            </li>
          ))}
        </ol>
      </div>

      {nutritionFacts && nutritionFacts.length > 0 && (
        <div className="bg-secondary/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Nutrition Facts per Serving</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nutritionFacts.map((fact, index) => {
              const Icon = getNutritionIcon(fact.instructions_step);
              return (
                <li key={index} className="flex items-center gap-3">
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