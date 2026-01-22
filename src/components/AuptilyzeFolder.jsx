import { Icon, useToken } from "@chakra-ui/react";
import { Folder } from "../icons/Folder";

const AuptilyzeFolder = ({ sx = {}, ...props }) => {
  const [base, inner, front, baseDark, innerDark, frontDark] = useToken(
    "colors",
    [
      "brandPrimary.600",
      "white",
      "brandPrimary.400",
      "brandPrimary.500",
      "gray.300",
      "brandPrimary.400",
    ],
  );
  return (
    <Icon
      as={Folder}
      boxSize={16}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      sx={{
        "--folder-base": base,
        "--folder-inner": inner,
        "--folder-front": front,
        _dark: {
          "--folder-base": baseDark,
          "--folder-inner": innerDark,
          "--folder-front": frontDark,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default AuptilyzeFolder;
