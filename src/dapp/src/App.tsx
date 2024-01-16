import { ConnectKitButton } from 'connectkit';
import { useState } from 'react';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CreateTransactionModal from './CreateTransactionModal';

interface Transaction {
  sender: string;
  receiver: string;
  amount: string;
  created: string;
  updated: string;
  status: string;
}

function App() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (newTransaction: Transaction) => {
    console.log(newTransaction);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleChangePage = (event: any, newPage: React.SetStateAction<number>) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: { target: { value: string; }; }) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [filter, setFilter] = useState('Me'); 
  const toggleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.checked ? 'Everyone' : 'Me');
  };
  const greenColor = '#22c55e'; 
  const transactions: Transaction[] = [
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
    { sender: '0xSender', receiver: '0xReceiver', amount: '1 ETH', created: 'YYYY-MM-DD', updated: 'YYYY-MM-DD', status: 'Success' },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-darkStart to-darkEnd text-white">
      {/* Navbar */}
      <nav className="bg-black p-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">AdFuel</span>
          <ConnectKitButton />
        </div>
      </nav>
      {/* Content */}
      <div className="flex-grow p-4">
        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-grey p-4 rounded flex flex-col items-center justify-center">
            <span className="text-2xl">10</span>
            <span>Transactions</span>
          </div>
          <div className="bg-grey p-4 rounded flex flex-col items-center justify-center">
            <span className="text-2xl">10,000 USD</span>
            <span>Volume</span>
          </div>
          <div className="bg-customRed p-4 rounded flex flex-col items-center justify-center">
            <span className="text-2xl">2 ETH</span>
            <span>Gas Burnt</span>
          </div>
        </div>
        {/* Transaction Table */}
        <div className="overflow-x-auto p-4 rounded">
        <div className="flex justify-between items-center mb-5">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={handleOpenModal}>
            Create New Transaction
          </button>
          <FormControlLabel
            control={
              <Switch 
                checked={filter === 'Everyone'}
                onChange={toggleFilter}
                sx={{ 
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: greenColor,
                    '& + .MuiSwitch-track': {
                      backgroundColor: greenColor,
                    },
                  },
                }}
              />
            }
            label="View All"
            sx={{ color: 'white', '.MuiFormControlLabel-label': { color: 'white' } }}
          />
        </div>
        <CreateTransactionModal open={isModalOpen} handleClose={handleCloseModal} handleSubmit={handleSubmit} />
          <TableContainer component={Paper}  sx={{ backgroundColor: 'transparent'}}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Sender</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Receiver</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Amount</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Created</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Updated</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tx) => (
                  <TableRow
                    key={tx.sender}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell  sx={{ color: 'white' }} component="th" scope="row">
                      {tx.sender}
                    </TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">{tx.receiver}</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">{tx.amount}</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">{tx.created}</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">{tx.updated}</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">{tx.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={transactions.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: 'white',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-displayedRows': {
                color: 'white'
              }
            }}
          />
        </div>
      </div>
      </div>
      );
}

      export default App;
