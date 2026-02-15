'use client';

import { useState, useEffect, useCallback } from 'react';

// Types for wallet
interface WalletInfo {
  address: string;
  publicKey: string;
  network: string;
  addressType: string;
}

// QR Code component (simple SVG-based)
function QRCode({ data, size = 200 }: { data: string; size?: number }) {
  // Simple placeholder QR - in production use qrcode library
  // For now, show a styled placeholder that indicates it's a QR
  return (
    <div
      className="bg-white p-4 border-4 border-black"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
        {/* QR Pattern Simulation */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 49 }).map((_, i) => {
            // Create a pattern based on address hash
            const isBlack = (i + data.charCodeAt(i % data.length)) % 3 !== 0;
            return (
              <div
                key={i}
                className={`w-3 h-3 ${isBlack ? 'bg-black' : 'bg-white'}`}
              />
            );
          })}
        </div>
        <p className="font-pixel-mono text-[8px] text-gray-500 mt-2 text-center break-all px-2">
          {data.substring(0, 20)}...
        </p>
      </div>
    </div>
  );
}

// Copy button component
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={copy}
      className={`px-3 py-1 font-pixel text-[8px] border-2 border-black transition-all ${
        copied
          ? 'bg-pixel-success text-black'
          : 'bg-pixel-bg-dark text-pixel-text hover:bg-pixel-primary hover:text-black'
      }`}
    >
      {copied ? 'COPIED!' : label}
    </button>
  );
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [balance, setBalance] = useState({ btc: 0, baby: BigInt(0) });

  // Generate new wallet
  const generateWallet = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const { BitcoinWallet } = await import('@bitcoinbaby/bitcoin');

      const btcWallet = new BitcoinWallet({ network: 'testnet' });
      const info = await btcWallet.generate(12);

      setWallet(info);
      setMnemonic(btcWallet.getMnemonic());

      // Save to localStorage (in production use secure storage)
      localStorage.setItem('wallet_address', info.address);
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      alert('Failed to generate wallet. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Load existing wallet from localStorage
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedAddress) {
      setWallet({
        address: savedAddress,
        publicKey: '',
        network: 'testnet',
        addressType: 'taproot',
      });
    }
  }, []);

  // Format address for display
  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-pixel-bg-dark">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="font-pixel text-xl text-pixel-primary">WALLET</h1>
            <a
              href="/"
              className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
            >
              ← BACK
            </a>
          </div>
          <p className="font-pixel-body text-sm text-pixel-text-muted mt-2">
            Bitcoin Testnet Wallet - Taproot (P2TR)
          </p>
        </header>

        {/* Wallet Card */}
        <div className="bg-pixel-bg-medium border-4 border-pixel-border p-6 shadow-[8px_8px_0_0_#000]">
          {!wallet ? (
            // No wallet - show generate button
            <div className="text-center py-12">
              <div className="font-pixel text-4xl text-pixel-text-muted mb-6">?</div>
              <p className="font-pixel-body text-pixel-text-muted mb-6">
                No wallet found. Generate a new one to start.
              </p>
              <button
                onClick={generateWallet}
                disabled={isGenerating}
                className={`px-6 py-3 font-pixel text-sm border-4 border-black shadow-[4px_4px_0_0_#000] transition-all
                  ${isGenerating
                    ? 'bg-pixel-border text-pixel-text-muted cursor-wait'
                    : 'bg-pixel-primary text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000]'
                  }`}
              >
                {isGenerating ? 'GENERATING...' : 'GENERATE WALLET'}
              </button>
            </div>
          ) : (
            // Wallet exists
            <div className="space-y-6">
              {/* Address Section */}
              <div>
                <label className="font-pixel text-[10px] text-pixel-text-muted block mb-2">
                  YOUR ADDRESS
                </label>
                <div className="flex items-center gap-3 bg-pixel-bg-dark p-3 border-2 border-pixel-border">
                  <span className="font-pixel-mono text-sm text-pixel-text flex-1 break-all">
                    {wallet.address}
                  </span>
                  <CopyButton text={wallet.address} label="COPY" />
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <QRCode data={wallet.address} size={180} />
              </div>

              {/* Network Badge */}
              <div className="flex justify-center gap-2">
                <span className="px-2 py-1 font-pixel text-[8px] bg-pixel-secondary text-black border-2 border-black">
                  {wallet.network.toUpperCase()}
                </span>
                <span className="px-2 py-1 font-pixel text-[8px] bg-pixel-bg-light text-pixel-text border-2 border-pixel-border">
                  {wallet.addressType.toUpperCase()}
                </span>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
                  <label className="font-pixel text-[8px] text-pixel-text-muted block mb-1">
                    BTC BALANCE
                  </label>
                  <span className="font-pixel-mono text-xl text-pixel-text">
                    {(balance.btc / 100_000_000).toFixed(8)}
                  </span>
                </div>
                <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border">
                  <label className="font-pixel text-[8px] text-pixel-text-muted block mb-1">
                    $BABY BALANCE
                  </label>
                  <span className="font-pixel-mono text-xl text-pixel-primary">
                    {balance.baby.toString()}
                  </span>
                </div>
              </div>

              {/* Mnemonic Section (Hidden by default) */}
              {mnemonic && (
                <div className="border-t-2 border-pixel-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-pixel text-[10px] text-pixel-error">
                      RECOVERY PHRASE (SECRET!)
                    </label>
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className="font-pixel text-[8px] text-pixel-text-muted hover:text-pixel-primary"
                    >
                      {showMnemonic ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>

                  {showMnemonic ? (
                    <div className="bg-pixel-error/10 border-2 border-pixel-error p-4">
                      <p className="font-pixel text-[8px] text-pixel-error mb-3">
                        NEVER SHARE THIS! WRITE IT DOWN SAFELY.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {mnemonic.split(' ').map((word, i) => (
                          <div
                            key={i}
                            className="bg-pixel-bg-dark px-2 py-1 border border-pixel-border"
                          >
                            <span className="font-pixel-mono text-[10px] text-pixel-text-muted">
                              {i + 1}.
                            </span>{' '}
                            <span className="font-pixel-mono text-sm text-pixel-text">
                              {word}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <CopyButton text={mnemonic} label="COPY PHRASE" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-pixel-bg-dark p-4 border-2 border-pixel-border text-center">
                      <span className="font-pixel text-pixel-text-muted">
                        ******** **** ******** ****
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <a
                  href="https://coinfaucet.eu/en/btc-testnet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 font-pixel text-[10px] text-center bg-pixel-secondary text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  GET TEST BTC
                </a>
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This will clear your wallet.')) {
                      localStorage.removeItem('wallet_address');
                      setWallet(null);
                      setMnemonic(null);
                    }
                  }}
                  className="px-4 py-3 font-pixel text-[10px] bg-pixel-error text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all"
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-pixel-bg-light border-4 border-dashed border-pixel-border">
          <h3 className="font-pixel text-xs text-pixel-secondary mb-3">HOW IT WORKS</h3>
          <ul className="space-y-2 font-pixel-body text-sm text-pixel-text-muted">
            <li>1. Generate a new Taproot wallet (BIP86)</li>
            <li>2. Save your recovery phrase securely</li>
            <li>3. Get testnet BTC from a faucet</li>
            <li>4. Start mining to earn $BABY tokens</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
