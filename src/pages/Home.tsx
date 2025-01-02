import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import CustomerSupportChatbot from '../components/Chatbot';
import BotSelector from '../components/BotSelector';

const Home: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState('');

  const handleBotChange = (bot: string) => {
    setSelectedBot(bot);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Welcome</h1>
      </div>
      <CustomerSupportChatbot />
      <BotSelector selectedBot={selectedBot} onBotChange={handleBotChange} />

      {/* <CustomerSupportChatbot selectedBot={selectedBot} /> */}
    </div>
  );
};

export default Home;

