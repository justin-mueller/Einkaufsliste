import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Container,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Input,
  Button,
  HStack,
  VStack,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { getCategoryColor } from '../config/categoryColors';
import ConfirmDialog from '../components/ConfirmDialog';

const Rezepte = () => {
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [articleToAdd, setArticleToAdd] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Fetch recipes, articles and categories data
    Promise.all([
      fetch('/api/getRecipes.php'),
      fetch('/api/getArticles.php'),
      fetch('/api/getCategories.php')
    ])
      .then(async ([recipesResponse, articlesResponse, categoriesResponse]) => {
        if (!recipesResponse.ok || !articlesResponse.ok || !categoriesResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const recipesData = await recipesResponse.json();
        const articlesData = await articlesResponse.json();
        const categoriesData = await categoriesResponse.json();

        setRecipes(recipesData);
        setArticles(articlesData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Create mappings
  const articleMap = articles.reduce((map, article) => {
    map[article.id] = article;
    return map;
  }, {});

  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {});

  // Function to add article to recipe
  const addArticleToRecipe = () => {
    if (!articleToAdd) return;

    const article = articles.find(a => a.id === articleToAdd);
    if (!article) return;

    if (selectedArticles.some(a => a.id === article.id)) {
      toast({
        title: 'Warnung',
        description: 'Dieser Artikel ist bereits zum Rezept hinzugefügt worden.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setSelectedArticles([...selectedArticles, article]);
    setArticleToAdd('');
  };

  // Function to remove article from recipe
  const removeArticleFromRecipe = (articleId) => {
    setSelectedArticles(selectedArticles.filter(a => a.id !== articleId));
  };

  // Function to add new recipe
  const addRecipe = async () => {
    if (!newRecipeName.trim() || selectedArticles.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Rezeptnamen ein und fügen Sie mindestens einen Artikel hinzu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Generate a unique ID for the new recipe
      const newId = Math.max(...recipes.map(r => parseInt(r.id)), 0) + 1;

      // Create new recipe
      const newRecipe = {
        id: newId.toString(),
        name: newRecipeName.trim(),
        items: selectedArticles.map(a => a.id)
      };

      // Add to local state
      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);

      // Clear form
      setNewRecipeName('');
      setSelectedArticles([]);

      // Save to server
      const response = await fetch('/api/saveRecipes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipes),
      });

      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }

      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      toast({
        title: 'Erfolg',
        description: 'Rezept erfolgreich hinzugefügt!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding recipe:', error);
      // Revert local state
      setRecipes(recipes);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Hinzufügen des Rezepts. Bitte versuchen Sie es erneut.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to show delete confirmation dialog
  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setIsConfirmDialogOpen(true);
  };

  // Function to close confirmation dialog
  const handleDialogClose = () => {
    setIsConfirmDialogOpen(false);
    setRecipeToDelete(null);
  };

  // Function to confirm and remove recipe
  const confirmRemoveRecipe = async () => {
    if (!recipeToDelete) return;

    try {
      // Remove from local state
      const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeToDelete.id);
      setRecipes(updatedRecipes);

      // Close dialog
      handleDialogClose();

      // Save to server
      const response = await fetch('/api/saveRecipes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecipes),
      });

      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }

      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      toast({
        title: 'Erfolg',
        description: 'Rezept erfolgreich entfernt!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing recipe:', error);
      // Revert local state
      setRecipes(recipes);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Entfernen des Rezepts. Bitte versuchen Sie es erneut.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to add recipe to today's shopping list
  const addRecipeToTodayList = async (recipe) => {
    try {
      // Fetch current shopping list
      const shoppingListResponse = await fetch('/api/getData.php');
      if (!shoppingListResponse.ok) {
        throw new Error('Failed to fetch shopping list');
      }
      const currentShoppingList = await shoppingListResponse.json();

      // Get article IDs from the recipe
      const recipeArticleIds = recipe.items;

      // Create a set of existing article IDs in shopping list (excluding custom items)
      const existingArticleIds = new Set(
        currentShoppingList
          .filter(item => item.category !== "0") // Exclude custom items
          .map(item => item.id)
      );

      // Filter out articles that are already in the shopping list
      const articlesToAdd = recipeArticleIds
        .filter(articleId => !existingArticleIds.has(articleId))
        .map(articleId => {
          const article = articleMap[articleId];
          if (!article) return null;

          return {
            id: article.id,
            name: article.name,
            checked: false,
            category: article.category
          };
        })
        .filter(item => item !== null); // Remove null items

      if (articlesToAdd.length === 0) {
        toast({
          title: 'Info',
          description: 'Alle Artikel aus diesem Rezept sind bereits in der heutigen Einkaufsliste.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Add new articles to shopping list
      const updatedShoppingList = [...currentShoppingList, ...articlesToAdd];

      // Save updated shopping list
      const saveResponse = await fetch('/api/saveData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedShoppingList),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save shopping list');
      }

      const result = await saveResponse.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      toast({
        title: 'Success',
        description: `${articlesToAdd.length} Artikel aus "${recipe.name}" zur heutigen Einkaufsliste hinzugefügt!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding recipe to shopping list:', error);
      toast({
        title: 'Error',
        description: 'Fehler beim Hinzufügen des Rezepts zur Einkaufsliste. Bitte versuchen Sie es erneut.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Rezepte werden geladen...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={5}>
        <AlertIcon />
        Fehler beim Laden der Daten: {error}
      </Alert>
    );
  }

  return (
    <Container 
      maxW={{ base: "100vw", md: "container.lg" }} 
      py={8}
      px={{ base: 2, md: 4 }}
    >
      {/* Add New Recipe Form */}
      <Box mb={8} p={6} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4} color="gray.700">Neues Rezept hinzufügen</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Rezeptname</FormLabel>
            <Input
              placeholder="Rezeptname eingeben..."
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
            />
          </FormControl>

          <Divider />

          <Box>
            <Text fontWeight="bold" mb={3}>Artikel zum Rezept hinzufügen</Text>
            <VStack spacing={4} align="stretch">
              <FormControl flex="1">
                <Select
                  placeholder="Artikel zum Hinzufügen auswählen"
                  value={articleToAdd}
                  onChange={(e) => setArticleToAdd(e.target.value)}
                >
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.name} ({categoryMap[article.category] || `Kategorie ${article.category}`})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                colorScheme="green"
                onClick={addArticleToRecipe}
                leftIcon={<AddIcon />}
                alignSelf="flex-start"
              >
                Artikel hinzufügen
              </Button>
            </VStack>

            {selectedArticles.length > 0 && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>Ausgewählte Artikel:</Text>
                <Wrap spacing={2}>
                  {selectedArticles.map(article => (
                    <WrapItem key={article.id}>
                      <Tag size="md" variant="solid" colorScheme={getCategoryColor(article.category)}>
                        <TagLabel>{article.name}</TagLabel>
                        <TagCloseButton onClick={() => removeArticleFromRecipe(article.id)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </Box>

          <Button
            colorScheme="blue"
            onClick={addRecipe}
            leftIcon={<AddIcon />}
            alignSelf="flex-start"
            mt={4}
          >
            Rezept erstellen
          </Button>
        </VStack>
      </Box>

      {/* Recipes List */}
      <Box>
        <Heading size="md" mb={4} color="gray.600">Vorhandene Rezepte</Heading>
        <VStack spacing={6} align="stretch">
          {recipes.map(recipe => (
            <Box key={recipe.id} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <VStack spacing={3} align="stretch" width="100%">
                <HStack justify="space-between" align="start">
                  <Heading size="md" color="blue.600" flex="1" mr={4}>
                    {recipe.name}
                  </Heading>
                  <HStack spacing={2} flexShrink={0}>
                    <IconButton
                      aria-label="Zum heutigen Einkauf hinzufügen"
                      icon={<StarIcon />}
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      onClick={() => addRecipeToTodayList(recipe)}
                      title="Zum heutigen Einkauf hinzufügen"
                    />
                    <IconButton
                      aria-label="Rezept entfernen"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteClick(recipe)}
                    />
                  </HStack>
                </HStack>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Zutaten ({recipe.items.length}):
              </Text>
              <Wrap spacing={2}>
                {recipe.items.map(itemId => {
                  const article = articleMap[itemId];
                  if (!article) return null;

                  return (
                    <WrapItem key={itemId}>
                      <Tag size="md" variant="subtle" colorScheme={getCategoryColor(article.category)}>
                        <TagLabel>
                          {article.name}
                        </TagLabel>
                      </Tag>
                    </WrapItem>
                  );
                })}
              </Wrap>
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {recipes.length === 0 && (
        <Box textAlign="center" mt={8} p={8} bg="gray.600" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            Keine Rezepte gefunden.
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Erstellen Sie Ihr erstes Rezept mit dem Formular oben!
          </Text>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={confirmRemoveRecipe}
        title="Rezept löschen"
        message={`Sind Sie sicher, dass Sie "${recipeToDelete?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        confirmColorScheme="red"
      />
    </Container>
  );
};

export default Rezepte;
