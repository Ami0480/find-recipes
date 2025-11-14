import { useState } from "react";

function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const foodImages = [
    {
      src: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop",
      alt: "Chicken",
    },
    {
      src: "https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop",
      alt: "Beef",
    },
    {
      src: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&h=200&fit=crop",
      alt: "Pork",
    },
    {
      src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
      alt: "Dessert",
    },
    {
      src: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200&h=200&fit=crop",
      alt: "Cereals",
    },
    {
      src: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=200&h=200&fit=crop",
      alt: "Smoothies",
    },
    {
      src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
      alt: "Bread",
    },

    {
      src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
      alt: "Cake",
    },
    {
      src: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop",
      alt: "Cookies",
    },
    {
      src: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop",
      alt: "Fruits",
    },
    {
      src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
      alt: "Salad",
    },
    {
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
      alt: "Pizza",
    },
    {
      src: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop",
      alt: "Pasta",
    },
    {
      src: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=200&h=200&fit=crop",
      alt: "Soup",
    },
    {
      src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
      alt: "Rice Bowl",
    },
    {
      src: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200&h=200&fit=crop",
      alt: "Sushi",
    },
    {
      src: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop",
      alt: "Burger",
    },
    {
      src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop",
      alt: "Fish",
    },
    {
      src: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop",
      alt: "French Toast",
    },
    {
      src: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=200&h=200&fit=crop",
      alt: "Hot Dogs",
    },
  ];

  // Helper function to generate search variations for singular/plural
  const getSearchVariations = (word) => {
    const variations = new Set([word.toLowerCase()]);

    // Common plural patterns
    if (word.toLowerCase().endsWith("s")) {
      // Try singular form (remove 's' or 'es')
      const singular = word.toLowerCase().slice(0, -1);
      variations.add(singular);
      if (word.toLowerCase().endsWith("es")) {
        variations.add(word.toLowerCase().slice(0, -2));
      }
    } else {
      // Try plural forms
      variations.add(word.toLowerCase() + "s");
      // For words ending in 'y', try 'ies'
      if (word.toLowerCase().endsWith("y")) {
        variations.add(word.toLowerCase().slice(0, -1) + "ies");
      }
      // For words ending in certain consonants, try 'es'
      const esEndings = ["ch", "sh", "x", "z", "s"];
      if (esEndings.some((ending) => word.toLowerCase().endsWith(ending))) {
        variations.add(word.toLowerCase() + "es");
      }
    }

    return Array.from(variations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ingredients.trim()) {
      alert("Please enter at least one ingredient");
      return;
    }

    setShowResults(false);
    setLoading(true);
    setRecipes([]);

    try {
      // Normalize ingredients: lowercase, trim, split by comma or space
      const normalizedInput = ingredients
        .toLowerCase()
        .split(/[,\s]+/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      if (normalizedInput.length === 0) {
        setRecipes([]);
        setShowResults(true);
        setLoading(false);
        return;
      }

      // Get all search variations for each ingredient (singular/plural)
      const searchVariations = normalizedInput.flatMap((word) =>
        getSearchVariations(word)
      );
      const primarySearchTerms = normalizedInput.map(
        (word) => getSearchVariations(word)[0]
      );

      // Try searching with TheMealDB API - try each variation until we find results
      let data = { meals: null };
      let foundResults = false;

      for (const searchTerm of primarySearchTerms) {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            searchTerm
          )}`
        );
        const result = await response.json();

        if (result.meals && result.meals.length > 0) {
          data = result;
          foundResults = true;
          break;
        }
      }

      if (foundResults && data.meals && data.meals.length > 0) {
        // Get detailed info for each meal
        const mealPromises = data.meals.slice(0, 20).map((meal) =>
          fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
          )
            .then((res) => res.json())
            .then((data) => data.meals[0])
            .catch((err) => null)
        );

        const meals = (await Promise.all(mealPromises)).filter(
          (meal) => meal !== null
        );

        // Filter meals that contain any of the search ingredients (case-insensitive, partial matching)
        let filteredMeals = meals;
        if (searchVariations.length > 0) {
          filteredMeals = meals.filter((meal) => {
            // Create a searchable text from meal data (all lowercase)
            const mealSearchText = [
              meal.strMeal,
              meal.strCategory,
              meal.strArea,
              meal.strInstructions,
              // Include ingredients from the meal
              ...Array.from({ length: 20 }, (_, i) => {
                const ingredient = meal[`strIngredient${i + 1}`];
                return ingredient ? ingredient.toLowerCase() : "";
              }).filter((ing) => ing),
            ]
              .join(" ")
              .toLowerCase();

            // Check if any of the search variations appear in the meal
            return searchVariations.some((searchTerm) => {
              // Allow partial matching - check if search term is contained in any ingredient or meal name
              const searchLower = searchTerm.toLowerCase();
              return (
                mealSearchText.includes(searchLower) ||
                mealSearchText
                  .split(/\s+/)
                  .some((word) => word.includes(searchLower))
              );
            });
          });

          // If no matches found with multiple ingredients, show results matching at least the first ingredient
          if (filteredMeals.length === 0 && normalizedInput.length > 1) {
            filteredMeals = meals;
          }
        }

        setRecipes(filteredMeals.slice(0, 9));
        setShowResults(true);

        // Scroll to results after a brief delay
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        setRecipes([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes(null);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Safely scroll to top without any redirects
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Reset search state to return to home view
    setShowResults(false);
    setSelectedRecipe(null);
    setIngredients("");
    setMealType("");
    setRecipes([]);
    setLoading(false);
  };

  const renderResults = () => {
    if (!showResults) return null;

    if (recipes === null) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="dosis-regular text-2xl text-white font-semibold mb-4">
            Oops! Something went wrong.
          </p>
          <p className="text-2xl text-white font-semibold">
            Please try again later.
          </p>
        </div>
      );
    }

    if (recipes.length === 0) {
      return (
        <div className="col-span-full text-center py-8">
          <p className="dosis-regular text-2xl text-white font-semibold mb-4">
            No recipes found for those ingredients.
          </p>
          <p className="text-2xl text-white font-semibold">
            Try different ingredients or check your spelling.
          </p>
        </div>
      );
    }

    return recipes.map((meal) => (
      <div
        key={meal.idMeal}
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
      >
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x300?text=Recipe+Image";
          }}
        />
        <div className="p-4">
          <h3 className="dosis-regular text-xl charcoal mb-2">
            {meal.strMeal}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold">Category:</span>{" "}
            {meal.strCategory || "N/A"}
          </p>
          {meal.strInstructions && (
            <p className="text-sm text-gray-700 line-clamp-3 mb-3">
              {meal.strInstructions.substring(0, 150)}...
            </p>
          )}
          <button
            onClick={() => setSelectedRecipe(meal)}
            className="inline-block px-4 py-2 bg-charcoal text-white rounded dosis-light text-sm hover:bg-opacity-90 transition-colors"
          >
            View Recipe
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 p-6">
        <button
          onClick={scrollToTop}
          className="flex items-center justify-center w-14 h-14 hover:opacity-90 transition-opacity cursor-pointer"
          aria-label="Return to home"
          type="button"
        >
          <img
            src="/pantry.svg"
            alt="Pantry Logo"
            className="w-12 h-12 object-contain"
          />
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-6xl pt-24">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="dosis-regular text-5xl text-charcoal font-extrabold mb-6">
            What have you got?
          </h1>
          <p className="text-2xl text-white font-regular mb-6">
            Enter the ingredients in your fridge or pantry 🥣
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="mb-4">
              <input
                type="text"
                id="ingredients"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="chicken, cabbage, milk, smoked paprika…"
                className="w-full px-4 py-2 rounded-full text-base dosis-light charcoal-opacity border-2 border-white focus:outline-none focus:border-charcoal transition-colors"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="mealType"
                className="block text-left mb-2 text-lg text-white font-semibold"
              >
                Meal Type (optional):
              </label>
              <select
                id="mealType"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-2 rounded-full text-base dosis-light charcoal border-2 border-white focus:outline-none focus:border-charcoal transition-colors"
              >
                <option value="">All Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">Snacks</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-8 py-1 mt-8 bg-charcoal text-white rounded-lg dosis-regular text-2xl font-semibold hover:bg-opacity-90 transition-colors shadow-lg"
            >
              Find Recipes
            </button>
          </form>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="dosis-regular text-2xl text-white font-semibold">
              Searching for recipes...
            </p>
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <section id="results" className="mt-12">
            <h2 className="dosis-regular text-2xl text-white font-semibold text-center mb-8">
              Recipes Found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderResults()}
            </div>
          </section>
        )}
      </main>

      {/* Scrolling Food Images */}
      <section className="py-8 mt-4">
        <div className="scroll-wrapper">
          <div className="scroll-container">
            {/* First set of images */}
            {foodImages.map((img, index) => (
              <img
                key={`first-${index}`}
                src={img.src}
                alt={img.alt}
                className="food-image object-cover rounded-3xl"
              />
            ))}
            {/* Duplicate set for seamless loop */}
            {foodImages.map((img, index) => (
              <img
                key={`second-${index}`}
                src={img.src}
                alt={img.alt}
                className="food-image object-cover rounded-3xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6">
        <p className="text-base text-white text-right">recipes@2025</p>
      </footer>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-charcoal">
                {selectedRecipe.strMeal}
              </h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-charcoal hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <img
                src={selectedRecipe.strMealThumb}
                alt={selectedRecipe.strMeal}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Category:</span>{" "}
                  {selectedRecipe.strCategory || "N/A"}
                  {selectedRecipe.strArea && (
                    <>
                      {" | "}
                      <span className="font-semibold">Cuisine:</span>{" "}
                      {selectedRecipe.strArea}
                    </>
                  )}
                </p>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-charcoal mb-3">
                  Ingredients:
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {Array.from({ length: 20 }, (_, i) => {
                    const ingredient = selectedRecipe[`strIngredient${i + 1}`];
                    const measure = selectedRecipe[`strMeasure${i + 1}`];
                    if (ingredient && ingredient.trim()) {
                      return (
                        <li key={i} className="text-gray-700">
                          {measure ? `${measure.trim()} ` : ""}
                          {ingredient}
                        </li>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </ul>
              </div>

              {/* Instructions */}
              {selectedRecipe.strInstructions && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-charcoal mb-3">
                    Instructions:
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedRecipe.strInstructions}
                  </div>
                </div>
              )}

              {/* Source Links */}
              {(selectedRecipe.strSource || selectedRecipe.strYoutube) && (
                <div className="mt-6 pt-4 border-t">
                  {selectedRecipe.strSource && (
                    <a
                      href={selectedRecipe.strSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-charcoal text-white rounded mr-2 hover:bg-opacity-90 transition-colors"
                    >
                      View Original Source
                    </a>
                  )}
                  {selectedRecipe.strYoutube && (
                    <a
                      href={selectedRecipe.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Watch on YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
