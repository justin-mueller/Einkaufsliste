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
  useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { getCategoryColor } from '../config/categoryColors';
import ConfirmDialog from '../components/ConfirmDialog';

const Page3 = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newArticleName, setNewArticleName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Fetch articles and categories data
    Promise.all([
      fetch('/api/getArticles.php'),
      fetch('/api/getCategories.php')
    ])
      .then(async ([articlesResponse, categoriesResponse]) => {
        if (!articlesResponse.ok || !categoriesResponse.ok) {
          throw new Error('Network response was not ok');
        }
        
        const articlesData = await articlesResponse.json();
        const categoriesData = await categoriesResponse.json();
        
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

  // Function to add new article
  const addArticle = async () => {
    if (!newArticleName.trim() || !selectedCategory) {
      toast({
        title: 'Error',
        description: 'Please enter article name and select a category.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Generate a unique ID for the new article
      const newId = Math.max(...articles.map(a => parseInt(a.id)), 0) + 1;
      
      // Create new article
      const newArticle = {
        id: newId.toString(),
        name: newArticleName.trim(),
        category: selectedCategory
      };
      
      // Add to local state
      const updatedArticles = [...articles, newArticle];
      setArticles(updatedArticles);
      
      // Clear form
      setNewArticleName('');
      setSelectedCategory('');
      
      // Save to server
      const response = await fetch('/api/saveArticles.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedArticles),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      toast({
        title: 'Success',
        description: 'Article added successfully!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding article:', error);
      // Revert local state
      setArticles(articles);
      toast({
        title: 'Error',
        description: 'Failed to add article. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to show delete confirmation dialog
  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setIsConfirmDialogOpen(true);
  };

  // Function to close confirmation dialog
  const handleDialogClose = () => {
    setIsConfirmDialogOpen(false);
    setArticleToDelete(null);
  };

  // Function to confirm and remove article
  const confirmRemoveArticle = async () => {
    if (!articleToDelete) return;

    try {
      // Remove from local state
      const updatedArticles = articles.filter(article => article.id !== articleToDelete.id);
      setArticles(updatedArticles);
      
      // Close dialog
      handleDialogClose();
      
      // Save to server
      const response = await fetch('/api/saveArticles.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedArticles),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save data to server');
      }
      
      const result = await response.json();
      if (result.status !== 'success') {
        throw new Error('Server returned error status');
      }

      toast({
        title: 'Success',
        description: 'Article removed successfully!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing article:', error);
      // Revert local state
      setArticles(articles);
      toast({
        title: 'Error',
        description: 'Failed to remove article. Please try again.',
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
        <Text mt={4}>Loading articles...</Text>
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
      <Heading mb={6}>Article Editor</Heading>
      
      {/* Add New Article Form */}
      <Box mb={8} p={6} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4} color="gray.700">Add New Article</Heading>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <FormControl flex="1">
              <FormLabel>Article Name</FormLabel>
              <Input
                placeholder="Enter article name..."
                value={newArticleName}
                onChange={(e) => setNewArticleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addArticle()}
              />
            </FormControl>
            
            <FormControl flex="1">
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>
          
          <Button 
            colorScheme="blue" 
            onClick={addArticle}
            leftIcon={<AddIcon />}
            alignSelf="flex-start"
          >
            Add Article
          </Button>
        </VStack>
      </Box>
      
      {/* Articles Table */}
      <Box>
        <Heading size="md" mb={4} color="gray.600">Existing Articles</Heading>
        <Table variant="simple">
          <Thead bg="blue.500">
            <Tr>
              <Th color="white" w="80px">Action</Th>
              <Th color="white" flex="1">Name</Th>
              <Th color="white" flex="1">Category</Th>
            </Tr>
          </Thead>
          <Tbody>
            {articles.map(article => (
              <Tr key={article.id}>
                <Td w="80px">
                  <IconButton
                    aria-label="Remove article"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleDeleteClick(article)}
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
      
      {articles.length === 0 && (
        <Box textAlign="center" mt={8} p={8} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            No articles found.
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Add your first article using the form above!
          </Text>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={confirmRemoveArticle}
        title="Delete Article"
        message={`Are you sure you want to delete "${articleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColorScheme="red"
      />
    </Container>
  );
};

export default Page3;
