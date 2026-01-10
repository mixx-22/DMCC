import { useMemo } from "react";
import {
  Box,
  VStack,
  Heading,
  Link,
  Icon,
  Flex,
  Text,
  useColorModeValue,
  Container,
  Divider,
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

const isRouteMatch = (location, target) => {
  const [targetPath, targetQuery] = target.split("?");
  const targetParams = new URLSearchParams(targetQuery);
  const currentParams = new URLSearchParams(location.search);

  if (location.pathname !== targetPath) return false;
  if (!targetQuery) return currentParams.toString() === "";

  for (const [key, value] of targetParams.entries()) {
    if (currentParams.get(key) !== value) return false;
  }
  return true;
};

const MenuItemCard = ({ to, icon, label, description, isActive }) => {
  const activeBg = useColorModeValue("brandPrimary.50", "whiteAlpha.200");
  const activeColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const descColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Link as={NavLink} to={to} w="full" _hover={{ textDecoration: "none" }}>
      <Flex
        align="center"
        p={4}
        borderRadius="md"
        border="1px"
        borderColor={isActive ? activeColor : borderColor}
        bg={isActive ? activeBg : "transparent"}
        _hover={{ bg: isActive ? activeBg : hoverBg, transform: "translateY(-2px)" }}
        transition="all 0.2s"
        gap={4}
        w="full"
      >
        <Icon
          as={icon}
          boxSize={6}
          color={isActive ? activeColor : textColor}
        />
        <Box flex={1}>
          <Text
            fontSize="md"
            fontWeight={isActive ? "semibold" : "medium"}
            color={isActive ? activeColor : textColor}
          >
            {label}
          </Text>
          {description && (
            <Text fontSize="sm" color={descColor}>
              {description}
            </Text>
          )}
        </Box>
      </Flex>
    </Link>
  );
};

const Menu = () => {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const sectionColor = useColorModeValue("gray.600", "gray.400");

  const isAdmin = true;

  const navItems = useMemo(() => {
    const items = [
      {
        id: "dashboard",
        path: "/dashboard",
        label: "Dashboard",
        icon: FiHome,
        description: "View your dashboard and analytics",
      },
      {
        id: "documents",
        path: "/documents",
        label: "Documents",
        icon: FiFileText,
        description: "Manage all your documents",
      },
    ];

    if (isAdmin) {
      items.push({
        id: "users",
        path: "/users",
        label: "Users",
        icon: FiUsers,
        description: "Manage user accounts and permissions",
      });
      items.push({
        id: "roles",
        path: "/roles",
        label: "Roles & Permissions",
        icon: FiSettings,
        description: "Configure roles and access controls",
      });
    }

    return items;
  }, [isAdmin]);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={8}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Heading size="lg" color={headingColor}>
            Menu
          </Heading>

          <Box bg={bgColor} p={6} borderRadius="lg" shadow="sm">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={sectionColor}
              mb={4}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Main Navigation
            </Text>
            <VStack spacing={3} align="stretch">
              {navItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  to={item.path}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  isActive={isRouteMatch(location, item.path)}
                />
              ))}
            </VStack>
          </Box>

          <Divider />

          <Text fontSize="sm" color={sectionColor} textAlign="center">
            Select a menu item to navigate
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Menu;
