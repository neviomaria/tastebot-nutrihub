import { Card, CardHeader } from "@/components/ui/card";

interface RecipeCardProps {
  title: string;
  image: string;
  cookTime: string;
  difficulty: string;
  onClick: () => void;
}

export function RecipeCard({ title, image, cookTime, difficulty, onClick }: RecipeCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-fade-up"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </div>
      <CardHeader className="p-4">
        <h3 className="font-semibold text-lg text-recipe-500">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{cookTime}</span>
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </CardHeader>
    </Card>
  );
}