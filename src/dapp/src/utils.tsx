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
  id?: number;
};

// API base URL
const API_URL = 'https://ad-fuel.vercel.app';

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
