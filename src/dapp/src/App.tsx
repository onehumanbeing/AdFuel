import { ConnectKitButton } from 'connectkit';
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
import AdsModal from './AdsModal';
import { signPermit } from './gho';
import Box from '@mui/material/Box';
import { useSigner, useAccount } from 'wagmi';
import { getTransactions, Transaction, TransactionRequest } from './utils';
import React, { useState, useEffect } from 'react';

function App() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (newTransaction: Transaction) => {
    console.log(newTransaction);
    const amount = (newTransaction.amount * 1000000000000000000).toString()
    const deadline = Math.floor(Date.now() / 1000) + 86400;
    signPermit(signer, newTransaction.sender, newTransaction.receiver, amount, deadline.toString())
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
  const [isAdsModalOpen, setIsAdsModalOpen] = useState(false);
  const [id, setId] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [filter, setFilter] = useState('Everyone'); 
  const toggleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.checked ? 'Everyone' : 'Me');
  };
  const greenColor = '#22c55e';
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data: signer } = useSigner();

  const handleOpenAdsModal = (url: string, id: number) => {
    setVideoUrl(url);
    setId(id);
    setIsAdsModalOpen(true);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const fetchedTransactions = await getTransactions();
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-darkStart to-darkEnd text-white">
      {/* Navbar */}
      <nav className="bg-black p-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">AdFuel</span>
          <ConnectKitButton />
        </div>
      </nav>
    
            {address ? (
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
              <AdsModal open={isAdsModalOpen} handleClose={() => setIsAdsModalOpen(false)} videoUrl={videoUrl} id={id}/>
              <CreateTransactionModal open={isModalOpen} handleClose={handleCloseModal} handleSubmit={handleSubmit} address={address} />
                <TableContainer component={Paper}  sx={{ backgroundColor: 'transparent'}}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>Sender</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Receiver</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Amount</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Created</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Executed</TableCell>
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
                          <TableCell sx={{ color: 'white' }} align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end'  }}>
                                    <img 
                                        src="aave.svg" 
                                        alt="Aave Logo" 
                                        style={{ marginRight: '10px', width: '24px' }} // Adjusted width
                                    />
                                    {parseFloat(tx.amount) / 1000000000000000000} Aave
                                </Box>
                          </TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">{tx.created}</TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">{tx.executed}</TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">
                            {tx.status === 'Pending' ? (
                              <>
                              <button
                                style={{color: 'white', padding: '10px', borderRadius: '5px'}}
                                className='bg-customRed'
                                onClick={() => handleOpenAdsModal('https://cloudflare-ipfs.com/ipfs/QmfGkE2Za9ZXsVzNjF8wVqZGAo3k6gjnxVtkjNc4QmWNuS', tx.id as number)}
                              >
                                View Ads
                              </button>
                              </>
                            ) : (
                              tx.status
                            )}
                          </TableCell>
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
            ) : (
              // not connected
              <div className="text-center">
                <img src="icon.png" alt="Logo" className="mx-auto w-72" />
                <p className="text-white text-xl mt-4">Pay your Gas with Ads</p>
              </div>
            )}  
      </div>
      );
}

      export default App;
