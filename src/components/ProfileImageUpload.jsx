import { Box, Button, VStack, Text, Image, Icon, useColorModeValue } from "@chakra-ui/react";
import { FiUpload, FiImage } from "react-icons/fi";
import { useState, useRef } from "react";

const ProfileImageUpload = ({ value, onChange, isDisabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const hoverBorderColor = useColorModeValue("brandPrimary.500", "brandPrimary.300");
  const bg = useColorModeValue("gray.50", "gray.700");
  const dragBg = useColorModeValue("brandPrimary.50", "brandPrimary.900");

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isDisabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Read file and convert to base64 or URL
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleClick = () => {
    if (!isDisabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <VStack spacing={3} align="stretch">
      <Box
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragging ? hoverBorderColor : borderColor}
        borderRadius="lg"
        bg={isDragging ? dragBg : bg}
        p={6}
        textAlign="center"
        transition="all 0.2s"
        cursor={isDisabled ? "not-allowed" : "pointer"}
        _hover={
          !isDisabled
            ? {
                borderColor: hoverBorderColor,
                bg: dragBg,
              }
            : {}
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        opacity={isDisabled ? 0.6 : 1}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          disabled={isDisabled}
        />
        
        {value ? (
          <Image
            src={value}
            alt="Profile preview"
            maxH="200px"
            mx="auto"
            borderRadius="md"
            objectFit="contain"
          />
        ) : (
          <VStack spacing={2}>
            <Icon as={FiImage} boxSize={10} color="gray.400" />
            <Text fontSize="sm" color="gray.500">
              Drag & drop an image here
            </Text>
            <Text fontSize="xs" color="gray.400">
              or click to browse
            </Text>
          </VStack>
        )}
      </Box>

      <Button
        leftIcon={<FiUpload />}
        size="sm"
        variant="outline"
        onClick={handleClick}
        isDisabled={isDisabled}
      >
        {value ? "Change Photo" : "Upload Photo"}
      </Button>
    </VStack>
  );
};

export default ProfileImageUpload;
