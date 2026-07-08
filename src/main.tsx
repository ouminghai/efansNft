import React from "react";
import ReactDOM from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { defineChain } from "viem";
import App from "./App.tsx";
import "./index.css";

const monadTestnet = defineChain({
  id: 10143, // Example Monad Testnet ID
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-devnet.monadinfra.com"] },
  },
  blockExplorers: {
    default: { name: "MonadExplorer", url: "https://explorer.monad.xyz" },
  },
});

const config = getDefaultConfig({
  appName: "FanBadge DApp",
  projectId: "YOUR_PROJECT_ID", // In a real app, this would be from WalletConnect
  chains: [monadTestnet],
  ssr: false,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
