export interface Transaction {
  sender: string;
  receiver: string;
  amount: number;
  created: string;
  executed: string;
  status: string;
}

// Define the types for your TransactionRequest data
export type TransactionRequest = {
  sender: string;
  receiver: string;
  amount: string;
  status: string;
  created?: string; // This field is auto-generated, so it's optional when creating a TransactionRequest
  executed?: string;
  value?: string;
  id?: number;
  extra?: string;
  deadline?: string;
};

// API base URL
const API_URL = 'https://ad-fuel.vercel.app';

export const executeTransaction = async (id: number): Promise<void> => {
  try {
      const response = await fetch(`${API_URL}/execute?id=${id}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      // Handle response here if needed
  } catch (error) {
      console.error('Error executing transaction:', error);
  }
}

export async function readCache(key: string): Promise<any> {
  try {
      const response = await fetch(`${API_URL}/get?k=${key}`);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data.value;
  } catch (error) {
      console.error('Error reading cache:', error);
      return null;
  }
}

export const createTransaction = async (TransactionRequestData: TransactionRequest): Promise<TransactionRequest> => {
  try {
    const response = await fetch(`${API_URL}/create_txn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TransactionRequestData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<TransactionRequest[]> => {
  try {
    const response = await fetch(`${API_URL}/get_txns`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
