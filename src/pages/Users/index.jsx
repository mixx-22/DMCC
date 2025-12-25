import { Box, Heading } from "@chakra-ui/react";
import Layout from "./layout";
import PageHeader from "../../components/PageHeader";

const Users = () => {
  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Users</Heading>
      </PageHeader>
      <Layout />
    </Box>
  );
};

export default Users;
