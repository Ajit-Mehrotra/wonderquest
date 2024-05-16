import axios from 'axios';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'YourTableName'; // replace with your table name

const airtableInstance = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
  timeout: 5000,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const getRecords = async () => {
  try {
    const response = await airtableInstance.get();
    return response.data.records;
  } catch (error) {
    console.error('Error getting records:', error);
    return null;
  }
};

export const createRecord = async (data) => {
  try {
    const response = await airtableInstance.post('', { fields: data });
    return response.data;
  } catch (error) {
    console.error('Error creating record:', error);
    return null;
  }
};

// Add more functions as needed for updating, deleting records etc.