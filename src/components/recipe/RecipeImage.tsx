interface RecipeImageProps {
  imageUrl?: string;
  title: string;
}

export function RecipeImage({ imageUrl, title }: RecipeImageProps) {
  const getRecipeAppImage = (url: string) => {
    if (!url) return "/placeholder.svg";
    const urlParts = url.split('.');
    const extension = urlParts.pop();
    return `${urlParts.join('.')}-300x300.${extension}`;
  };

  return (
    <div className="sticky top-6">
      {imageUrl && (
        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden">
          <img
            src={getRecipeAppImage(imageUrl)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
    </div>
  );
}