import { Box, Heading } from "@chakra-ui/react";
import UsersList from "./UsersList";
import PageHeader from "../../components/PageHeader";

const Users = () => {
  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Users</Heading>
      </PageHeader>
      <Box>
        <UsersList />
      </Box>
    </Box>
  );
};

export default Users;
