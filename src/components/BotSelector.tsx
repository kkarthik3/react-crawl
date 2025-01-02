import React, { useState, useEffect } from 'react';

interface BotSelectorProps {
  selectedBot: string;
  onBotChange: (bot: string) => void;
}

const BotSelector: React.FC<BotSelectorProps> = ({ selectedBot, onBotChange }) => {
  const [botOptions, setBotOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchBotOptions = async () => {
      try {
        const response = await fetch('https://scrape-graph-api-dev.ispgnet.com/collections');
        if (!response.ok) {
          throw new Error('Failed to fetch bot options');
        }
        const data: string[] = await response.json();
        setBotOptions(data);
      } catch (error) {
        console.error('Error fetching bot options:', error);
      }
    };

    fetchBotOptions();
  }, []);

  const handleBotChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onBotChange(event.target.value);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm w-[65%] mb-6">
      <p className="text-gray-600 mb-4">
        Auto Connect AI
        <br />
        The centralized platform for all your customer support bots
      </p>
      
      <select 
        value={selectedBot} 
        onChange={handleBotChange}
        className="w-full max-w-xs p-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a chatbot</option>
        {botOptions.map((bot, index) => (
          <option key={index} value={bot}>
            {bot}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BotSelector;

