import { Box, Heading } from "@chakra-ui/react";
import Layout from "./layout";
import PageHeader from "../../components/PageHeader";

export const Dashboard = () => {
  return (
    <Box>
      <PageHeader>
        <Heading variant="pageTitle">Dashboard</Heading>
      </PageHeader>
      <Layout />
    </Box>
  );
};
