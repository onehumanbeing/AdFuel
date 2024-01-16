import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

type AdsModalProps = {
  open: boolean;
  handleClose: () => void;
  videoUrl: string;
  id: number;
};

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

const AdsModal: React.FC<AdsModalProps> = ({ open, handleClose, videoUrl, id }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(3); // Countdown from 3 seconds
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (showCountdown && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      resetModalState();
    }
    return () => clearTimeout(countdown);
  }, [timer, showCountdown, handleClose]);

  const handleVerification = () => {
    setIsVerified(true);
  };

  const resetModalState = () => {
    setIsVerified(false); // Reset verification state
    setShowCountdown(false); // Hide countdown
    setTimer(3); // Reset timer to initial value
    handleClose(); // Close the modal
  };

  const handleVideoEnd = () => {
    console.log('Video playback finished');
    setShowCountdown(true);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <h2 style={{ textAlign: 'center', fontSize: '24px' }}>View Ads</h2>
        {!isVerified ? (
          <div style={{ textAlign: 'center' }}>
            <button className='bg-customRed'                                 
            style={{color: 'white', padding: '10px', borderRadius: '5px'}}
            onClick={handleVerification}>Verify Human</button>
          </div>
        ) : (
          <>
            <video
              width="100%"
              controls
              autoPlay
              onEnded={handleVideoEnd}
              controlsList="nodownload nofullscreen noremoteplayback"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {showCountdown && (
              <div style={{ textAlign: 'center' }}>
                Ad has finished playing, initiating transaction. Closing in {timer}s...
              </div>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AdsModal;
