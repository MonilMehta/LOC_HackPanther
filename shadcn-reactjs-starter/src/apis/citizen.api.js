import SERVER_API from "./server.api.js";

export const register = `${SERVER_API}/citizens/register`;
export const loginCitizen = `${SERVER_API}/citizens/login`;
export const verifyCitizen = `${SERVER_API}/citizens/verify-citizen`;
export const logout = `${SERVER_API}/citizens/logout`;
export const refreshToken = `${SERVER_API}/citizens/refresh-token`;
export const changePassword = `${SERVER_API}/citizens/change-password`;
export const currentUser = `${SERVER_API}/citizens/current-user`;
export const updateDetails = `${SERVER_API}/citizens/update-details`;