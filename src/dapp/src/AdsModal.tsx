import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import {executeTransaction} from './utils';

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

const style1 = {
    sponsorContainer: {
      position: 'absolute' as 'absolute',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景
      padding: '10px',
      borderRadius: '10px', // 圆角
    },
    sponsorLogo: {
      height: '30px', // Logo高度
      marginRight: '10px', // 与文字的间隔
      borderRadius: '50%', // Logo圆角
    },
  };
  

const AdsModal: React.FC<AdsModalProps> = ({ open, handleClose, videoUrl, id }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(3); // Countdown from 3 seconds
  const [showCountdown, setShowCountdown] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (showCountdown && timer > 0) {
      countdown = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      resetModalState();
      executeTransaction(id).then(() => {
        window.location.reload();
      })
    }
    return () => clearTimeout(countdown);
  }, [timer, showCountdown, handleClose]);

  const handleVerification = () => {
    setIsVerified(true);
  };
  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };
  const resetModalState = () => {
    setIsVerified(false); // Reset verification state
    setShowCountdown(false); // Hide countdown
    setTimer(3); // Reset timer to initial value
    handleClose(); // Close the modal
  };

  const handleVideoEnd = () => {
    console.log('Video playback finished');
    setIsVideoPlaying(false);
    setShowCountdown(true);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <h2 style={{ textAlign: 'center', fontSize: '24px' }} className='mb-4'>View Ads</h2>
        {!isVerified ? (
          <>
          <div style={{ textAlign: 'center' }}>
            <button className='bg-darkEnd mb-4'                                 
            style={{color: 'white', padding: '10px', borderRadius: '5px'}}
            onClick={handleVerification}>Normal</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className='bg-customRed'                                 
            style={{color: 'white', padding: '10px', borderRadius: '5px'}}
            onClick={handleVerification}>Double Gas</button>
          </div>
          </>
        ) : (
          <>
            <video
              width="100%"
              controls
              autoPlay
              onEnded={handleVideoEnd}
              onPlay={handleVideoPlay}
              controlsList="nodownload nofullscreen noremoteplayback"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {isVideoPlaying && (
            <div style={style1.sponsorContainer}>
                <img src="29056010_0.webp" alt="Axie Infinity Logo" style={style1.sponsorLogo} />
                <span>Sponsored by Axie Infinity</span>
            </div>
            )}
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
