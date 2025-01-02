import React from 'react';
import { BookOpen } from 'lucide-react';
import CustomerSupportChatbot from '../components/Chatbot.tsx';

const Home: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Welcome</h1>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm w-[65%]">
        <p className="text-gray-600">
          Auto Connect AI
          <br />
          The centralized platform for all your customer support bot
        </p>
      </div>
      <CustomerSupportChatbot />
    </div>
  );
};

export default Home;