// Category color configuration
export const categoryColors = {
  "0": "pink",      // Ad-Hoc
  "1": "cyan",      // Backwaren
  "2": "blue",      // Milchprodukte
  "3": "orange",    // Öle
  "4": "green",     // Obst
  "5": "purple",    // Gemüse
  "6": "red",       // Fleisch
  "7": "gray"       // Sonstiges
};

// Default color for unknown categories
export const defaultCategoryColor = "gray";

// Function to get category color
export const getCategoryColor = (categoryId) => {
  return categoryColors[categoryId] || defaultCategoryColor;
};
