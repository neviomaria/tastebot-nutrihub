import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SelectField } from "@/components/form/SelectField";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

interface SearchBarProps {
  onSearch: (query: { keywords: string; ingredients: string[] }) => void;
  ingredients?: string[];
}

interface SearchForm {
  keywords: string;
  ingredients: string[];
}

export function SearchBar({ onSearch, ingredients = [] }: SearchBarProps) {
  const form = useForm<SearchForm>({
    defaultValues: {
      keywords: "",
      ingredients: [],
    },
  });

  const handleSubmit = (data: SearchForm) => {
    onSearch(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search recipes..."
            className="pl-10 bg-recipe-100 border-recipe-200 focus:border-recipe-300"
            {...form.register("keywords")}
          />
        </div>
        
        <SelectField
          form={form}
          name="ingredients"
          label="Filter by ingredients"
          options={ingredients}
          multiple={true}
          className="text-sm"
        />
        
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Search
        </Button>
      </form>
    </Form>
  );
}