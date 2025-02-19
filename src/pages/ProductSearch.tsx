import React from "react";
import DataIngestion from "../components/DataIngestion.tsx";
import { Search as SearchIcon } from "lucide-react";

const Search: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon className="w-8 h-8" />
        <h1 className="text-2xl font-bold">Product Search</h1>
      </div>
      <DataIngestion />
    </div>
  );
};

export default Search;
