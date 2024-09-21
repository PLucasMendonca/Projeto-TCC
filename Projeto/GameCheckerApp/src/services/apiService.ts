import axios from 'axios';

const API_URL = 'https://api.example.com/check'; // Substitua com a URL real da sua API

export const checkGameCompatibility = async (gameName: string, phoneSpecs: string) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        game: gameName,
        specs: phoneSpecs,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from API', error);
    throw error;
  }
};
