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
  HStack,
  VStack
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { CheckIcon, StarIcon } from '@chakra-ui/icons';
import { getCategoryColor } from '../config/categoryColors';

// Celebration animation keyframes
const rowBounceAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

const Page2 = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatingRows, setAnimatingRows] = useState(new Set());

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
      // Check if this will complete the shopping list
      const currentItem = items.find(item => item.id === itemId);
      const uncheckedItems = items.filter(item => !item.checked && item.id !== itemId);
      const willCompleteList = uncheckedItems.length === 0 && !currentItem?.checked;
      
      // Find the item and toggle its checked status
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      );
      
      // Update local state immediately
      setItems(updatedItems);
      
      // Trigger celebration if this completes the list
      if (willCompleteList) {
        // Start row animations from top to bottom
        const rowIds = items.map(item => item.id);
        setAnimatingRows(new Set());
        
        rowIds.forEach((rowId, index) => {
          setTimeout(() => {
            setAnimatingRows(prev => new Set([...prev, rowId]));
          }, index * 200); // 200ms delay between each row
        });
        
        // Clear animations after they complete
        setTimeout(() => {
          setAnimatingRows(new Set());
        }, rowIds.length * 200 + 600); // Total duration
      }
      
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
      setError('Fehler beim Aktualisieren des Artikelstatus. Bitte versuchen Sie es erneut.');
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Heutige Artikel werden geladen...</Text>
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
      position="relative"
      px={{ base: 2, md: 4 }}
    >
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
              <Tr 
                key={item.id}
                sx={animatingRows.has(item.id) ? {
                  animation: `${rowBounceAnimation} 0.6s ease-in-out`
                } : {}}
              >
                <Td w={{ base: "50px", md: "80px" }} flexShrink={0}>
                  <IconButton
                    aria-label={item.checked ? "Als nicht erledigt markieren" : "Als erledigt markieren"}
                    icon={<CheckIcon />}
                    size="sm"
                    colorScheme={item.checked ? "green" : "gray"}
                    variant={item.checked ? "solid" : "outline"}
                    onClick={() => toggleCheckedStatus(item.id)}
                    _hover={{ transform: 'scale(1.1)' }}
                    transition="all 0.2s"
                  />
                </Td>
                <Td flex="1" minW="0" maxW="none">
                  <HStack spacing={2}>
                    {item.category === "0" && <StarIcon color="yellow.500" />}
                    <Text 
                      textDecoration={item.checked ? 'line-through' : 'none'}
                      color={item.checked ? 'gray.500' : 'inherit'}
                      fontWeight={item.checked ? 'normal' : 'medium'}
                      fontSize={{ base: "sm", md: "md" }}
                      wordBreak="break-word"
                      whiteSpace="normal"
                    >
                      {item.name}
                    </Text>
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
      
      {items.length === 0 && (
        <Box textAlign="center" mt={8} p={8} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            Noch keine Artikel in der heutigen Einkaufsliste.
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Fügen Sie einige Artikel von der Vorbereitung hinzu, um zu beginnen!
          </Text>
        </Box>
      )}
    </Container>
  );
};

export default Page2;
