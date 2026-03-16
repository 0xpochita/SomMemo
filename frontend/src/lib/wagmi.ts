import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { somniaTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [somniaTestnet],
  connectors: [injected()],
  transports: {
    [somniaTestnet.id]: http("https://dream-rpc.somnia.network"),
  },
});
