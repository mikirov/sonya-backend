import React, { useState } from "react";
import axiosInstance from "~~/utils/axiosInstance";

interface SonyaCharacterProps {
  walletAddress?: string; // Wallet address passed as a prop
}

export const SonyaCharacter: React.FC<SonyaCharacterProps> = ({ walletAddress }) => {
  const [userInput, setUserInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // State for video URL
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // Audio state

  const handleSendInput = async () => {
    if (!userInput.trim()) {
      alert("Please enter a valid input.");
      return;
    }

    try {
      // Send user input and walletAddress to the agent endpoint
      const apiResponse = await axiosInstance.post(`input/process-input`, {
        input: userInput,
        walletAddress, // Include wallet address in the payload
      });

      // Update the response state with the backend response
      setResponse(apiResponse.data.response);

      // Play the audio if available
      if (apiResponse.data.audio) {
        const audioData = apiResponse.data.audio; // Base64-encoded audio
        const audioElement = new Audio(audioData);
        setAudio(audioElement);
        audioElement.play();
      }
    } catch (error) {
      console.error("Error sending input:", error);
      alert("An error occurred while processing your input. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FFF4E1]">
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8">
          {videoUrl ? (
            // Display video if videoUrl is available
            <video
              className="w-full max-h-[400px] rounded-lg shadow-md"
              controls
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            // Display the Sonya image from the public folder
            <img
              className="w-full max-h-[400px] rounded-lg shadow-md object-cover"
              src="/sonya.png"
              alt="Sonya"
            />
          )}
        </div>
        <textarea
          className="w-full h-40 p-4 text-lg border rounded-md shadow-md bg-[#FFF8E6] border-[#FFDBAC] text-[#5F370E]"
          placeholder="Hello. How are you feeling today?"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-3 text-lg font-semibold text-white bg-[#EFAF76] rounded-lg shadow hover:bg-[#D98B5F]"
            onClick={handleSendInput}
          >
            Send to Sonya
          </button>
        </div>
        {response && (
          <div className="mt-6">
            <textarea
              className="w-full h-40 p-4 text-lg border rounded-md shadow-md bg-[#FFF8E6] border-[#FFDBAC] text-[#5F370E]"
              placeholder="Sonya's response will appear here."
              value={response}
              disabled // Disable editing the response
            />
          </div>
        )}
      </div>
    </div>
  );
};