import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  useClipboard,
} from "@chakra-ui/react";
import { FiCopy, FiCheck } from "react-icons/fi";

const UserCredentialsModal = ({
  isOpen,
  onClose,
  email,
  password,
  username,
  isResetPassword = false,
}) => {
  const { hasCopied: emailCopied, onCopy: onCopyEmail } = useClipboard(email);

  const { hasCopied: passwordCopied, onCopy: onCopyPassword } =
    useClipboard(password);

  const { hasCopied: usernameCopied, onCopy: onCopyUsername } =
    useClipboard(username);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isResetPassword ? "Password Reset Successful" : "New User Credentials"}
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription>
                <strong>Important:</strong> This is the only time the password
                will be shown. Please copy and securely share these credentials
                with the user. A new password can only be created in the future
                through the password reset feature.
              </AlertDescription>
            </Alert>

            <VStack spacing={3} align="stretch">
              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                Email Address
              </Text>
              <InputGroup>
                <Input
                  value={email}
                  isReadOnly
                  bg="gray.50"
                  fontFamily="mono"
                />
                <InputRightElement>
                  <IconButton
                    icon={emailCopied ? <FiCheck /> : <FiCopy />}
                    onClick={onCopyEmail}
                    size="sm"
                    colorScheme={emailCopied ? "green" : "gray"}
                    aria-label="Copy email"
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>

            <VStack spacing={3} align="stretch">
              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                Username
              </Text>
              <InputGroup>
                <Input
                  value={username}
                  isReadOnly
                  bg="gray.50"
                  fontFamily="mono"
                />
                <InputRightElement>
                  <IconButton
                    icon={usernameCopied ? <FiCheck /> : <FiCopy />}
                    onClick={onCopyUsername}
                    size="sm"
                    colorScheme={usernameCopied ? "green" : "gray"}
                    aria-label="Copy username"
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>

            <VStack spacing={3} align="stretch">
              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                Temporary Password
              </Text>
              <InputGroup>
                <Input
                  value={password}
                  isReadOnly
                  bg="gray.50"
                  fontFamily="mono"
                  type="text"
                />
                <InputRightElement>
                  <IconButton
                    icon={passwordCopied ? <FiCheck /> : <FiCopy />}
                    onClick={onCopyPassword}
                    size="sm"
                    colorScheme={passwordCopied ? "green" : "gray"}
                    aria-label="Copy password"
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="brandPrimary" onClick={onClose}>
            Got It!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserCredentialsModal;
