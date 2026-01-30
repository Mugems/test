
//REGISTER
export const SETTINGS = "/api/organization/";
export const ADD_BRANCH="/api/branch/";
export const LINE="/api/line/";
export const BRANCH_FILE="/api/branch/file/";
export const SEARCH="/api/search/";
export const COLUMNCHANGE = "/api/user-preferences/save-selected-columns/";
export const SELECTEDCOLUMN = "/api/user-preferences/get-selected-columns/";

// Expense Types
export const EXPENSE_TYPES = "/api/expensetypes/";
export const EXPENSE_TYPE_DETAIL = (id) => `/api/expensetypes/${id}/`;

export const AREA = "/api/area/";
export const EXPANSE_AUTOCOMPLETE="/api/expensetypes/autocomplete/";

// Investment
export const INVESTMENT = "/api/investments/";

// Expense Transactions
export const EXPENSE_TRANSACTION = "/api/expense_transaction/";

// Disburse Loan
export const DISBURSE_LOAN = "/api/disburse_loan/";

//users
export const USERS="/api/users/"

//customers
export const CUSTOMERS="/api/customers/"

//LOGIN
export const LOGIN_URL = "api/api-token-auth/";
export const TOKEN_REFRSH_URL = "api-token-refresh/";
export const TOKEN_VERIFY_URL = "api-token-verify/";
export const PASSWORD_RESET_URL = "api-password-reset/";
export const PASSWORD_VRIFY_URL = "api-password-reset-verify/";
export const PASSWORD_CONFIRM_URL = "api-password-reset-confirm/";
export const PASSWORD_CHANGE_URL = "api-password-change/"
