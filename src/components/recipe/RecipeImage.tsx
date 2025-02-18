interface RecipeImageProps {
  imageUrl?: string;
  title: string;
}

export function RecipeImage({ imageUrl, title }: RecipeImageProps) {
  const getRecipeAppImage = (url: string) => {
    if (!url) return "/placeholder.svg";
    const urlParts = url.split('.');
    const extension = urlParts.pop();
    const processedUrl = `${urlParts.join('.')}-768x768.${extension}`;
    console.log('Trying to load image from URL:', processedUrl);
    return processedUrl;
  };

  return (
    <div>
      {imageUrl && (
        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden">
          <img
            src={getRecipeAppImage(imageUrl)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.log('Image load failed, falling back to placeholder');
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
      )}
    </div>
  );
}
