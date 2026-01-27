import { Box, Heading, Button, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";
import RolesList from "./RolesList";
import Can from "../../components/Can";

const Roles = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Roles & Permissions</Heading>
      </PageHeader>
      <Can to="settings.roles.c">
        <PageFooter>
          <Flex gap={4} justifyContent="flex-end">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brandPrimary"
              onClick={() => navigate("/roles/new")}
            >
              Create New Role
            </Button>
          </Flex>
        </PageFooter>
      </Can>
      <Box>
        <RolesList />
      </Box>
    </Box>
  );
};

export default Roles;
