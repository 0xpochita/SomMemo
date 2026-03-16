import { useState, useCallback } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { SOMMEMO_ABI } from "./abi";
import { CONTRACT_ADDRESS } from "./contract";
import { createReactivitySDK, scheduleWillCronJob } from "./reactivity";
import type { WillStatus } from "@/types";

export function useWillInfo(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SOMMEMO_ABI,
    functionName: "getWillInfo",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useWillStatus(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SOMMEMO_ABI,
    functionName: "getStatus",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useVaultSTT(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SOMMEMO_ABI,
    functionName: "vaultSTT",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useCheckInHistory(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SOMMEMO_ABI,
    functionName: "getCheckInHistory",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useVaultHistory(ownerAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SOMMEMO_ABI,
    functionName: "getVaultHistory",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });
}

export function useSomMemoWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return { writeContract, hash, isPending, isConfirming, isSuccess, error };
}

export function formatStatus(status: string | undefined): WillStatus {
  if (status === "Active") return "Active";
  if (status === "Warning") return "Warning";
  return "Inactive";
}

export function useScheduleCron() {
  const { data: walletClient } = useWalletClient();
  const [isScheduling, setIsScheduling] = useState(false);
  const [cronTxHash, setCronTxHash] = useState<string | null>(null);

  const scheduleCron = useCallback(
    async (deadlineTimestampMs: number) => {
      if (!walletClient) throw new Error("Wallet not connected");
      setIsScheduling(true);
      setCronTxHash(null);
      try {
        const sdk = createReactivitySDK(walletClient);
        const txHash = await scheduleWillCronJob(sdk, deadlineTimestampMs);
        setCronTxHash(txHash);
        return txHash;
      } finally {
        setIsScheduling(false);
      }
    },
    [walletClient],
  );

  return { scheduleCron, isScheduling, cronTxHash };
}
