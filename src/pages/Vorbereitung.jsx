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
  Checkbox, 
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
  VStack
} from '@chakra-ui/react';
import { MinusIcon, AddIcon, StarIcon } from '@chakra-ui/icons';
import { getCategoryColor } from '../config/categoryColors';
import ConfirmDialog from '../components/ConfirmDialog';

const Page1 = () => {
  const [items, setItems] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customArticleName, setCustomArticleName] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch items, articles, and categories data
    Promise.all([
      fetch('/api/getData.php'),
      fetch('/api/getArticles.php'),
      fetch('/api/getCategories.php')
    ])
      .then(async ([itemsResponse, articlesResponse, categoriesResponse]) => {
        if (!itemsResponse.ok || !articlesResponse.ok || !categoriesResponse.ok) {
          throw new Error('Network response was not ok');
        }
        
        const itemsData = await itemsResponse.json();
        const articlesData = await articlesResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setItems(itemsData);
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

  // Create a mapping from category ID to category name
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {});

  // Add Ad-Hoc category
  categoryMap["0"] = "Ad-Hoc";

  // Get IDs of items already in today's list (excluding ad-hoc items from available articles)
  const todayItemIds = new Set(items.filter(item => item.category !== "0").map(item => item.id));
  
  // Filter articles to exclude those already in today's list
  const availableArticles = articles.filter(article => !todayItemIds.has(article.id));

  // Function to remove item from today's list
  const removeFromTodayList = async (itemId) => {
    try {
      // Remove item from local state
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      
      // Save updated data to server
      const response = await fetch('/api/saveData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      // Revert the local state change if save failed
      setItems(items);
      setError('Fehler beim Entfernen des Artikels. Bitte versuchen Sie es erneut.');
    }
  };

  // Function to add item to today's list
  const addToTodayList = async (article) => {
    try {
      // Create new item with default checked status as false
      const newItem = {
        id: article.id,
        name: article.name,
        checked: false,
        category: article.category
      };
      
      // Add item to local state
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      
      // Save updated data to server
      const response = await fetch('/api/saveData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      // Revert the local state change if save failed
      setItems(items);
      setError('Fehler beim Hinzufügen des Artikels. Bitte versuchen Sie es erneut.');
    }
  };

  // Function to add custom article to today's list
  const addCustomArticle = async () => {
    if (!customArticleName.trim()) {
      setError('Bitte geben Sie einen Namen für den eigenen Artikel ein.');
      return;
    }

    try {
      // Generate a unique ID for the custom article (using timestamp to avoid conflicts)
      const customId = `custom_${Date.now()}`;
      
      // Create new custom item
      const newItem = {
        id: customId,
        name: customArticleName.trim(),
        checked: false,
        category: "0" // Ad-Hoc category
      };
      
      // Add item to local state
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      
      // Clear the input field
      setCustomArticleName('');
      
      // Save updated data to server
      const response = await fetch('/api/saveData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }
    } catch (error) {
      console.error('Error adding custom article:', error);
      // Revert the local state change if save failed
      setItems(items);
      setError('Fehler beim Hinzufügen des eigenen Artikels. Bitte versuchen Sie es erneut.');
    }
  };

  // Function to show clear list confirmation dialog
  const handleClearListClick = () => {
    if (items.length === 0) {
      setError('The shopping list is already empty.');
      return;
    }
    setIsConfirmDialogOpen(true);
  };

  // Function to close confirmation dialog
  const handleDialogClose = () => {
    setIsConfirmDialogOpen(false);
  };

  // Function to clear the entire shopping list
  const confirmClearList = async () => {
    try {
      // Clear local state
      setItems([]);

      // Close dialog
      handleDialogClose();

      // Save empty list to server
      const response = await fetch('/api/saveData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([]),
      });

      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }

      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      // Clear any existing error
      setError(null);
    } catch (error) {
      console.error('Error clearing shopping list:', error);
      // Revert local state change if save failed
      // Note: We can't easily revert here since we don't have the original data
      // The user will need to refresh the page to see the current state
      setError('Fehler beim Leeren der Einkaufsliste. Bitte aktualisieren Sie die Seite.');
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Daten werden geladen...</Text>
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
      {/* Custom Article Form */}
      <Box mb={8} p={4} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4} color="gray.700">Eigenen Artikel hinzufügen</Heading>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} flexWrap="wrap">
            <Input
              placeholder="Artikelname eingeben..."
              value={customArticleName}
              onChange={(e) => setCustomArticleName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomArticle()}
              flex="1"
              minW="200px"
            />
            <Button 
              colorScheme="green" 
              onClick={addCustomArticle}
              leftIcon={<AddIcon />}
              flexShrink={0}
            >
              Hinzufügen
            </Button>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Eigene Artikel werden mit einem ⭐ markiert und als "Ad-Hoc" kategorisiert
          </Text>
        </VStack>
      </Box>
      
      {/* Available Articles Table */}
      <Box mb={8} w="100%">
        <Box 
          overflowX="auto"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          w="100%"
        >
          <Table variant="simple" minW="auto" w="100%">
            <Tbody>
            {availableArticles.map(article => (
              <Tr key={article.id}>
                <Td w={{ base: "40px", md: "40px" }} flexShrink={0}>
                  <IconButton
                    aria-label="Add item"
                    icon={<AddIcon />}
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    onClick={() => addToTodayList(article)}
                  />
                </Td>
                <Td flex="1" minW="0" maxW="none">
                  <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word" whiteSpace="normal">{article.name}</Text>
                </Td>
                <Td flex="1" minW="0" maxW="none">
                  <Badge 
                    colorScheme={getCategoryColor(article.category)}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={{ base: 1, md: 2 }}
                    py={{ base: 0.5, md: 1 }}
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {categoryMap[article.category] || `Category ${article.category}`}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        </Box>
      </Box>

      {/* Visual Separator */}
      <Box 
        borderBottom="2px solid" 
        borderColor="blue.200" 
        my={6}
        position="relative"
      >
        <Text 
          position="absolute" 
          left="50%" 
          top="50%" 
          transform="translate(-50%, -50%)" 
          bg="white" 
          px={4} 
          color="blue.600" 
          fontSize="sm"
          fontWeight="bold"
        >
          Heutige Einkaufsliste
        </Text>
      </Box>

      {/* Today's Shopping List Table */}
      <Box w="100%">
        <Box 
          overflowX="auto"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          w="100%"
        >
          <Table variant="simple" minW="auto" w="100%">
            <Tbody>
            {items.map(item => (
              <Tr key={item.id}>
                <Td w={{ base: "40px", md: "40px" }} flexShrink={0}>
                  <IconButton
                    aria-label="Remove item"
                    icon={<MinusIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => removeFromTodayList(item.id)}
                  />
                </Td>
                <Td flex="1" minW="0" maxW="none">
                  <HStack spacing={2}>
                    {item.category === "0" && <StarIcon color="yellow.500" w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />}
                    <Text fontSize={{ base: "sm", md: "md" }} wordBreak="break-word" whiteSpace="normal">{item.name}</Text>
                  </HStack>
                </Td>
                <Td flex="1" minW="0" maxW="none">
                  <Badge 
                    colorScheme={getCategoryColor(item.category)}
                    fontSize={{ base: "xs", md: "sm" }}
                    px={{ base: 1, md: 2 }}
                    py={{ base: 0.5, md: 1 }}
                    whiteSpace="normal"
                    wordBreak="break-word"
                  >
                    {categoryMap[item.category] || `Category ${item.category}`}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        </Box>
      </Box>

      {/* Clear All Button */}
      {items.length > 0 && (
        <Box mt={4} textAlign="center">
          <Button
            colorScheme="red"
            size="sm"
            variant="outline"
            onClick={handleClearListClick}
            leftIcon={<MinusIcon />}
          >
            Alle löschen
          </Button>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={confirmClearList}
        title="Einkaufsliste leeren"
        message={`Sind Sie sicher, dass Sie die gesamte Einkaufsliste leeren möchten? Dies entfernt alle ${items.length} Artikel und kann nicht rückgängig gemacht werden.`}
        confirmText="Alle löschen"
        cancelText="Abbrechen"
        confirmColorScheme="red"
      />
    </Container>
  );
};

export default Page1;
