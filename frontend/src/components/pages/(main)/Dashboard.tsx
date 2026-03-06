"use client";

import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { DashboardStats } from "./DashboardStats";

export function Dashboard() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-text-muted">
            Monitor your inheritance status and activity
          </p>
        </div>
        <StatusBadge status="active" />
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-sm font-medium text-text-muted">
          Time Remaining Until Inactivity
        </h2>
        <div className="mt-4">
          <CountdownTimer targetDate={targetDate} />
        </div>
      </div>

      <DashboardStats
        walletAddress="0x1234567890123456789012345678901234567890"
        beneficiaryAddress="0x0987654321098765432109876543210987654321"
        lastActivity="2 hours ago"
        inactivityPeriod="30 days"
        vaultBalance="1.5 ETH"
      />

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Check In Now
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-brand bg-white px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-pink-light"
          >
            Manage Vault
          </button>
        </div>
      </div>
    </div>
  );
}
