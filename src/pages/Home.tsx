import React from "react";
import { BookOpen } from "lucide-react";
import CustomerSupportChatbot from "../components/Chatbot";
import DatabaseSelector, { DatabaseProvider } from "../components/DatabaseSelector";

interface HomeProps {
  navbarValues: {
    apiKey: string;
    selectedOption: string;
  };
}

const Home: React.FC<HomeProps> = ({ navbarValues }) => {
  console.log("vanakam,,,,,,,,,",navbarValues.selectedOption,navbarValues.apiKey);
  return (
    <DatabaseProvider>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Welcome</h1>
        </div>
        <div className="space-y-6">
          <DatabaseSelector />
          <CustomerSupportChatbot
            apiKey={navbarValues.apiKey} // Use API Key from Navbar
            selectedOption={navbarValues.selectedOption} 
          // Use selected option from Navbar
          />
        </div>
      </div>
    </DatabaseProvider>
  );
};

export default Home;
