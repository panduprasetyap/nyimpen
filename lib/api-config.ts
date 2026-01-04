export const REST_SERVER_URL =
  process.env.NEXT_PUBLIC_REST_SERVER_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  LOGIN: `${REST_SERVER_URL}/api/login`,
  REGISTER: `${REST_SERVER_URL}/api/register`,
  UPDATE_PROFILE: `${REST_SERVER_URL}/api/user`,
  CATEGORIES: `${REST_SERVER_URL}/api/categories`,
  PROFILE: `${REST_SERVER_URL}/api/profile`,
  UPLOAD_PROFILE_PICTURE: `${REST_SERVER_URL}/api/profile/upload`,
  CHANGE_PASSWORD: `${REST_SERVER_URL}/api/profile/change-password`,
  WALLET: `${REST_SERVER_URL}/api/wallets`,
  TRANSACTIONS: `${REST_SERVER_URL}/api/transactions`,
  CREATE_TRANSACTION: `${REST_SERVER_URL}/api/transactions/add`,
  DASHBOARD: `${REST_SERVER_URL}/api/transactions/dashboard`,
  WALLET_CATEGORY: `${REST_SERVER_URL}/api/wallet-data`,
  TRANSFER: `${REST_SERVER_URL}/api/wallets/transfer`,
};
