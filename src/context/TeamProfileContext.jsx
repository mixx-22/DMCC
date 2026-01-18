import { useEffect, useCallback, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import { TeamProfileContext } from "./_contexts";

const TEAMS_ENDPOINT = "/teams";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock team for development
const MOCK_TEAM = {
  _id: "team-mock-1",
  name: "Engineering Team",
  description: "Core engineering team responsible for product development",
  leaders: [
    {
      _id: "user-1",
      id: "user-1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      employeeId: "EMP001",
    },
  ],
  members: [
    {
      _id: "user-2",
      id: "user-2",
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      employeeId: "EMP002",
    },
    {
      _id: "user-3",
      id: "user-3",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice@example.com",
      employeeId: "EMP003",
    },
  ],
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

// Helper to normalize users - ensures consistent format
const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return [];

  return users.map((user) => ({
    id: user.id || user._id,
    _id: user._id || user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    employeeId: user.employeeId || "",
  }));
};

// Helper to extract only user IDs for API submission
const extractUserIds = (users) => {
  if (!Array.isArray(users)) return [];

  return users.map((user) => user.id || user._id);
};

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_TEAM":
      return {
        ...state,
        team: payload.team,
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
    case "SET_SAVING":
      return {
        ...state,
        saving: payload.value,
      };
    default:
      return state;
  }
};

const initialTeamData = {
  title: "",
  description: "",
  leaders: [],
  members: [],
  createdAt: null,
  updatedAt: null,
};

const initialState = {
  team: initialTeamData,
  loading: false,
  error: null,
  saving: false,
};

export const TeamProfileProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetched = useRef(null);

  const fetchTeam = useCallback(async (teamId) => {
    if (fetched.current === teamId) {
      return; // Already fetched this team
    }
    fetched.current = teamId;
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({
          type: "SET_TEAM",
          team: { ...MOCK_TEAM, _id: teamId },
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }

    try {
      const data = await apiService.request(`${TEAMS_ENDPOINT}/${teamId}`, {
        method: "GET",
      });

      const fetchedTeam = data.team || data;
      if (fetchedTeam.leaders) {
        fetchedTeam.leaders = normalizeUsers(fetchedTeam.leaders);
      }
      if (fetchedTeam.members) {
        fetchedTeam.members = normalizeUsers(fetchedTeam.members);
      }

      dispatch({
        type: "SET_TEAM",
        team: fetchedTeam?.data || fetchedTeam,
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to fetch team",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const updateTeam = useCallback(
    async (teamId, updates) => {
      dispatch({ type: "SET_SAVING", value: true });
      dispatch({ type: "SET_ERROR", value: null });

      const payload = { ...updates };
      if (payload.leaders) {
        payload.leaders = extractUserIds(payload.leaders);
      }
      if (payload.members) {
        payload.members = extractUserIds(payload.members);
      }

      if (!USE_API) {
        setTimeout(() => {
          const updatedTeam = { ...state.team, ...updates };
          if (updatedTeam.leaders) {
            updatedTeam.leaders = normalizeUsers(updatedTeam.leaders);
          }
          if (updatedTeam.members) {
            updatedTeam.members = normalizeUsers(updatedTeam.members);
          }
          dispatch({
            type: "SET_TEAM",
            team: updatedTeam,
          });
          dispatch({ type: "SET_SAVING", value: false });
        }, 500);
        return { success: true };
      }

      try {
        const data = await apiService.request(`${TEAMS_ENDPOINT}/${teamId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        let success = false;
        if (data.team || data.data) {
          success = true;
          const updatedTeam = {
            ...state.team,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          dispatch({
            type: "SET_TEAM",
            team: updatedTeam,
          });
        }
        dispatch({ type: "SET_SAVING", value: false });
        return { success };
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          value: err.message || "Failed to update team",
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: false, error: err.message };
      }
    },
    [state.team],
  );

  const createTeam = useCallback(async (teamData) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    const payload = { ...teamData };
    if (payload.leaders) {
      payload.leaders = extractUserIds(payload.leaders);
    }
    if (payload.members) {
      payload.members = extractUserIds(payload.members);
    }

    if (!USE_API) {
      const newId = `team-${Date.now()}`;
      setTimeout(() => {
        const newTeam = {
          ...teamData,
          _id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (newTeam.leaders) {
          newTeam.leaders = normalizeUsers(newTeam.leaders);
        }
        if (newTeam.members) {
          newTeam.members = normalizeUsers(newTeam.members);
        }
        dispatch({
          type: "SET_TEAM",
          team: newTeam,
        });
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true, id: newId };
    }

    try {
      const data = await apiService.request(TEAMS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newTeam = data.data || data.team || data;
      if (newTeam.leaders) {
        newTeam.leaders = normalizeUsers(newTeam.leaders);
      }
      if (newTeam.members) {
        newTeam.members = normalizeUsers(newTeam.members);
      }

      dispatch({
        type: "SET_TEAM",
        team: newTeam,
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: true, id: newTeam._id || newTeam.id };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to create team",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true };
    }

    try {
      await apiService.request(`${TEAMS_ENDPOINT}/${teamId}`, {
        method: "DELETE",
      });

      dispatch({ type: "SET_SAVING", value: false });
      return { success: true };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to delete team",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (id && id !== "new") {
      fetchTeam(id);
    }
  }, [id, fetchTeam]);

  return (
    <TeamProfileContext.Provider
      value={{
        ...state,
        dispatch,
        fetchTeam,
        updateTeam,
        createTeam,
        deleteTeam,
        initialTeamData,
        normalizeUsers,
        extractUserIds,
      }}
    >
      {children}
    </TeamProfileContext.Provider>
  );
};
