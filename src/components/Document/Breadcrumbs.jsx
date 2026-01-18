import { useState, useEffect, useCallback } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  useColorModeValue,
  Icon,
  IconButton,
  useBreakpointValue,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import apiService from "../../services/api";

const BREADCRUMBS_ENDPOINT = "/documents";

const Breadcrumbs = ({ data = {} }) => {
  const [crumbs, setCrumbs] = useState([]);
  const separatorColor = useColorModeValue("gray.400", "gray.300");
  const ellipsisColor = useColorModeValue("gray.600", "gray.500");
  const hoverColor = useColorModeValue("brandPrimary.600", "brandPrimary.200");
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const maxTitle = useBreakpointValue({ base: 16, lg: 24 });

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
          setCrumbs([{ id: "previous" }, thisCrumb]);
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
          parentId: data.parentData?.id,
        };
        console.log(data, newCrumb);

        let updated = [...prev];

        updated = updated.filter((c) => c.id !== "ellipsis");

        let newCrumbIndex = 1;
        if (data.parentData?.id) {
          updated.splice(1, 0, { id: "ellipsis" });
          newCrumbIndex = 2;
        }

        updated.splice(newCrumbIndex, 0, newCrumb);

        return updated;
      });
    } catch (err) {
      console.error("Failed to load breadcrumb", err);
    }
  };

  return (
    <Breadcrumb
      fontSize={{ base: "md", md: "lg", lg: "xl" }}
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
        const nextId = crumbs[index + 1]?.parentId;
        const isCurrentPage = index === crumbs?.length - 1;
        const splicedTitle = crumb?.title?.slice(0, maxTitle);
        if (crumb.id === "previous") {
          return (
            <BreadcrumbItem
              h={6}
              mr={2}
              key={`previous-${index}`}
              sx={{ ">span": { display: "none !important" } }}
            >
              <IconButton
                isRound
                size="sm"
                cursor="pointer"
                icon={<Icon as={FiArrowLeft} boxSize={6} />}
                colorScheme="brandPrimary"
                color={separatorColor}
                _hover={{ color: hoverColor }}
                variant="ghost"
                p={1}
                as={RouterLink}
                to={nextId ? `/documents/folders/${nextId}` : `/documents`}
              />
            </BreadcrumbItem>
          );
        }

        if (crumb.id === "ellipsis") {
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
          <BreadcrumbItem key={crumb.id ?? "root"} {...{ isCurrentPage }}>
            <BreadcrumbLink
              as={RouterLink}
              color={ellipsisColor}
              textDecoration="none"
              _hover={{ color: hoverColor }}
              to={crumb?.id ? `/documents/folders/${crumb.id}` : `/documents`}
              noOfLines={isCurrentPage ? 1 : { base: 1, lg: 2 }}
              maxW={isCurrentPage ? { base: "xs", lg: "sm" } : "full"}
            >
              {!isCurrentPage
                ? crumb.title.length > maxTitle
                  ? `${splicedTitle}...`
                  : crumb.title
                : crumb.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
