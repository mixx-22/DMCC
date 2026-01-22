import { useRef } from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
  Input,
} from "@chakra-ui/react";
import { FiPlus, FiFolder, FiCalendar, FiChevronDown, FiUpload, FiFileText } from "react-icons/fi";

export const ActionButton = ({
  onFileSelect,
  onFolderModalOpen,
  onAuditModalOpen,
  onFormTemplateModalOpen,
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileSelect(files);
      e.target.value = "";
    }
  };

  return (
    <>
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        display="none"
      />
      <ButtonGroup isAttached colorScheme="brandPrimary">
        <Button leftIcon={<FiPlus />} onClick={handleFileClick}>
          New
        </Button>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiChevronDown />}
            aria-label="More options"
          />
          <MenuList>
            <MenuItem icon={<FiUpload />} onClick={handleFileClick}>
              New File
            </MenuItem>
            <MenuItem icon={<FiFolder />} onClick={onFolderModalOpen}>
              New Folder
            </MenuItem>
            <MenuItem icon={<FiCalendar />} onClick={onAuditModalOpen}>
              New Audit Schedule
            </MenuItem>
            <MenuItem icon={<FiFileText />} onClick={onFormTemplateModalOpen}>
              New Form Template
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>
    </>
  );
};
