import { useState, useEffect, useCallback } from "react";
import {
  Link,
  Breadcrumb,
  BreadcrumbItem,
  useColorModeValue,
  Icon,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import apiService from "../../services/api";

const BREADCRUMBS_ENDPOINT = "/documents";

const Breadcrumbs = ({ data = {} }) => {
  const [crumbs, setCrumbs] = useState([]);
  const separatorColor = useColorModeValue("gray.400", "gray.300");
  const ellipsisColor = useColorModeValue("gray.600", "gray.500");
  const hoverColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");
  const isMobile = useBreakpointValue({ base: true, md: false });

  const buildInitialBreadcrumb = useCallback(
    (data) => {
      const rootCrumb = { id: null, title: "All Documents", parentId: null };
      const id = data?.id || data?._id;
      if (!id) {
        setCrumbs([rootCrumb]);
        return;
      }

      const thisCrumb = {
        id,
        title: data?.title,
        parentId: data?.parentData?.id ?? null,
      };

      const parent = data?.parentData;
      const parentCrumb = {
        id: parent?.id || parent?._id || null,
        title: parent?.title,
        parentId: parent?.parentId,
      };

      if (isMobile) {
        if (parent) {
          setCrumbs([parentCrumb, thisCrumb]);
          return;
        }
        setCrumbs([rootCrumb, thisCrumb]);
        return;
      }

      if (!parent) {
        setCrumbs([rootCrumb, thisCrumb]);
        return;
      }

      setCrumbs([
        rootCrumb,
        ...(parent.parentId ? [{ id: "ellipsis" }] : []),
        parentCrumb,
        thisCrumb,
      ]);
    },
    [isMobile],
  );

  useEffect(() => {
    buildInitialBreadcrumb(data);
  }, [buildInitialBreadcrumb, data]);

  const loadMore = async (id) => {
    try {
      const result = await apiService.request(`${BREADCRUMBS_ENDPOINT}/${id}`, {
        method: "GET",
      });

      setCrumbs((prev) => {
        const { data = {} } = result;
        const newCrumb = {
          id: data.id ?? data._id,
          title: data.title,
          parentId: data.parentId,
        };

        let updated = [...prev];

        updated = updated.filter((c) => c.id !== "ellipsis");

        if (data.parentId) {
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
    <Breadcrumb
      fontSize={{ base: "lg", lg: "xl" }}
      separator={
        <Icon boxSize={4} as={FiChevronRight} color={separatorColor} />
      }
      sx={{
        "li span:has(svg)": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {crumbs.map((crumb, index) => {
        if (crumb.id === "ellipsis") {
          const nextId = crumbs[index + 1]?.parentId;

          return (
            <BreadcrumbItem
              h={6}
              key={`ellipsis-${index}`}
              onClick={() => loadMore(nextId)}
            >
              <IconButton
                isRound
                size="sm"
                cursor="pointer"
                icon={<Icon as={HiEllipsisHorizontal} boxSize={6} />}
                colorScheme="brandPrimary"
                color={ellipsisColor}
                _hover={{ color: hoverColor }}
                variant="ghost"
                p={1}
              />
            </BreadcrumbItem>
          );
        }

        return (
          <BreadcrumbItem
            key={crumb.id ?? "root"}
            isCurrentPage={index === crumb?.length - 1}
          >
            <Link
              as={RouterLink}
              color={ellipsisColor}
              _hover={{ color: hoverColor }}
              to={crumb?.id ? `/documents/folders/${crumb.id}` : `/documents`}
            >
              {crumb.title}
            </Link>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
