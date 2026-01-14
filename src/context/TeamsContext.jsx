import { useEffect, useCallback, useReducer, useRef } from "react";
import { TeamsContext } from "./_contexts";
import apiService from "../services/api";

const TEAMS_ENDPOINT = "/teams";
const USE_API = import.meta.env.VITE_USE_API !== "false";
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LIMIT) || 10;

// Example mock data for local development
const MOCK_TEAMS = [
  {
    _id: "team-1",
    name: "Engineering Team",
    description: "Core engineering team responsible for product development",
    leaders: [
      {
        _id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        employeeId: "EMP001",
      },
    ],
    members: [
      {
        _id: "user-2",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        employeeId: "EMP002",
      },
      {
        _id: "user-3",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        employeeId: "EMP003",
      },
    ],
  },
  {
    _id: "team-2",
    name: "Design Team",
    description: "Product design and UX team",
    leaders: [
      {
        _id: "user-4",
        firstName: "Bob",
        lastName: "Williams",
        email: "bob@example.com",
        employeeId: "EMP004",
      },
    ],
    members: [
      {
        _id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        employeeId: "EMP001",
      },
    ],
  },
];

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_TEAMS":
      return {
        ...state,
        teams: payload.teams,
        total: payload.total !== undefined ? payload.total : state.total,
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
  teams: [],
  loading: false,
  error: null,
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  search: "",
  lastPage: 1,
};

export const TeamsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const searchTimeoutRef = useRef(null);

  const fetchTeams = useCallback(
    async (page = state.page, search = state.search) => {
      dispatch({ type: "SET_LOADING", value: true });
      dispatch({ type: "SET_ERROR", value: null });

      if (!USE_API) {
        // Use mock data for local development
        setTimeout(() => {
          let filteredTeams = MOCK_TEAMS;

          // Apply search filter if search term is provided
          if (search && search.length >= 2) {
            const searchLower = search.toLowerCase();
            filteredTeams = MOCK_TEAMS.filter((team) => {
              const name = (team.name || "").toLowerCase();
              const description = (team.description || "").toLowerCase();
              return (
                name.includes(searchLower) || description.includes(searchLower)
              );
            });
          }

          // Simulate pagination
          const start = (page - 1) * state.limit;
          const end = start + state.limit;
          const paginatedTeams = filteredTeams.slice(start, end);

          dispatch({
            type: "SET_TEAMS",
            teams: { data: paginatedTeams },
            total: filteredTeams.length,
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

        const data = await apiService.request(TEAMS_ENDPOINT, {
          method: "GET",
          params,
        });

        dispatch({
          type: "SET_TEAMS",
          teams: data,
          total: data.meta?.total || data.total || 0,
        });
      } catch (err) {
        dispatch({ type: "SET_ERROR", value: err.message || "Unknown error" });
      } finally {
        dispatch({ type: "SET_LOADING", value: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [state.limit]
  );

  const setPage = useCallback(
    (page) => {
      dispatch({ type: "SET_PAGE", value: page });
      dispatch({ type: "SET_LAST_PAGE", value: page });
      fetchTeams(page, state.search);
    },
    [fetchTeams, state.search]
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
        fetchTeams(state.lastPage, "");
        return;
      }

      // Only search if at least 2 characters
      if (search.length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          dispatch({ type: "SET_PAGE", value: 1 }); // Reset to page 1 on search
          fetchTeams(1, search);
        }, 500); // 500ms debounce
      }
    },
    [fetchTeams, state.lastPage]
  );

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <TeamsContext.Provider
      value={{
        ...state,
        dispatch,
        fetchTeams,
        setPage,
        setSearch,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
