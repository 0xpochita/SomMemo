"use client";

import { CountdownTimer } from "./CountdownTimer";

export function CheckIn() {
  const lastCheckIn = "2 hours ago";
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 29);

  const handleCheckIn = () => {
    console.log("Check-in button clicked");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Check-In</h1>
        <p className="mt-1 text-sm text-text-muted">
          Confirm you are still active
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="text-sm font-medium text-text-muted">Last Check-In</h2>
        <p className="mt-2 text-2xl font-bold text-foreground">{lastCheckIn}</p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-6">
        <h2 className="mb-4 text-sm font-medium text-text-muted">
          Next Required Check-In
        </h2>
        <CountdownTimer targetDate={targetDate} />
        <p className="mt-4 text-sm text-text-muted">
          You must check in before the countdown ends to prevent inheritance
          execution
        </p>
      </div>

      <div className="rounded-lg border border-border-main bg-surface p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Confirm Activity
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          Click the button below to reset your activity timer
        </p>
        <button
          type="button"
          onClick={handleCheckIn}
          className="cursor-pointer rounded-lg bg-brand px-8 py-4 text-base font-medium text-white transition-colors hover:bg-brand-hover"
        >
          I'm Still Active
        </button>
      </div>
    </div>
  );
}
