import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Flex, Link, Box } from '@chakra-ui/react';

const Menu = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Flex 
      as="nav" 
      bg="whiteAlpha.900" 
      color="black"
      p={4} 
      boxShadow="md"
      justify="center"
      overflowX="auto"
    >
      <Flex 
        maxW={{ base: "100%", md: "1200px" }} 
        width="100%" 
        gap={{ base: 2, md: 6 }}
        flexWrap={{ base: "wrap", md: "nowrap" }}
        justify={{ base: "center", md: "flex-start" }}
        minW="fit-content"
      >
        <Link 
          as={RouterLink} 
          to="/Vorbereitung" 
          fontWeight={isActive('/Vorbereitung') ? 'bold' : 'normal'}
          color={isActive('/Vorbereitung') ? 'black' : 'black'}
          px={{ base: 2, md: 3 }}
          py={2}
          borderRadius="md"
          fontSize={{ base: "sm", md: "md" }}
          whiteSpace="nowrap"
          _hover={{ 
            bg: 'gray.200'
          }}
        >
          Vorbereitung
        </Link>
        <Link 
          as={RouterLink} 
          to="/Einkaufen" 
          fontWeight={isActive('/Einkaufen') ? 'bold' : 'normal'}
          color={isActive('/Einkaufen') ? 'black' : 'black'}
          px={{ base: 2, md: 3 }}
          py={2}
          borderRadius="md"
          fontSize={{ base: "sm", md: "md" }}
          whiteSpace="nowrap"
          _hover={{ 
            bg: 'gray.200'
          }}
        >
          Einkaufen
        </Link>
        <Link 
          as={RouterLink} 
          to="/Artikel" 
          fontWeight={isActive('/Artikel') ? 'bold' : 'normal'}
          color={isActive('/Artikel') ? 'black' : 'black'}
          px={{ base: 2, md: 3 }}
          py={2}
          borderRadius="md"
          fontSize={{ base: "sm", md: "md" }}
          whiteSpace="nowrap"
          _hover={{ 
            bg: 'gray.200'
          }}
        >
          Artikel
        </Link>
        <Link 
          as={RouterLink} 
          to="/Rezepte" 
          fontWeight={isActive('/Rezepte') ? 'bold' : 'normal'}
          color={isActive('/Rezepte') ? 'black' : 'black'}
          px={{ base: 2, md: 3 }}
          py={2}
          borderRadius="md"
          fontSize={{ base: "sm", md: "md" }}
          whiteSpace="nowrap"
          _hover={{ 
            bg: 'gray.200'
          }}
        >
          Rezepte
        </Link>
      </Flex>
    </Flex>
  );
};

export default Menu;
