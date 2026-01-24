import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  useColorModeValue,
  Icon,
  IconButton,
  useBreakpointValue,
  BreadcrumbLink,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  BreadcrumbSeparator,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FiChevronRight, FiArrowLeft, FiInfo } from "react-icons/fi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { LuFolderTree } from "react-icons/lu";
import apiService from "../../services/api";

const BREADCRUMBS_ENDPOINT = "/documents";

const Breadcrumbs = memo(
  ({ data = {}, onLastCrumbClick = null, activeLastCrumb = false, from = null }) => {
    const [crumbs, setCrumbs] = useState([]);
    const separatorColor = useColorModeValue("gray.400", "gray.300");
    const ellipsisColor = useColorModeValue("gray.600", "gray.500");
    const hoverColor = useColorModeValue(
      "brandPrimary.600",
      "brandPrimary.200",
    );
    const isMobile = useBreakpointValue({ base: true, lg: false });
    const maxTitle = useBreakpointValue({ base: 16, lg: 24 });
    const lastFolderIdRef = useRef(null);

    const currentFolderId = useMemo(
      () => data?.id || data?._id || null,
      [data],
    );

    const sliceTitle = useCallback(
      (title = "") =>
        title && title?.length > maxTitle
          ? `${title?.slice(0, maxTitle)}...`
          : title,
      [maxTitle],
    );

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
      if (lastFolderIdRef.current !== currentFolderId) {
        lastFolderIdRef.current = currentFolderId;
        buildInitialBreadcrumb(data);
      } else {
        if (currentFolderId === null) {
          setCrumbs([{ id: null, title: "All Documents", parentId: null }]);
        }
      }
    }, [buildInitialBreadcrumb, data, currentFolderId]);

    const loadMore = async (id) => {
      try {
        const result = await apiService.request(
          `${BREADCRUMBS_ENDPOINT}/${id}`,
          {
            method: "GET",
          },
        );

        setCrumbs((prev) => {
          const { data = {} } = result;
          const newCrumb = {
            id: data.id ?? data._id,
            title: data.title,
            parentId: data.parentData?.id,
          };

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

    const renderBreadcrumbs = () => {
      // If we have a 'from' source, show a back button first
      const breadcrumbItems = [];
      
      if (from?.path && from?.label) {
        breadcrumbItems.push(
          <BreadcrumbItem
            h={6}
            mr={2}
            key="back-button"
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
              to={from.path}
              title={`Back to ${from.label}`}
            />
          </BreadcrumbItem>
        );
      }

      if (crumbs.length <= 5) {
        breadcrumbItems.push(...crumbs.map((crumb, index) => renderBreadcrumbItem(crumb, index)));
        return breadcrumbItems;
      }

      const ellipsisIndex = crumbs.findIndex((c) => c.id === "ellipsis");
      const startIndex = ellipsisIndex >= 0 ? ellipsisIndex + 1 : 1;
      const endIndex = crumbs.length - 1;
      const middleCrumbs = crumbs.slice(startIndex, endIndex);

      if (middleCrumbs.length < 2) {
        breadcrumbItems.push(...crumbs.map((crumb, index) => renderBreadcrumbItem(crumb, index)));
        return breadcrumbItems;
      }

      const visibleCrumbs = [
        crumbs[0],
        ...(ellipsisIndex >= 0 ? [crumbs[ellipsisIndex]] : []),
        { id: "dropdown", middleCrumbs },
        crumbs[endIndex],
      ];

      breadcrumbItems.push(...visibleCrumbs.map((crumb, index) => {
        if (crumb.id === "dropdown") {
          return (
            <BreadcrumbItem h={6} key="dropdown-menu">
              <Menu>
                <MenuButton
                  as={IconButton}
                  isRound
                  size="sm"
                  cursor="pointer"
                  icon={<Icon as={LuFolderTree} boxSize={6} />}
                  colorScheme="brandPrimary"
                  color={ellipsisColor}
                  _hover={{ color: hoverColor }}
                  variant="ghost"
                  p={1}
                />
                <MenuList>
                  {crumb.middleCrumbs.map((menuCrumb) => (
                    <MenuItem
                      key={menuCrumb.id}
                      as={RouterLink}
                      to={
                        menuCrumb?.id
                          ? `/documents/folders/${menuCrumb.id}`
                          : `/documents`
                      }
                    >
                      {sliceTitle(menuCrumb.title)}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </BreadcrumbItem>
          );
        }
        return renderBreadcrumbItem(crumb, index);
      }));
      
      return breadcrumbItems;
    };

    const renderBreadcrumbItem = (crumb, index) => {
      const nextId = crumbs[index + 1]?.parentId;
      const isCurrentPage = index === crumbs?.length - 1;

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

      if (
        isCurrentPage &&
        crumb.id !== null &&
        onLastCrumbClick !== null &&
        typeof onLastCrumbClick === "function"
      ) {
        return (
          <BreadcrumbItem
            key={crumb.id ?? "root"}
            {...{ isCurrentPage }}
            sx={{
              ">span:last-of-type": {
                opacity: activeLastCrumb ? 1 : 0,
                color: activeLastCrumb ? hoverColor : separatorColor,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
            _hover={{ ">span:last-of-type": { opacity: 1, color: hoverColor } }}
          >
            <Box
              cursor="pointer"
              onClick={onLastCrumbClick}
              color={activeLastCrumb ? hoverColor : ellipsisColor}
              textDecoration="none"
              _hover={{ color: hoverColor }}
              noOfLines={1}
              maxW={{ base: "xs", lg: "sm" }}
              transition={"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"}
            >
              {crumb.title}
            </Box>
            <BreadcrumbSeparator>
              <Icon as={FiInfo} />
            </BreadcrumbSeparator>
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
            {!isCurrentPage ? sliceTitle(crumb.title) : crumb.title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
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
        {renderBreadcrumbs()}
      </Breadcrumb>
    );
  },
);

Breadcrumbs.displayName = "Breadcrumbs";

export default Breadcrumbs;
