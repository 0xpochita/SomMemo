"use client";

interface CheckInRecord {
  date: string;
}

interface VaultActivity {
  type: "Deposit" | "Withdraw";
  asset: string;
  amount: string;
  date: string;
}

export function History() {
  const checkInHistory: CheckInRecord[] = [
    { date: "June 12 2026" },
    { date: "May 12 2026" },
    { date: "April 12 2026" },
  ];

  const vaultActivity: VaultActivity[] = [
    { type: "Deposit", asset: "ETH", amount: "1.5 ETH", date: "June 10 2026" },
    {
      type: "Withdraw",
      asset: "USDC",
      amount: "200 USDC",
      date: "May 28 2026",
    },
    {
      type: "Deposit",
      asset: "NFT",
      amount: "CryptoArt #21",
      date: "May 15 2026",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="mt-1 text-sm text-text-muted">
          View all your activity and transactions
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Check-In History
        </h2>
        <div className="space-y-2">
          {checkInHistory.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink-light">
                  <svg
                    className="h-5 w-5 text-brand"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Check-In</p>
                  <p className="text-sm text-text-muted">{record.date}</p>
                </div>
              </div>
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                View Transaction
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Vault Activity
        </h2>
        <div className="space-y-2">
          {vaultActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border-main bg-main p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    activity.type === "Deposit"
                      ? "bg-brand-pink-light"
                      : "bg-gray-100"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${
                      activity.type === "Deposit"
                        ? "text-brand"
                        : "text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {activity.type === "Deposit" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {activity.type} {activity.asset}
                  </p>
                  <p className="text-sm text-text-muted">{activity.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{activity.amount}</p>
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-brand-hover"
                >
                  View Transaction
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
