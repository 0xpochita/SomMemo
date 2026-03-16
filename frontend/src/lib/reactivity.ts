import { createPublicClient, http } from "viem";
import type { WalletClient } from "viem";
import { SDK } from "@somnia-chain/reactivity";
import { somniaTestnet } from "./chains";
import { CONTRACT_ADDRESS } from "./contract";

const SOMNIA_RPC = "https://dream-rpc.somnia.network";

export function createReactivitySDK(walletClient: WalletClient) {
  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(SOMNIA_RPC),
  });

  return new SDK({
    public: publicClient,
    wallet: walletClient,
  });
}

export async function scheduleWillCronJob(
  sdk: SDK,
  deadlineTimestampMs: number,
) {
  const result = await sdk.scheduleOnchainCronJob({
    timestampMs: deadlineTimestampMs,
    handlerContractAddress: CONTRACT_ADDRESS,
    priorityFeePerGas: BigInt(1_000_000_000),
    maxFeePerGas: BigInt(20_000_000_000),
    gasLimit: BigInt(200_000),
    isGuaranteed: true,
    isCoalesced: false,
  });

  if (result instanceof Error) {
    throw result;
  }

  return result;
}

export async function subscribeToWillEvents(
  sdk: SDK,
  handlerContractAddress: `0x${string}`,
) {
  const result = await sdk.createSoliditySubscription({
    emitter: CONTRACT_ADDRESS,
    handlerContractAddress,
    priorityFeePerGas: BigInt(1_000_000_000),
    maxFeePerGas: BigInt(20_000_000_000),
    gasLimit: BigInt(200_000),
    isGuaranteed: true,
    isCoalesced: false,
  });

  if (result instanceof Error) {
    throw result;
  }

  return result;
}
