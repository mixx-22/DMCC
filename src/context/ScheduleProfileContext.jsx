import { useEffect, useCallback, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import { ScheduleProfileContext } from "./_contexts";

const SCHEDULES_ENDPOINT = "/schedules";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock schedule for development
const MOCK_SCHEDULE = {
  _id: "schedule-mock-1",
  title: "Annual Financial Audit 2024",
  description: "Comprehensive audit of financial statements and controls",
  auditCode: "AUD-2024-001",
  auditType: "financial",
  standard: "ISO 9001",
  status: 0,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
};

// Initial data structure for a new schedule
const initialScheduleData = {
  title: "",
  description: "",
  auditCode: "",
  auditType: "",
  standard: "",
  status: 0,
};

// Action types
const ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SAVE_START: "SAVE_START",
  SAVE_SUCCESS: "SAVE_SUCCESS",
  SAVE_ERROR: "SAVE_ERROR",
};

// Reducer
function scheduleReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        schedule: action.payload,
        error: null,
      };
    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTIONS.SAVE_START:
      return { ...state, saving: true, error: null };
    case ACTIONS.SAVE_SUCCESS:
      return { ...state, saving: false, schedule: action.payload, error: null };
    case ACTIONS.SAVE_ERROR:
      return { ...state, saving: false, error: action.payload };
    default:
      return state;
  }
}

export const ScheduleProfileProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(scheduleReducer, {
    schedule: null,
    loading: false,
    saving: false,
    error: null,
  });
  const fetchedRef = useRef(false);

  const fetchSchedule = useCallback(async (scheduleId) => {
    if (!scheduleId || scheduleId === "new") {
      return;
    }

    dispatch({ type: ACTIONS.FETCH_START });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: MOCK_SCHEDULE });
      return;
    }

    try {
      const schedule = await apiService.request(
        `${SCHEDULES_ENDPOINT}/${scheduleId}`,
        { method: "GET" },
      );
      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: schedule });
    } catch (error) {
      dispatch({ type: ACTIONS.FETCH_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData) => {
    dispatch({ type: ACTIONS.SAVE_START });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newSchedule = {
        ...scheduleData,
        _id: `schedule-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: newSchedule });
      return newSchedule;
    }

    try {
      const schedule = await apiService.request(SCHEDULES_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(scheduleData),
      });
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: schedule });
      return schedule;
    } catch (error) {
      dispatch({ type: ACTIONS.SAVE_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (scheduleId, scheduleData) => {
    dispatch({ type: ACTIONS.SAVE_START });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updatedSchedule = {
        ...scheduleData,
        _id: scheduleId,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: updatedSchedule });
      return updatedSchedule;
    }

    try {
      const schedule = await apiService.request(
        `${SCHEDULES_ENDPOINT}/${scheduleId}`,
        { method: "PUT", body: JSON.stringify(scheduleData) },
      );
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: schedule });
      return schedule;
    } catch (error) {
      dispatch({ type: ACTIONS.SAVE_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  const deleteSchedule = useCallback(async (scheduleId) => {
    dispatch({ type: ACTIONS.SAVE_START });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: null });
      return;
    }

    try {
      await apiService.delete(`${SCHEDULES_ENDPOINT}/${scheduleId}`);
      dispatch({ type: ACTIONS.SAVE_SUCCESS, payload: null });
    } catch (error) {
      dispatch({ type: ACTIONS.SAVE_ERROR, payload: error.message });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (id && id !== "new" && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSchedule(id);
    }
  }, [id, fetchSchedule]);

  const value = {
    schedule: state.schedule,
    initialScheduleData,
    loading: state.loading,
    saving: state.saving,
    error: state.error,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };

  return (
    <ScheduleProfileContext.Provider value={value}>
      {children}
    </ScheduleProfileContext.Provider>
  );
};
