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
  HStack
} from '@chakra-ui/react';
import { CheckIcon, StarIcon } from '@chakra-ui/icons';
import { getCategoryColor } from '../config/categoryColors';

const Page2 = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch items and categories data
    Promise.all([
      fetch('/api/getData.php'),
      fetch('/api/getCategories.php')
    ])
      .then(async ([itemsResponse, categoriesResponse]) => {
        if (!itemsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Network response was not ok');
        }
        
        const itemsData = await itemsResponse.json();
        const categoriesData = await categoriesResponse.json();
        
        setItems(itemsData);
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

  // Function to toggle checked status
  const toggleCheckedStatus = async (itemId) => {
    try {
      // Find the item and toggle its checked status
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      );
      
      // Update local state immediately
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
      console.error('Error toggling checked status:', error);
      // Revert the local state change if save failed
      setItems(items);
      setError('Failed to update item status. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading today's items...</Text>
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
      <Heading mb={6}>Today's Shopping List - Check Off Items</Heading>
      
      <Box>
        <Table variant="simple">
          <Thead bg="green.500">
            <Tr>
              <Th color="white" w="80px">Status</Th>
              <Th color="white" flex="1">Name</Th>
              <Th color="white" flex="1">Category</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map(item => (
              <Tr key={item.id}>
                <Td w="80px">
                  <IconButton
                    aria-label={item.checked ? "Mark as unchecked" : "Mark as checked"}
                    icon={<CheckIcon />}
                    size="sm"
                    colorScheme={item.checked ? "green" : "gray"}
                    variant={item.checked ? "solid" : "outline"}
                    onClick={() => toggleCheckedStatus(item.id)}
                    _hover={{ transform: 'scale(1.1)' }}
                    transition="all 0.2s"
                  />
                </Td>
                <Td flex="1">
                  <HStack spacing={2}>
                    {item.category === "0" && <StarIcon color="yellow.500" />}
                    <Text 
                      textDecoration={item.checked ? 'line-through' : 'none'}
                      color={item.checked ? 'gray.500' : 'inherit'}
                      fontWeight={item.checked ? 'normal' : 'medium'}
                    >
                      {item.name}
                    </Text>
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
      
      {items.length === 0 && (
        <Box textAlign="center" mt={8} p={8} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            No items in today's shopping list yet.
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Add some items from Page 1 to get started!
          </Text>
        </Box>
      )}
    </Container>
  );
};

export default Page2;
