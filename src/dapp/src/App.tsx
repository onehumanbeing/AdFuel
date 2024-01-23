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
import { getTransactions, Transaction, TransactionRequest, readCache, executeTransaction2, executePending } from './utils';
import React, { useState, useEffect } from 'react';

function App() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [volume, setVolume] = useState(0.0);
  const [gasBurnt, setGasBurnt] = useState(0.0);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (newTransaction: Transaction) => {
    console.log(newTransaction);
    const amount = (newTransaction.amount * 1000000000000000000).toString()
    const deadline = Math.floor(Date.now() / 1000) + 86400;
    signPermit(signer, newTransaction.sender, newTransaction.receiver, amount, deadline.toString())
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error("Error occurred:", error);
        });  
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePermit = (id: number) => {
    executeTransaction2(id, 2).then(() => {
      window.location.reload();
    })
  }

  const handleTest = (id: number) => {
    executePending(id)
    .then(() => {
      window.location.reload();
    })
  }

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
        let filteredTransactions = fetchedTransactions;
        
        if (filter === 'Me') {
          filteredTransactions = fetchedTransactions.filter(tx => 
            tx.sender === address
          );
        }
  
        setTransactions(filteredTransactions);
        const v = await readCache('v');
        setVolume(Number(parseFloat(v as string).toFixed(2)));
        const g = await readCache('g');
        setGasBurnt(g / 1000000000000000000);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
  
    fetchTransactions();
  }, [address, filter]); 

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
                  <span className="text-2xl">{transactions.length}</span>
                  <span>Transactions</span>
                </div>
                <div className="bg-grey p-4 rounded flex flex-col items-center justify-center">
                  <span className="text-2xl">{volume} USD</span>
                  <span>Volume</span>
                </div>
                <div className="bg-customRed p-4 rounded flex flex-col items-center justify-center">
                  <span className="text-2xl">{gasBurnt} ETH</span>
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
                            {tx.sender} {tx.sender === address? (
                              <>(me)</>
                            ): (
                              <></>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">{tx.receiver} {tx.receiver === address? (
                              <>(me)</>
                            ): (
                              <></>
                            )}</TableCell>
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
                          <TableCell sx={{ color: 'white' }} align="right" onClick={() => handleTest(tx.id as number)}>{tx.executed}</TableCell>
                          <TableCell sx={{ color: 'white' }} align="right">
                              {tx.status === 'Pending' ? (
                                <>
                                   {tx.sender === address? (
                                      <button
                                      style={{ color: 'white', padding: '10px', borderRadius: '5px' }}
                                      className='bg-customRed'
                                      onClick={() => handleOpenAdsModal('ads.mov', tx.id as number)}
                                    >
                                      View Ads
                                    </button>
                                    ): (
                                      <>{tx.status}</>
                                    )}
                                  
                                </>
                              ) : tx.status === 'Finished' ? (
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${tx.value}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ color: 'white', textDecoration: 'underline' }}
                                >
                                  Success
                                </a>
                              ) : tx.status === 'Permit' ? (
                                <a 
                                  onClick={() => handlePermit(tx.id as number)}
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ color: 'white', textDecoration: 'underline' }}
                                >
                                  Permit
                                </a>
                              ): (
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
                <div className="flex justify-center space-x-4 mt-10">
                  <a style={{ color: 'white', textDecoration: 'underline' }}  href="https://staging.aave.com/faucet/" className="text-white hover:underline">AAVE Faucet</a>
                  <a style={{ color: 'white', textDecoration: 'underline' }}  href="https://faucet.quicknode.com/ethereum/sepolia" className="text-white hover:underline">Sepolia Faucet</a>
                  <a style={{ color: 'white', textDecoration: 'underline' }} href="https://twitter.com/0xhenryht" className="text-white hover:underline">Contact Us</a>
              </div>
              </div>
            )}  
      </div>
      );
}

      export default App;
