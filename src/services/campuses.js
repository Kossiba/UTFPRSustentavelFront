// src/services/campuses.js


export async function fetchCampuses() {
  const response = await apiClient.get('/campuses');
  return response.data;   
}
