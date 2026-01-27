import PropTypes from "prop-types";
import { useCallback } from "react";
import { useUser } from "./_useContext";
import { disableCan } from "../components/Can";
import { PermissionContext } from "./_contexts";

const PermissionProvider = ({ children }) => {
  let { user = {} } = useUser();

  const getPermissionValue = (obj, to) => {
    try {
      if (["", null, undefined].includes(to)) return 0;
      to = to.replace(/\[(\w+)\]/g, ".$1");
      to = to.replace(/^\./, "");
      let a = to.split(".");
      for (let i = 0, n = a.length; i < n; ++i) {
        let key = a[i];
        if (obj === Object(obj) && key) {
          if (i === 0 || ["c", "r", "u", "d"].includes(key)) {
            obj = obj[key];
          } else {
            obj = obj.permission[key];
          }
        } else {
          return;
        }
      }
      return obj;
    } catch (error) {
      console.warn(to, error);
      return 0;
    }
  };

  const isAllowedTo = useCallback(
    async (permission) => {
      if (disableCan) return true;
      if (user?.id === null) return false;
      let permissions = user?.permissions || {};
      const userPermission = getPermissionValue(permissions, permission);
      return userPermission === 1;
    },
    [user],
  );

  return (
    <PermissionContext.Provider value={{ isAllowedTo }}>
      {children}
    </PermissionContext.Provider>
  );
};
PermissionProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export { PermissionProvider };
