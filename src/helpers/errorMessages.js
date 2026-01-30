// helpers/errorMessages.js or constants/errorMessages.js

export const ERROR_MESSAGES = {
  // Area Error Messages
  AREA: {
    BRANCH_REQUIRED: "Branch is required",
    LINE_REQUIRED: "Line is required",
    AREA_NAME_REQUIRED: "Area Name is required",
    CREATE_FAILED: "The area is not created. Please try again",
    UPDATE_FAILED: "The area is not updated. Please try again",
    OPERATION_FAILED: "The area is not created.",
  },

  // Branch Error Messages
  BRANCH: {
    BRANCH_NAME_REQUIRED: "Please enter branch name",
    BRANCH_ADDRESS_REQUIRED: "Please enter branch address",
    AGREEMENT_CERTIFICATE_REQUIRED: "Agreement certificate is required",
    AGREEMENT_DESCRIPTION_REQUIRED: "Description is required",
    FILE_REQUIRED: "File required",
    FILE_DESCRIPTION_REQUIRED: "Description required",
    UPLOAD_FAILED: "upload failed",
    OPERATION_FAILED: "Operation Failed",
  },

  // Investment Error Messages
  INVESTMENT: {
    TITLE_REQUIRED: "Please enter an investment title",
    TITLE_PATTERN: "Investment title must start with an alphabet and can only contain alphanumeric characters, '-' or '_'",
    USER_REQUIRED: "Please select a user",
    BRANCH_REQUIRED: "Please select a branch",
    LINE_REQUIRED: "Please select a line",
    AMOUNT_REQUIRED: "Please enter an amount",
    AMOUNT_MIN: "Amount must be greater than 0",
    PAYMENT_MODE_REQUIRED: "Please select a payment mode",
    DATE_REQUIRED: "Please select a date",
    ADD_FAILED: "Failed to add investment",
    UPDATE_FAILED: "Failed to update investment",
    OPERATION_ERROR: "An error occurred",
  },

  // Line Error Messages
  LINE: {
    BRANCH_REQUIRED: "Branch is required",
    LINE_NAME_REQUIRED: "Line Name is required",
    LINE_TYPE_REQUIRED: "Line Type is required",
    INSTALLMENT_REQUIRED: "Installment is required",
    BAD_INSTALLMENT_REQUIRED: "No of bad installments is required",
    CREATE_FAILED: "Line is not created. Please try again",
    UPDATE_FAILED: "Line is not updated. Please try again",
    OPERATION_FAILED: "The line is not created.",
  },

  // Reset Password Error Messages
  RESET_PASSWORD: {
    BRANCH_REQUIRED: "Please select a branch",
    LINE_REQUIRED: "Please select a line",
    USER_REQUIRED: "Please select a user",
    USER_INVALID: "Please select a valid user",
    PASSWORD_REQUIRED: "Please enter a new password",
    PASSWORD_MIN_LENGTH: "Password must be at least 4 characters",
    CONFIRM_PASSWORD_REQUIRED: "Please confirm your password",
    PASSWORDS_NOT_MATCH: "Passwords do not match",
    RESET_FAILED: "Failed to reset password. Please try again.",
    FETCH_USERS_FAILED: "Failed to fetch users data",
  },

  // User Error Messages
  USER: {
    FULL_NAME_REQUIRED: "Please enter the full name",
    USERNAME_REQUIRED: "Please enter the user name",
    PASSWORD_REQUIRED: "Please enter the password",
    CONFIRM_PASSWORD_REQUIRED: "Please confirm the password",
    PASSWORDS_NOT_MATCH: "Passwords do not match!",
    MOBILE_REQUIRED: "Please enter the mobile number",
    MOBILE_PATTERN: "Mobile number must be 10 digits!",
    EMAIL_INVALID: "Please enter a valid email",
    PINCODE_PATTERN: "Pincode must be 6 digits!",
    ROLE_REQUIRED: "Please select a role",
    BASE_BRANCH_REQUIRED: "Please select a base branch",
    BASE_LINE_REQUIRED: "Please select a base line",
    BRANCH_REQUIRED: "Please select a branch",
    LINE_REQUIRED: "Please select a line",
    EXPENSE_MAPPING_INCOMPLETE: "Please complete all expense mappings with both line and expenses",
    EXPENSE_MAPPING_REQUIRED: "At least one expense mapping is required",
    FETCH_FAILED: "Failed to load user data",
    FETCH_EXPENSES_FAILED: "Failed to fetch expenses",
    FETCH_EXPENSES_ERROR: "Error fetching expenses",
    FETCH_AREA_FAILED: "Failed to load area data",
    CREATE_FAILED: "Failed to add/update user",
    UPDATE_FAILED: "User not created",
    ADD_FAILED: "Failed to add/update user",
    SELECT_BASE_BRANCH_FIRST: "Select base branch first",
    SELECT_BRANCHES_FIRST: "Select branches first",
    UNSAVED_CHANGES: "You have unsaved changes. Are you sure you want to leave?",
  },

  // Customer Error Messages
  CUSTOMER: {
    NAME_REQUIRED: "Please enter customer name",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    MOBILE_REQUIRED: "Please enter mobile number",
    MOBILE_PATTERN: "Mobile number must be 10 digits",
    ALTERNATE_MOBILE_PATTERN: "Alternate mobile number must be 10 digits",
    EMAIL_REQUIRED: "Please enter email",
    EMAIL_INVALID: "Please enter valid email",
    PROFESSION_REQUIRED: "Please enter profession",
    AADHAAR_REQUIRED: "Please enter Aadhaar ID",
    AADHAAR_PATTERN: "Aadhaar ID must be 12 digits",
    PAN_REQUIRED: "Please enter PAN number",
    ADDRESS_REQUIRED: "Please enter address",
    BRANCH_REQUIRED: "Please select branch",
    LINE_REQUIRED: "Please select line",
    AREA_REQUIRED: "Please select area",
    LOCATION_REQUIRED: "Please select location",
    REFERENCE_MOBILE_PATTERN: "Mobile number must be 10 digits",
    FETCH_FAILED: "Failed to fetch customer details",
    FETCH_AREA_FAILED: "Failed to fetch area details",
    CREATE_FAILED: "Failed to create customer",
    UPDATE_FAILED: "Failed to update customer",
    DELETE_FAILED: "Failed to delete customer",
    VALIDATION_ERROR: "Validation Error",
    LOCATION_ERROR: "Unable to get current location",
    LOCATION_NOT_SUPPORTED: "Geolocation is not supported by your browser",
    SELECT_LOCATION: "Please select a location on the map",
    COMPLETE_PERSONAL_INFO: "Please submit the personal information form before uploading documents.",
    CANCEL_CONFIRM: "Are you sure you want to cancel? All unsaved changes will be lost.",
  },

  // Customer Document Error Messages
  CUSTOMER_DOCUMENT: {
    CUSTOMER_ID_MISSING: "Customer ID is missing. Please complete personal information first.",
    FILE_SELECT_REQUIRED: "Please select a file first",
    FILE_INVALID: "Invalid file object. Please select the file again.",
    UPLOAD_FAILED: "Failed to upload document",
    FETCH_FAILED: "Failed to fetch existing documents",
    DELETE_FAILED: "Failed to delete the document",
    DELETE_ERROR: "An error occurred during deletion",
    PREVIEW_ERROR: "Failed to load image",
    DOCUMENT_URL_NOT_FOUND: "Document URL not found or invalid",
    DOCUMENT_URL_UNAVAILABLE: "Document URL not available. Please contact support.",
    DELETE_CONFIRM_TITLE: "Confirm Delete",
  },

  // Common Error Messages
  COMMON: {
    FIELD_REQUIRED: "This field is required!",
    OPERATION_FAILED: "Operation failed. Please try again",
    NETWORK_ERROR: "Network error. Please check your connection",
    UNAUTHORIZED: "You are not authorized to perform this action",
    SERVER_ERROR: "Server error. Please try again later",
    UNKNOWN_ERROR: "Unknown error",
    ERROR: "Error",
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Area Success Messages
  AREA: {
    CREATED: "The area has been created successfully.",
    UPDATED: "The area has been updated successfully.",
    DELETED: "The area has been deleted successfully.",
  },

  // Branch Success Messages
  BRANCH: {
    CREATED: "Branch added successfully",
    UPDATED: "Branch updated successfully",
    DELETED: "Branch deleted successfully",
    FILE_UPLOADED: "uploaded successfully",
  },

  // Investment Success Messages
  INVESTMENT: {
    CREATED: "Investment details has been added successfully",
    UPDATED: "Investment details has been updated successfully",
    DELETED: "Investment has been deleted successfully",
  },

  // Line Success Messages
  LINE: {
    CREATED: "The line has been created successfully.",
    UPDATED: "The line has been updated successfully.",
    DELETED: "The line has been deleted successfully.",
  },

  // Reset Password Success Messages
  RESET_PASSWORD: {
    SUCCESS: "Password reset successfully!",
  },

  // User Success Messages
  USER: {
    CREATED: "User added successfully",
    UPDATED: "User updated successfully",
    DELETED: "User has been deleted successfully",
    FORM_RESET: "Form has been reset successfully",
  },

  // Customer Success Messages
  CUSTOMER: {
    CREATED: "Customer added successfully. You can now upload documents.",
    UPDATED: "Customer details updated successfully. You can now manage documents.",
    DELETED: "Customer has been deleted successfully",
    LOCATION_SELECTED: "Location selected successfully",
  },

  // Customer Document Success Messages
  CUSTOMER_DOCUMENT: {
    UPLOADED: "document uploaded successfully",
    DELETED: "deleted successfully.",
    FILE_SELECTED: "selected successfully",
    FILE_CLEARED: "File selection cleared.",
  },

  // Common Success Messages
  COMMON: {
    OPERATION_SUCCESS: "Operation completed successfully",
    SAVE_SUCCESS: "Data saved successfully",
    DELETE_SUCCESS: "Data deleted successfully",
  },
};

// Notification Titles
export const NOTIFICATION_TITLES = {
  AREA: "Area",
  BRANCH: "Branch",
  INVESTMENT: "Investment",
  LINE: "Line",
  RESET_PASSWORD: "Reset Password",
  USER: "User",
  CUSTOMER: "Customer",
  CUSTOMER_DOCUMENT: "Customer Document",
  SUCCESS: "Success",
  ERROR: "Error",
  WARNING: "Warning",
  INFO: "Information",
  COMPLETE_PERSONAL_INFO: "Complete Personal Information",
  CUSTOMER_DELETED: "Customer Deleted",
  DELETED: "Deleted",
  UPLOAD_FAILED: "Upload Failed",
  DELETION_FAILED: "Deletion Failed",
  VALIDATION_ERROR: "Validation Error",
};

// File Upload Messages
export const FILE_MESSAGES = {
  UPLOAD_SUCCESS: "uploaded successfully",
  UPLOAD_FAILED: "upload failed",
  REMOVE_SUCCESS: "File removed successfully",
  INVALID_FORMAT: "Invalid file format",
  SIZE_EXCEEDED: "File size exceeds limit",
};

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TITLES,
  FILE_MESSAGES,
};