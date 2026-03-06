"use client";

import Image from "next/image";

interface Asset {
  name: string;
  amount: string;
  symbol: string;
  logo: string;
}

export function Vault() {
  const assets: Asset[] = [
    {
      name: "Ethereum",
      amount: "1.5",
      symbol: "ETH",
      logo: "/Assets/Images/Logo/eth-logo.svg",
    },
    {
      name: "USD Coin",
      amount: "500",
      symbol: "USDC",
      logo: "/Assets/Images/Logo/usdc-logo.webp",
    },
    {
      name: "Somnia Token",
      amount: "1000",
      symbol: "STT",
      logo: "/Assets/Images/Logo/somnia-logo.webp",
    },
  ];

  const totalValue = "1.5 ETH";
  const beneficiary = "0x0987654321098765432109876543210987654321";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vault</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage assets for inheritance
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-sm font-medium text-text-muted">
          Total Vault Value
        </h2>
        <p className="mt-2 text-3xl font-bold text-foreground">{totalValue}</p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Assets in Vault
        </h2>
        <div className="space-y-3">
          {assets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={asset.logo}
                  alt={asset.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground">{asset.name}</p>
                  <p className="text-sm text-text-muted">{asset.symbol}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {asset.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Manage Assets
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Deposit ETH
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-brand bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-pink-light"
          >
            Deposit Token
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-brand bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-pink-light"
          >
            Deposit NFT
          </button>
        </div>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Withdraw
        </button>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-2 text-sm font-medium text-text-muted">
          Beneficiary
        </h2>
        <p className="font-mono text-sm text-foreground">
          {beneficiary.slice(0, 6)}...{beneficiary.slice(-4)}
        </p>
      </div>
    </div>
  );
}
