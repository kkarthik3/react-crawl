import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.tsx";
import Home from "./pages/Home.tsx";
import Search from "./pages/ProductSearch.tsx";
import RAGKnowledgebase from "./pages/RAGKnowledgebase.tsx";

const App: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Navbar
          isOpen={isNavOpen}
          toggleMenu={() => setIsNavOpen(!isNavOpen)}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            isNavOpen ? "ml-64" : "ml-16"
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productsearch" element={<Search />} />
            <Route path="/knowledgebase" element={<RAGKnowledgebase />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
