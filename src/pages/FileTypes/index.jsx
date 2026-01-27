import { Box, Heading, Button, Flex, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import FileTypesList from "./FileTypesList";
import FileTypeModal from "./FileTypeModal";
import Can from "../../components/Can";

const FileTypes = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">File Types</Heading>
      </PageHeader>
      <Can to="settings.fileType.c">
        <PageFooter>
          <Flex gap={4} justifyContent="flex-end">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              onClick={onOpen}
            >
              Create New File Type
            </Button>
          </Flex>
        </PageFooter>
      </Can>
      <Box>
        <FileTypesList />
      </Box>

      <FileTypeModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default FileTypes;
