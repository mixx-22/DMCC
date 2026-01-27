import { useRef, useState, useEffect } from "react";
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
import {
  FiPlus,
  FiFolder,
  FiCalendar,
  FiChevronDown,
  FiUpload,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import { usePermissions } from "../../context/_useContext";

export const ActionButton = ({
  onFileSelect,
  onFolderModalOpen,
  onAuditModalOpen,
  onFormTemplateModalOpen,
  onQualityDocumentModalOpen,
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

  const { isAllowedTo } = usePermissions();
  const [isAuditScheduleAllowed, setIsAuditScheduleAllowed] = useState(1);
  const [isTemplateAllowed, setIsTemplateAllowed] = useState(1);

  useEffect(() => {
    async function init() {
      const val = await isAllowedTo("audit.c");
      setIsAuditScheduleAllowed(val);

      const val2 = await isAllowedTo("audit.c");
      setIsTemplateAllowed(val2);
    }
    init();
  }, [isAllowedTo]);

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
            <MenuItem icon={<FiAward />} onClick={onQualityDocumentModalOpen}>
              New Quality Document
            </MenuItem>
            <MenuItem icon={<FiFolder />} onClick={onFolderModalOpen}>
              New Folder
            </MenuItem>
            {isAuditScheduleAllowed && (
              <MenuItem icon={<FiCalendar />} onClick={onAuditModalOpen}>
                New Audit Schedule
              </MenuItem>
            )}
            {isTemplateAllowed && (
              <MenuItem icon={<FiFileText />} onClick={onFormTemplateModalOpen}>
                New Form Template
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </ButtonGroup>
    </>
  );
};
