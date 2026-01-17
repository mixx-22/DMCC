import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
} from "@chakra-ui/react";
import { FiPlus, FiFolder, FiCalendar, FiChevronDown, FiUpload } from "react-icons/fi";

export const ActionButton = ({
  onFileModalOpen,
  onFolderModalOpen,
  onAuditModalOpen,
}) => {
  return (
    <ButtonGroup isAttached colorScheme="brandPrimary">
      <Button leftIcon={<FiPlus />} onClick={onFileModalOpen}>
        New
      </Button>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiChevronDown />}
          aria-label="More options"
        />
        <MenuList>
          <MenuItem icon={<FiUpload />} onClick={onFileModalOpen}>
            New File
          </MenuItem>
          <MenuItem icon={<FiFolder />} onClick={onFolderModalOpen}>
            New Folder
          </MenuItem>
          <MenuItem icon={<FiCalendar />} onClick={onAuditModalOpen}>
            New Audit Schedule
          </MenuItem>
        </MenuList>
      </Menu>
    </ButtonGroup>
  );
};
