import { Box, Heading, Button, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Layout from "./layout";
import PageHeader from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter";

const Users = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Users</Heading>
      </PageHeader>
      <PageFooter>
        <Flex gap={4} justifyContent="flex-end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brandPrimary"
            onClick={() => navigate("/users/new")}
          >
            Create New User
          </Button>
        </Flex>
      </PageFooter>
      <Layout />
    </Box>
  );
};

export default Users;
