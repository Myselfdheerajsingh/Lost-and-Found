import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Items
export const getItems = (params) => axios.get(`${BASE}/items`, { params });
export const getItem = (id) => axios.get(`${BASE}/items/${id}`);
export const createItem = (formData) => axios.post(`${BASE}/items`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateItem = (id, data) => axios.put(`${BASE}/items/${id}`, data);
export const resolveItem = (id) => axios.patch(`${BASE}/items/${id}/resolve`);
export const deleteItem = (id) => axios.delete(`${BASE}/items/${id}`);
export const getUserItems = (userId) => axios.get(`${BASE}/items/user/${userId}`);

// Messages
export const getConversations = () => axios.get(`${BASE}/messages/conversations`);
export const getMessages = (convId) => axios.get(`${BASE}/messages/${convId}`);
export const sendMessage = (data) => axios.post(`${BASE}/messages`, data);

// Users
export const getUser = (id) => axios.get(`${BASE}/users/${id}`);
export const updateProfile = (data) => axios.put(`${BASE}/users/profile`, data);
export const uploadAvatar = (formData) => axios.put(`${BASE}/users/avatar`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
