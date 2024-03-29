import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { getGHOBalance } from './gho';
import { Transaction } from './utils';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto', 
    maxWidth: '80%',
    bgcolor: 'black',
    color: 'white',
    boxShadow: 24,
    p: 4,
};

interface CreateTransactionModalProps {
    open: boolean;
    handleClose: () => void;
    handleSubmit: (transaction: Transaction) => void; 
    address: string | undefined
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
    open,
    handleClose,
    handleSubmit,
    address
}) => {
    const [maxAmount, setMaxAmount] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            if(!address) {
                return;
            }
            try {
                const balance = await getGHOBalance(address as string);
                setMaxAmount(balance / 1000000000000000000);
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        };
        if (address) {
            fetchBalance();
        }
    }, [address]);    
    
    const [transactionData, setTransactionData] = React.useState<Transaction>({
        sender: address as string,
        receiver: '0xe5107dee9CcC8054210FF6129cE15Eaa5bbcB1c0',
        amount: 0.1,
        created: '',
        executed: '',
        status: '',
    });
    const [assetType, setAssetType] = React.useState('Aave');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTransactionData({ ...transactionData, [name]: value });
    };

    const onSubmit = () => {
        handleSubmit(transactionData);
        handleClose(); // 提交表单后关闭模态框
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="create-transaction-modal-title"
        >
            <Box sx={style}>
                <Typography id="create-transaction-modal-title" variant="h6" component="h2">
                    Create New Transaction
                </Typography>
                {/* 表单开始 */}
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="receiver"
                        label="Receiver Address"
                        name="receiver"
                        value={transactionData.receiver}
                        onChange={handleChange}
                        sx={{ input: { color: 'white' }, label: { color: 'white' } }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="asset-type-label">Asset Type</InputLabel>
                        <Select
                            labelId="asset-type-label"
                            id="asset-type"
                            value={assetType}
                            label="Asset Type"
                            onChange={(event) => setAssetType(event.target.value as string)}
                            sx={{ borderRadius: '8px', '.MuiSelect-select': { color: 'white' } }} // Ensures the text is white
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        backgroundColor: 'black', // Ensures the dropdown background is black
                                        color: 'white', // Ensures the dropdown text is white
                                    },
                                },
                            }}
                        >
                            <MenuItem value="Aave">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <img 
                                        src="aave.svg" 
                                        alt="Aave Logo" 
                                        style={{ marginRight: '10px', width: '24px' }} // Adjusted width
                                    />
                                    Aave
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="amount"
                        label="Amount"
                        name="amount"
                        value={transactionData.amount}
                        onChange={handleChange}
                        sx={{ input: { color: 'white' }, label: { color: 'white' } }}
                        helperText={`Available: ${maxAmount}`} 
                        FormHelperTextProps={{
                            style: { color: 'white' },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button onClick={handleClose} sx={{ mr: 1 }}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={onSubmit} sx={{ bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}>
                            Submit
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default CreateTransactionModal;
