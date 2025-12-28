
export interface Chain {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
}

export interface WalletScanResult {
  id: string;
  mnemonic: string;
  address: string;
  balance: number;
  chain: string;
  timestamp: number;
}

export interface ScanLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
}
