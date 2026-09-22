import { useState } from "react";
import { usePayroll } from "../hooks/usePayroll";

export const WalletBar = ({
  isConnected,
  wallet,
  busy,
  onConnect,
  onDisconnect,
}: {
  isConnected: boolean;
  wallet: { walletName: string; unshieldedAddress: string } | null;
  busy: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) => {
  if (!isConnected) {
    return (
      <div className="wallet-bar">
        <span className="wallet-bar__mark">Undisclosed</span>
        <button className="connect-btn" onClick={onConnect} disabled={!!busy}>
          {busy ? "Connecting…" : "Connect Lace wallet"}
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-bar connected">
      <span className="wallet-bar__mark">Undisclosed</span>
      <div className="wallet-info">
        <span className="wallet-name">{wallet?.walletName}</span>
        <span className="wallet-address">{wallet?.unshieldedAddress?.slice(0, 12)}…</span>
      </div>
      <button className="disconnect-btn" onClick={onDisconnect} disabled={!!busy}>
        Disconnect
      </button>
    </div>
  );
};