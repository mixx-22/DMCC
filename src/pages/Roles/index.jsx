import { Box, Heading } from "@chakra-ui/react";
import PageHeader from "../../components/PageHeader";
import RolesList from "./RolesList";

const Roles = () => {
  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Roles & Permissions</Heading>
      </PageHeader>
      <Box p={4}>
        <RolesList />
      </Box>
    </Box>
  );
};

export default Roles;
