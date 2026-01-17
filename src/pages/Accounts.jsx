import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  HStack,
  Input,
  VStack,
  Text,
  Avatar,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser } from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import AccountModal from "../components/AccountModal";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";

const Accounts = () => {
  const { accounts, deleteAccount, currentUser } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser?.userType !== "Admin") {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  if (currentUser?.userType !== "Admin") {
    return (
      <Box>
        <Text>Access Denied. Only administrators can access this page.</Text>
      </Box>
    );
  }

  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.userType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreate = () => {
    setSelectedAccount(null);
    onOpen();
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    onOpen();
  };

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    onDeleteOpen();
  };

  const handleDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete.id);
      toast.success("Account Deleted", {
        description: `${accountToDelete.name} has been deleted`,
        duration: 3000,
      });
    }
    setAccountToDelete(null);
    onDeleteClose();
  };

  const getUserTypeColor = (userType) => {
    switch (userType?.toLowerCase()) {
      case "admin":
        return "red";
      case "manager":
        return "orange";
      case "supervisor":
        return "purple";
      case "user":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Accounts</Heading>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleCreate}
          >
            Create New Account
          </Button>
        </Flex>
      </PageFooter>

      {/* Search Bar */}
      <Box mb={6}>
        <Box position="relative" maxW="400px">
          <Input
            placeholder="Search accounts by name, job title, department, or user type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pl={10}
            size="lg"
          />
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            color="gray.400"
          >
            <FiSearch />
          </Box>
        </Box>
      </Box>

      {/* Accounts Table */}
      <Box bg="white" borderRadius="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Profile</Th>
              <Th>Name</Th>
              <Th>Job Title</Th>
              <Th>User Type</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAccounts.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <VStack>
                    <FiUser size={48} color="gray" />
                    <Text color="gray.500">No accounts found</Text>
                    <Button size="sm" colorScheme="blue" onClick={handleCreate}>
                      Create Your First Account
                    </Button>
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredAccounts.map((account) => (
                <Tr key={`account-${account.id}`}>
                  <Td>
                    <Avatar
                      src={account.profilePicture}
                      name={account.name}
                      size="md"
                    />
                  </Td>
                  <Td fontWeight="semibold">{account.name}</Td>
                  <Td>{account.jobTitle || "N/A"}</Td>
                  <Td>
                    <Badge colorScheme={getUserTypeColor(account.userType)}>
                      {account.userType || "N/A"}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEdit(account)}
                        aria-label="Edit account"
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(account)}
                        aria-label="Delete account"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Create/Edit Modal */}
      <AccountModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedAccount(null);
        }}
        account={selectedAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <strong>{accountToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Accounts;
