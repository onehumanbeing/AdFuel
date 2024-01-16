import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Transaction } from './types'; 

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto', // 自动调整宽度
    maxWidth: '80%', // 最大宽度为视口的80%
    bgcolor: 'black',
    color: 'white',
    boxShadow: 24,
    p: 4,
};

interface CreateTransactionModalProps {
    open: boolean;
    handleClose: () => void;
    handleSubmit: (transaction: Transaction) => void; // 表单提交时的处理函数
}

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
    open,
    handleClose,
    handleSubmit,
}) => {
    // 使用本地状态来存储表单输入
    const [transactionData, setTransactionData] = React.useState<Transaction>({
        sender: '',
        receiver: '',
        amount: '',
        created: '',
        updated: '',
        status: '',
    });

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
                        id="sender"
                        label="Sender Address"
                        name="sender"
                        autoFocus
                        value={transactionData.sender}
                        onChange={handleChange}
                        sx={{ input: { color: 'white' }, label: { color: 'white' } }}
                    />
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
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="created"
                        label="Creation Date"
                        name="created"
                        type="date"
                        value={transactionData.created}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            input: { color: 'white' }, label: {
                                color
                                    : 'white'
                            }, svg: { color: 'white' }
                        }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="updated"
                        label="Updated Date"
                        name="updated"
                        type="date"
                        value={transactionData.updated}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ input: { color: 'white' }, label: { color: 'white' }, svg: { color: 'white' } }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="status"
                        label="Status"
                        name="status"
                        value={transactionData.status}
                        onChange={handleChange}
                        sx={{ input: { color: 'white' }, label: { color: 'white' } }}
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
