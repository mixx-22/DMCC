import TableSkeleton from "./common/TableSkeleton";

const RolesSkeleton = ({ rows = 5 }) => {
  const columns = [
    {
      header: "Role Title",
      type: "stacked",
      width: "120px",
    },
    {
      header: "Summary",
      type: "text",
      width: "300px",
      height: "16px",
    },
    {
      header: "Last Updated",
      type: "text",
      width: "100px",
      height: "16px",
    },
  ];

  return <TableSkeleton columns={columns} rows={rows} />;
};

export default RolesSkeleton;
