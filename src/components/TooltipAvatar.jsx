import { Avatar, Tooltip } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import PropTypes from "prop-types";
import { getImageSrc } from "../utils/helpers";

const TooltipAvatar = ({
  id,
  name,
  image,
  label = null,
  urlPrefix = `/user/`,
  ...props
}) => {
  if (typeof image === "object") {
    image = "";
  }

  return (
    <Tooltip label={label !== null ? label : name}>
      {id ? (
        <Avatar
          as={ReactRouterLink}
          to={`${urlPrefix}${id}`}
          target="_blank"
          {...{ name, ...props }}
          src={getImageSrc(image)}
        />
      ) : (
        <Avatar {...{ name, ...props }} src={getImageSrc(image)} />
      )}
    </Tooltip>
  );
};

TooltipAvatar.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  urlPrefix: PropTypes.string,
  image: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
  ]),
  label: PropTypes.any,
};

export default TooltipAvatar;
