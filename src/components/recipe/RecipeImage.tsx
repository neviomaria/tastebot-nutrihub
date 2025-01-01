interface RecipeImageProps {
  imageUrl?: string;
  title: string;
}

export function RecipeImage({ imageUrl, title }: RecipeImageProps) {
  return (
    <div className="relative">
      {imageUrl && (
        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
    </div>
  );
}