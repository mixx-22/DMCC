import TableSkeleton from "../common/TableSkeleton";

const DocumentsListSkeleton = ({ rows = 5 }) => {
  const columns = [
    {
      header: "Name",
      type: "avatar",
      width: "200px",
    },
    {
      header: "Owner",
      type: "avatar",
      width: "150px",
    },
    {
      header: "Date Modified",
      type: "text",
      width: "120px",
      height: "16px",
    },
    {
      header: "",
      type: "text",
      width: "40px",
      height: "16px",
    },
  ];

  return <TableSkeleton columns={columns} rows={rows} variant="simple" />;
};

export default DocumentsListSkeleton;
