import SERVER_API from "./server.api.js";

export const register = `${SERVER_API}/users/register`;
export const loginUser = `${SERVER_API}/users/login`;
export const logout = `${SERVER_API}/users/logout`;
export const refreshToken = `${SERVER_API}/users/refresh-token`;
export const changePassword = `${SERVER_API}/users/change-password`;
export const currentUser = `${SERVER_API}/users/current-user`;
export const updateDetails = `${SERVER_API}/users/update-details`;
export const getUsers = `${SERVER_API}/users/get-users`;