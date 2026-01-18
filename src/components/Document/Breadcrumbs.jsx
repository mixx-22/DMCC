import React, { useState, useEffect } from "react";
import { HStack, Text, Link } from "@chakra-ui/react";
import apiService from "../../services/api";

const BREADCRUMBS_ENDPOINT = "/breadcrumbs";

const Breadcrumbs = ({ document }) => {
  const [crumbs, setCrumbs] = useState([]);

  useEffect(() => {
    buildInitialBreadcrumb(document);
  }, [document]);

  const buildInitialBreadcrumb = (doc) => {
    const base = [{ id: null, name: "All Documents", parentId: null }];

    if (!doc.parent) {
      setCrumbs(base);
      return;
    }

    const parentCrumb = {
      id: doc.parent.id,
      name: doc.parent.name,
      parentId: doc.parent.parentId,
    };

    if (doc.parent.parentId) {
      setCrumbs([...base, { id: "ellipsis" }, parentCrumb]);
    } else {
      setCrumbs([...base, parentCrumb]);
    }
  };

  const loadMore = async (id) => {
    try {
      const result = await apiService.request(`${BREADCRUMBS_ENDPOINT}/${id}`, {
        method: "GET",
      });

      setCrumbs((prev) => {
        const newCrumb = {
          id: result.id,
          name: result.name,
          parentId: result.parentId,
        };

        let updated = [...prev];

        // Remove existing ellipsis
        updated = updated.filter((c) => c.id !== "ellipsis");

        if (result.parentId) {
          updated.splice(1, 0, { id: "ellipsis" });
        }

        updated.splice(1, 0, newCrumb);

        return updated;
      });
    } catch (err) {
      console.error("Failed to load breadcrumb", err);
    }
  };

  return (
    <HStack spacing={2}>
      {crumbs.map((crumb, index) => {
        if (crumb.id === "ellipsis") {
          const nextId = crumbs[index + 1]?.parentId;

          return (
            <Text
              key={`ellipsis-${index}`}
              cursor="pointer"
              onClick={() => loadMore(nextId)}
            >
              [...]
            </Text>
          );
        }

        return (
          <React.Fragment key={crumb.id ?? "root"}>
            <Link
              onClick={() =>
                crumb.id && console.log("navigate to folder", crumb.id)
              }
            >
              {crumb.name}
            </Link>

            {index < crumbs.length - 1 && <Text>{">"}</Text>}
          </React.Fragment>
        );
      })}
    </HStack>
  );
};

export default Breadcrumbs;
