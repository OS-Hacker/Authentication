import React, { useState, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Check } from "lucide-react";

function CommandDemo({ setValue, selectedValue, setSelectedValue }) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Toys",
    "Home Appliances",
    "Sports",
    "Beauty",
    "Grocery",
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return categories.filter((category) =>
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleSelect = (value) => {
    setSelectedValue(value);
    setValue(value);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {selectedValue && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Selected category:</p>
          <p className="font-medium">{selectedValue}</p>
        </div>
      )}

      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search categories..."
          value={searchQuery}
          onValueChange={handleSearch}
        />
        <CommandList>
          {searchQuery && filteredCategories.length === 0 && (
            <CommandEmpty>No categories found.</CommandEmpty>
          )}

          {searchQuery && filteredCategories.length > 0 && (
            <>
              <CommandGroup heading="Categories">
                {filteredCategories.map((item, index) => (
                  <CommandItem
                    key={index}
                    value={item}
                    onSelect={() => handleSelect(item)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{item}</span>
                      {selectedValue === item && <Check className="h-4 w-4" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {!searchQuery && (
            <div className="py-6 text-center text-sm text-gray-500">
              Type to search categories...
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}

export default React.memo(CommandDemo);
