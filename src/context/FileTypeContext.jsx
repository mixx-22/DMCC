import { useEffect, useCallback, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import apiService from "../services/api";
import { FileTypeContext } from "./_contexts";

const FILE_TYPES_ENDPOINT = "/file-types";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock file type for development
const MOCK_FILE_TYPE = {
  _id: "1",
  name: "Quality Manual",
  isQualityDocument: true,
  requiresApproval: true,
  trackVersioning: true,
  isDefault: false,
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
};

const reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "SET_FILE_TYPE":
      return {
        ...state,
        fileType: payload.fileType,
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

const initialState = {
  fileType: null,
  loading: false,
  error: null,
  saving: false,
};

export const FileTypeProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetched = useRef(null);

  const fetchFileType = useCallback(async (fileTypeId) => {
    if (fetched.current === fileTypeId) {
      return; // Already fetched this file type
    }
    fetched.current = fileTypeId;
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      // Mock API call
      setTimeout(() => {
        dispatch({
          type: "SET_FILE_TYPE",
          fileType: { ...MOCK_FILE_TYPE, _id: fileTypeId },
        });
        dispatch({ type: "SET_LOADING", value: false });
      }, 500);
      return;
    }

    try {
      const data = await apiService.request(
        `${FILE_TYPES_ENDPOINT}/${fileTypeId}`,
        {
          method: "GET",
        },
      );

      dispatch({
        type: "SET_FILE_TYPE",
        fileType: data.data || data,
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to fetch file type",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  }, []);

  const updateFileType = useCallback(
    async (fileTypeId, updates) => {
      dispatch({ type: "SET_SAVING", value: true });
      dispatch({ type: "SET_ERROR", value: null });

      if (!USE_API) {
        // Mock API call
        setTimeout(() => {
          dispatch({
            type: "SET_FILE_TYPE",
            fileType: { ...state.fileType, ...updates },
          });
          dispatch({ type: "SET_SAVING", value: false });
        }, 500);
        return { success: true };
      }

      try {
        const response = await apiService.request(
          `${FILE_TYPES_ENDPOINT}/${fileTypeId}`,
          {
            method: "PUT",
            body: JSON.stringify(updates),
          },
        );

        dispatch({
          type: "SET_FILE_TYPE",
          fileType: response.fileType || response.data || {},
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: true };
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          value: err.message || "Failed to update file type",
        });
        dispatch({ type: "SET_SAVING", value: false });
        return { success: false, error: err.message };
      }
    },
    [state.fileType],
  );

  const createFileType = useCallback(async (fileTypeData) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      // Mock API call
      const newId = `file-type-${Date.now()}`;
      setTimeout(() => {
        dispatch({
          type: "SET_FILE_TYPE",
          fileType: {
            ...fileTypeData,
            _id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true, id: newId };
    }

    try {
      const data = await apiService.request(FILE_TYPES_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(fileTypeData),
      });

      const newFileType = data.fileType || data.data || data;
      dispatch({
        type: "SET_FILE_TYPE",
        fileType: {
          ...newFileType,
          createdAt: newFileType.createdAt || new Date().toISOString(),
          updatedAt: newFileType.updatedAt || new Date().toISOString(),
        },
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: true, id: newFileType._id || newFileType.id };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to create file type",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  const deleteFileType = useCallback(async (fileTypeId) => {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", value: null });

    if (!USE_API) {
      setTimeout(() => {
        dispatch({ type: "SET_SAVING", value: false });
      }, 500);
      return { success: true };
    }

    try {
      await apiService.request(`${FILE_TYPES_ENDPOINT}/${fileTypeId}`, {
        method: "DELETE",
      });

      dispatch({ type: "SET_SAVING", value: false });
      return { success: true };
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Failed to delete file type",
      });
      dispatch({ type: "SET_SAVING", value: false });
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (id && id !== "new") {
      fetchFileType(id);
    }
  }, [id, fetchFileType]);

  return (
    <FileTypeContext.Provider
      value={{
        ...state,
        dispatch,
        fetchFileType,
        updateFileType,
        createFileType,
        deleteFileType,
      }}
    >
      {children}
    </FileTypeContext.Provider>
  );
};
