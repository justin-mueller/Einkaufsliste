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

  // Sort articles by numeric category (ascending)
  const sortedArticles = [...articles].sort((a, b) => {
    const ca = parseInt(a.category || '0', 10) || 0;
    const cb = parseInt(b.category || '0', 10) || 0;
    return ca - cb || a.name.localeCompare(b.name);
  });

  // Function to add new article
  const addArticle = async () => {
    if (!newArticleName.trim() || !selectedCategory) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Artikelnamen ein und wählen Sie eine Kategorie aus.',
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
        title: 'Erfolg',
        description: 'Artikel erfolgreich hinzugefügt!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding article:', error);
      // Revert local state
      setArticles(articles);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Hinzufügen des Artikels. Bitte versuchen Sie es erneut.',
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
        title: 'Erfolg',
        description: 'Artikel erfolgreich entfernt!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing article:', error);
      // Revert local state
      setArticles(articles);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Entfernen des Artikels. Bitte versuchen Sie es erneut.',
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
        <Text mt={4}>Artikel werden geladen...</Text>
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
      {/* Add New Article Form */}
      <Box mb={8} p={6} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4} color="gray.700">Neuen Artikel hinzufügen</Heading>
        <VStack spacing={4} align="stretch">
          <VStack spacing={4} align="stretch">
            <FormControl flex="1">
              <FormLabel>Artikelname</FormLabel>
              <Input
                placeholder="Artikelname eingeben..."
                value={newArticleName}
                onChange={(e) => setNewArticleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addArticle()}
              />
            </FormControl>
            
            <FormControl flex="1">
              <FormLabel>Kategorie</FormLabel>
              <Select
                placeholder="Kategorie auswählen"
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
          </VStack>
          
          <Button 
            colorScheme="blue" 
            onClick={addArticle}
            leftIcon={<AddIcon />}
            alignSelf="flex-start"
          >
            Artikel hinzufügen
          </Button>
        </VStack>
      </Box>
      
      {/* Articles Table */}
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
            {sortedArticles.map(article => (
              <Tr key={article.id}>
                <Td w={{ base: "50px", md: "80px" }} flexShrink={0}>
                  <IconButton
                    aria-label="Artikel entfernen"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleDeleteClick(article)}
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
      
      {articles.length === 0 && (
        <Box textAlign="center" mt={8} p={8} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            Keine Artikel gefunden.
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Fügen Sie Ihren ersten Artikel mit dem Formular oben hinzu!
          </Text>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={confirmRemoveArticle}
        title="Artikel löschen"
        message={`Sind Sie sicher, dass Sie "${articleToDelete?.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        confirmColorScheme="red"
      />
    </Container>
  );
};

export default Page3;
