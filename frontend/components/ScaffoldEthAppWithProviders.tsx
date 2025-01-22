"use client";

import { useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider, useAccount, useSignMessage } from "wagmi";
import axiosInstance, { setAuthToken } from "~~/utils/axiosInstance"; // Import singleton Axios instance
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { SonyaCharacter } from "~~/components/SonyaCharacter";

const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // 60 minutes in milliseconds

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clear JWT from local storage
  const clearJWT = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("jwtExpiry");
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  // Initialize authentication state from local storage
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const jwtExpiry = localStorage.getItem("jwtExpiry");

    if (jwt && jwtExpiry) {
      const now = Date.now();
      if (parseInt(jwtExpiry) > now) {
        setAuthToken(jwt);
        setIsAuthenticated(true);

        // Schedule JWT clearing after expiry
        const timeLeft = parseInt(jwtExpiry) - now;
        setTimeout(clearJWT, timeLeft);
      } else {
        // Clear expired JWT
        clearJWT();
      }
    }
  }, []);

  const handleProveSonyaBalance = async () => {
    if (!address) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const message = "Hello Sonya";
      const signature = await signMessageAsync({ message });

      // Use the Axios singleton to send the signed message to the backend
      const response = await axiosInstance.post("/verify", {
        walletAddress: address,
        signature,
      });

      if (response.data.success) {
        console.log("Authentication successful!");
        setIsAuthenticated(true);

        // Set the JWT token in the Axios instance for subsequent requests
        if (response.data.jwt) {
          setAuthToken(response.data.jwt);

          // Store the JWT and expiry time in local storage
          localStorage.setItem("jwt", response.data.jwt);
          localStorage.setItem("jwtExpiry", (Date.now() + TOKEN_EXPIRY_TIME).toString());

          // Schedule JWT clearing after 60 minutes
          setTimeout(clearJWT, TOKEN_EXPIRY_TIME);
        }
      } else {
        console.error("Authentication failed");
      }
    } catch (error) {
      console.error("Error signing message or sending request:", error);
    }
  };

  return (
    <>
      <div className={`flex flex-col min-h-screen`}>
        <Header />
        <main className="relative flex flex-col flex-1">
          {children}
          {address && !isAuthenticated && (
            <div className="flex flex-col items-center justify-center mt-8">
              <button
                className="px-6 py-3 text-lg font-semibold text-white bg-[#EFAF76] rounded-lg shadow hover:bg-[#D98B5F]"
                onClick={handleProveSonyaBalance}
              >
                Prove Sonya Balance
              </button>
            </div>
          )}
          {isAuthenticated && <SonyaCharacter walletAddress={address} />}
        </main>
        {/* <Footer /> */}
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};