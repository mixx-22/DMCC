import TableSkeleton from "./common/TableSkeleton";

const UsersSkeleton = ({ rows = 5 }) => {
  const columns = [
    {
      header: "Name",
      type: "avatar",
      width: "150px",
    },
    {
      header: "Email",
      type: "text",
      width: "200px",
    },
    {
      header: "Roles",
      type: "badges",
      width: "80px",
      height: "24px",
    },
    {
      header: "Status",
      type: "badge",
      width: "70px",
      height: "24px",
    },
  ];

  return <TableSkeleton columns={columns} rows={rows} variant="simple" />;
};

export default UsersSkeleton;
