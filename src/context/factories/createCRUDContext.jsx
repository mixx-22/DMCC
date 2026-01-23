import { useCallback, useReducer, useRef } from "react";
import apiService from "../../services/api";

const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LIMIT) || 10;
const USE_API = import.meta.env.VITE_USE_API !== "false";

/**
 * Factory function to create a CRUD context provider with pagination and search
 * 
 * @param {Object} config - Configuration object
 * @param {Object} config.Context - The React context to use
 * @param {string} config.resourceName - Name of the resource (e.g., 'users', 'teams', 'roles')
 * @param {string} config.resourceKey - Key used in state (e.g., 'users', 'teams', 'roles')
 * @param {string} config.endpoint - API endpoint for the resource
 * @param {Array} config.mockData - Mock data for local development
 * @param {Function} config.filterMockData - Function to filter mock data based on search term
 * @param {Object} config.additionalState - Additional state properties
 * 
 * @returns {Function} - Provider component
 */
export function createCRUDProvider({
  Context,
  resourceName,
  resourceKey,
  endpoint,
  mockData = [],
  filterMockData = (data) => data,
  additionalState = {},
}) {
  const SET_ACTION = `SET_${resourceName.toUpperCase()}`;

  const reducer = (state, action) => {
    const { type, ...payload } = action;
    switch (type) {
      case SET_ACTION:
        return {
          ...state,
          [resourceKey]: payload[resourceKey],
          total: payload.total !== undefined ? payload.total : state.total,
          ...(payload.documentCount !== undefined && { documentCount: payload.documentCount }),
          ...(payload.page !== undefined && { page: payload.page }),
        };
      case "SET_LOADING":
        return {
          ...state,
          loading: payload.value,
        };
      case "SET_ERROR":
        return {
          ...state,
          error: payload.value,
        };
      case "SET_PAGE":
        return {
          ...state,
          page: payload.value,
        };
      case "SET_SEARCH":
        return {
          ...state,
          search: payload.value,
        };
      case "SET_LAST_PAGE":
        return {
          ...state,
          lastPage: payload.value,
        };
      default:
        return state;
    }
  };

  const initialState = {
    [resourceKey]: [],
    loading: false,
    error: null,
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    search: "",
    lastPage: 1,
    ...additionalState,
  };

  return function Provider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const fetched = useRef(false);
    const searchTimeoutRef = useRef(null);

    const fetchData = useCallback(
      async (page = state.page, search = state.search) => {
        if (fetched.current) {
          return;
        }
        fetched.current = true;
        dispatch({ type: "SET_LOADING", value: true });
        dispatch({ type: "SET_ERROR", value: null });

        if (!USE_API) {
          // Use mock data for local development
          setTimeout(() => {
            let filteredData = mockData;

            // Apply search filter if search term is provided
            if (search && search.length >= 2) {
              filteredData = filterMockData(mockData, search);
            }

            // Simulate pagination
            const start = (page - 1) * state.limit;
            const end = start + state.limit;
            const paginatedData = filteredData.slice(start, end);

            dispatch({
              type: SET_ACTION,
              [resourceKey]: paginatedData,
              total: filteredData.length,
            });
            dispatch({ type: "SET_LOADING", value: false });
          }, 500);
          return;
        }

        try {
          const params = {
            page,
            limit: state.limit,
          };

          // Only add keyword param if it's at least 2 characters
          if (search && search.length >= 2) {
            params.keyword = search;
          }

          const data = await apiService.request(endpoint, {
            method: "GET",
            params,
          });

          dispatch({
            type: SET_ACTION,
            [resourceKey]: data,
            total: data.meta?.total || data.total || 0,
          });
        } catch (err) {
          dispatch({ type: "SET_ERROR", value: err.message || "Unknown error" });
        } finally {
          dispatch({ type: "SET_LOADING", value: false });
        }
      },
      // state.page and state.search are intentionally omitted as they're provided as function parameters
      // to avoid unnecessary re-renders. The function always uses the values passed to it.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state.limit, endpoint]
    );

    const setPage = useCallback(
      (page) => {
        dispatch({ type: "SET_PAGE", value: page });
        dispatch({ type: "SET_LAST_PAGE", value: page });
        fetched.current = false;
        fetchData(page, state.search);
      },
      [fetchData, state.search]
    );

    const setSearch = useCallback(
      (search) => {
        dispatch({ type: "SET_SEARCH", value: search });

        // Clear existing timeout
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        // If search is cleared, return to last page
        if (!search || search.length === 0) {
          dispatch({ type: "SET_PAGE", value: state.lastPage });
          fetched.current = false;
          fetchData(state.lastPage, "");
          return;
        }

        // Set new timeout for search (only if at least 2 characters)
        if (search.length >= 2) {
          searchTimeoutRef.current = setTimeout(() => {
            dispatch({ type: "SET_PAGE", value: 1 });
            fetched.current = false;
            fetchData(1, search);
          }, 500);
        }
      },
      [fetchData, state.lastPage]
    );

    const refetch = useCallback(() => {
      fetched.current = false;
      fetchData(state.page, state.search);
    }, [fetchData, state.page, state.search]);

    const value = {
      ...state,
      dispatch,
      [`fetch${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}`]: fetchData,
      setPage,
      setSearch,
      refetch,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };
}
