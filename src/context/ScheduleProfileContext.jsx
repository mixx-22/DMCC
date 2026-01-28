import { useEffect, useCallback, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
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

// Reducer with uniform FETCHING/FETCHED pattern
function scheduleReducer(state, action) {
  switch (action.type) {
    case "FETCHING":
      return { ...state, loading: true, error: null };
    case "FETCHED":
      return {
        ...state,
        loading: false,
        schedule: action.payload,
        error: null,
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const ScheduleProfileProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(scheduleReducer, {
    schedule: null,
    loading: false,
    error: null,
  });
  const fetchedRef = useRef(false);

  const fetchSchedule = useCallback(async (scheduleId) => {
    if (!scheduleId || scheduleId === "new") {
      return;
    }

    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "FETCHED", payload: MOCK_SCHEDULE });
      return;
    }

    try {
      const response = await apiService.request(
        `${SCHEDULES_ENDPOINT}/${scheduleId}`,
        { method: "GET" },
      );
      console.log({ response });
      dispatch({ type: "FETCHED", payload: response.data });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Load Schedule", {
        description: error.message || "Could not load schedule details",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newSchedule = {
        ...scheduleData,
        _id: `schedule-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "FETCHED", payload: newSchedule });
      toast.success("Schedule Created", {
        description: `"${scheduleData.title}" has been successfully created`,
        duration: 3000,
      });
      return newSchedule;
    }

    try {
      const schedule = await apiService.request(SCHEDULES_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(scheduleData),
      });
      dispatch({ type: "FETCHED", payload: schedule });
      toast.success("Schedule Created", {
        description: `"${scheduleData.title}" has been successfully created`,
        duration: 3000,
      });
      return schedule;
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Create Schedule", {
        description: error.message || "An error occurred. Please try again.",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (scheduleId, scheduleData) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updatedSchedule = {
        ...state.schedule,
        ...scheduleData,
        _id: scheduleId,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "FETCHED", payload: updatedSchedule });
      toast.success("Schedule Updated", {
        description: "Schedule has been successfully updated",
        duration: 2000,
      });
      return updatedSchedule;
    }

    try {
      const response = await apiService.request(
        `${SCHEDULES_ENDPOINT}/${scheduleId}`,
        { method: "PUT", body: JSON.stringify(scheduleData) },
      );
      const { success = false } = response;
      if (success) {
        const updatedSchedule = { 
          ...state.schedule, 
          ...scheduleData, 
          updatedAt: new Date().toISOString() 
        };
        dispatch({ type: "FETCHED", payload: updatedSchedule });
        toast.success("Schedule Updated", {
          description: "Schedule has been successfully updated",
          duration: 2000,
        });
        return updatedSchedule;
      }
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Update Failed", {
        description: error.message || "Failed to update schedule",
        duration: 3000,
      });
      throw error;
    }
  }, [state.schedule]);

  const deleteSchedule = useCallback(async (scheduleId, scheduleTitle) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "FETCHED", payload: null });
      toast.success("Schedule Deleted", {
        description: scheduleTitle 
          ? `"${scheduleTitle}" has been deleted`
          : "Schedule has been deleted",
        duration: 3000,
      });
      return;
    }

    try {
      await apiService.request(`${SCHEDULES_ENDPOINT}/${scheduleId}`, {
        method: "DELETE",
      });
      dispatch({ type: "FETCHED", payload: null });
      toast.success("Schedule Deleted", {
        description: scheduleTitle 
          ? `"${scheduleTitle}" has been deleted`
          : "Schedule has been deleted",
        duration: 3000,
      });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete schedule",
        duration: 3000,
      });
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
