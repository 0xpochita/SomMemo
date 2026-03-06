"use client";

export function Settings() {
  const walletAddress = "0x1234567890123456789012345678901234567890";
  const beneficiaryAddress = "0x0987654321098765432109876543210987654321";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">
          Manage your inheritance configuration
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Beneficiary Address
        </h2>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="beneficiary"
              className="block text-sm font-medium text-text-muted"
            >
              Current Beneficiary
            </label>
            <input
              type="text"
              id="beneficiary"
              defaultValue={beneficiaryAddress}
              className="mt-2 w-full rounded-lg border border-border-main bg-main px-4 py-3 font-mono text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
            />
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Update Beneficiary
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Inactivity Period
        </h2>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="period"
              className="block text-sm font-medium text-text-muted"
            >
              Select inactivity period
            </label>
            <select
              id="period"
              defaultValue="30"
              className="mt-2 w-full cursor-pointer rounded-lg border border-border-main bg-main px-4 py-3 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20"
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">365 days</option>
            </select>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Update Period
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Wallet Management
        </h2>
        <p className="mb-4 text-sm text-text-muted">Connected Wallet</p>
        <div className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4">
          <p className="font-mono text-sm text-foreground">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-red-700">
          Irreversible actions that affect your inheritance setup
        </p>
        <div className="space-y-3">
          <button
            type="button"
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Withdraw All Assets
          </button>
          <button
            type="button"
            className="w-full cursor-pointer rounded-lg border border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Deactivate SomMemo
          </button>
        </div>
      </div>
    </div>
  );
}
