import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const eyeTrackingApi = {
  async startTracking() {
    const response = await axios.post(`${API_BASE_URL}/start`);
    return response.data;
  },

  async stopTracking() {
    const response = await axios.post(`${API_BASE_URL}/stop`);
    return response.data;
  },

  async getStatus() {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  },

  async getRawData() {
    const response = await axios.get(`${API_BASE_URL}/raw_data`);
    return response.data;
  },

  async getFrame() {
    const response = await axios.get(`${API_BASE_URL}/frame`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  },

  async startCalibration() {
    const response = await axios.post(`${API_BASE_URL}/start_calibration`);
    return response.data;
  },

  async resetCalibration() {
    const response = await axios.post(`${API_BASE_URL}/reset_calibration`);
    return response.data;
  },

  async getSettings() {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data;
  },

  async updateSettings(settings: any) {
    const response = await axios.post(`${API_BASE_URL}/settings`, settings);
    return response.data;
  },

  async shutdown() {
    const response = await axios.post(`${API_BASE_URL}/shutdown`);
    return response.data;
  },

  async getApiDocs() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  }
};
