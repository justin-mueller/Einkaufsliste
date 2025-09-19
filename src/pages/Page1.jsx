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

const Page1 = () => {
  const [items, setItems] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customArticleName, setCustomArticleName] = useState('');

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
      setError('Failed to remove item. Please try again.');
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
      setError('Failed to add item. Please try again.');
    }
  };

  // Function to add custom article to today's list
  const addCustomArticle = async () => {
    if (!customArticleName.trim()) {
      setError('Please enter a name for the custom article.');
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
      setError('Failed to add custom article. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={5}>
        <AlertIcon />
        Error loading data: {error}
      </Alert>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading mb={6}>Shopping List</Heading>
      
      {/* Custom Article Form */}
      <Box mb={8} p={4} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4} color="gray.700">Add Custom Article</Heading>
        <HStack spacing={4}>
          <Input
            placeholder="Enter article name..."
            value={customArticleName}
            onChange={(e) => setCustomArticleName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomArticle()}
            maxW="300px"
          />
          <Button 
            colorScheme="purple" 
            onClick={addCustomArticle}
            leftIcon={<AddIcon />}
          >
            Add Custom Item
          </Button>
        </HStack>
        <Text fontSize="sm" color="gray.600" mt={2}>
          Custom items will be marked with a ⭐ and categorized as "Ad-Hoc"
        </Text>
      </Box>
      
      {/* Available Articles Table */}
      <Box mb={8}>
        <Heading size="md" mb={4} color="gray.600">Available Articles</Heading>
        <Table variant="simple">
          <Thead bg="purple.500">
            <Tr>
              <Th color="white" w="40px">Add</Th>
              <Th color="white" w="200px">Name</Th>
              <Th color="white" w="150px">Category</Th>
            </Tr>
          </Thead>
          <Tbody>
            {availableArticles.map(article => (
              <Tr key={article.id}>
                <Td w="40px">
                  <IconButton
                    aria-label="Add item"
                    icon={<AddIcon />}
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    onClick={() => addToTodayList(article)}
                  />
                </Td>
                <Td flex="1">{article.name}</Td>
                <Td flex="1">
                  <Badge colorScheme={getCategoryColor(article.category)}>
                    {categoryMap[article.category] || `Category ${article.category}`}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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
          TODAY'S SHOPPING LIST
        </Text>
      </Box>

      {/* Today's Shopping List Table */}
      <Box>
        <Table variant="simple">
          <Thead style={{ visibility: 'hidden' }}>
            <Tr>
              <Th w="40px">Remove</Th>
              <Th color="white" w="200px">Name</Th>
              <Th color="white" w="150px">Category</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map(item => (
              <Tr key={item.id}>
                <Td w="40px">
                  <IconButton
                    aria-label="Remove item"
                    icon={<MinusIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => removeFromTodayList(item.id)}
                  />
                </Td>
                <Td flex="1">
                  <HStack spacing={2}>
                    {item.category === "0" && <StarIcon color="yellow.500" />}
                    <Text>{item.name}</Text>
                  </HStack>
                </Td>
                <Td flex="1">
                  <Badge colorScheme={getCategoryColor(item.category)}>
                    {categoryMap[item.category] || `Category ${item.category}`}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
};

export default Page1;
