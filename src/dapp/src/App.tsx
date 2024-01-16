import { ConnectKitButton } from 'connectkit';
import { useEthers } from '@usedapp/core';

function App() {
  const { account } = useEthers();
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-darkStart to-darkEnd">
      {/* Navbar */}
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <span className="text-white font-bold">AdFuel</span>
            </div>
            <div className="ml-auto">
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-grow flex items-center justify-center">
          <ConnectKitButton.Custom>
            {({ isConnected, show }) => (
              <>
                {isConnected ? (
                  <div>Wallet Connected</div>
                ) : (
                  <div className="text-center">
                    <img src="icon.png" alt="Logo" className="mx-auto w-72" />
                    <p className="text-white text-xl mt-4">Pay your Gas with Ads</p>
                  </div>
                )}
              </>
            )}
          </ConnectKitButton.Custom>
      </div>
    </div>
  );
}

export default App;
