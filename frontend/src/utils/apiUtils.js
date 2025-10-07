/**
 * API Response Handler Utilities
 * Handles simplified backend responses
 */

/**
 * Parses API response data with simplified format
 * @param {Object} responseData - Response data from API
 * @param {string} dataKey - Key to extract from data (optional)
 * @returns {any} Parsed data
 */
export const parseApiResponse = (responseData, dataKey = null) => {
  // Handle simplified response format
  if (responseData.success === true && responseData.data) {
    if (dataKey) {
      return responseData.data[dataKey];
    }
    return responseData.data;
  }

  // Fallback for legacy format
  if (dataKey) {
    return responseData[dataKey];
  }

  return responseData;
};

/**
 * Extracts success message from API response
 * @param {Object} responseData - Response data from API
 * @param {string} defaultMessage - Default message if none found
 * @returns {string} Success message
 */
export const parseSuccessMessage = (
  responseData,
  defaultMessage = "Operation completed successfully"
) => {
  if (responseData.success === true && responseData.data) {
    return typeof responseData.data === "string"
      ? responseData.data
      : defaultMessage;
  }
  return responseData.message || defaultMessage;
};

/**
 * Parses error message from API error response
 * @param {Object} errorData - Error response data
 * @param {string} defaultMessage - Default error message
 * @returns {string} Error message
 */
export const parseErrorMessage = (
  errorData,
  defaultMessage = "Operation failed"
) => {
  if (errorData.success === false && errorData.data) {
    return errorData.data;
  }
  return errorData.message || defaultMessage;
};

/**
 * Handles API response with simplified error and success parsing
 * @param {Response} response - Fetch response object
 * @param {string} defaultErrorMessage - Default error message
 * @param {string} dataKey - Key to extract from response data (optional)
 * @returns {Promise<Object>} Parsed response with data and message
 */
export const handleApiResponse = async (
  response,
  defaultErrorMessage = "Request failed",
  dataKey = null
) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(parseErrorMessage(errorData, defaultErrorMessage));
  }

  const data = await response.json();

  return {
    data: parseApiResponse(data, dataKey),
    message: parseSuccessMessage(data),
    raw: data, // Keep raw response for advanced use cases
  };
};

/**
 * Creates a standardized API request with error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} defaultErrorMessage - Default error message
 * @param {string} dataKey - Key to extract from response data (optional)
 * @returns {Promise<Object>} Parsed response
 */
export const apiRequest = async (
  url,
  options = {},
  defaultErrorMessage = "Request failed",
  dataKey = null
) => {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response, defaultErrorMessage, dataKey);
  } catch (error) {
    // Re-throw with context if it's not already an Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`${defaultErrorMessage}: ${error.message || error}`);
  }
};

/**
 * Handles blob responses (for file downloads)
 * @param {Response} response - Fetch response object
 * @param {string} defaultErrorMessage - Default error message
 * @returns {Promise<Blob>} Blob data
 */
export const handleBlobResponse = async (
  response,
  defaultErrorMessage = "Download failed"
) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(parseErrorMessage(errorData, defaultErrorMessage));
  }

  return await response.blob();
};
