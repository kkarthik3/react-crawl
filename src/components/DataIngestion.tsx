"use client";

import React, { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";

export default function SmartProductSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.message === "Successful") {
        setSuccessMessage("PDF uploaded successfully!");
      } else {
        setSuccessMessage("An error occurred. Please try again.");
      }
    } catch (error) {
      setSuccessMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white w-[400px] h-[280px] py-10 px-8 rounded-lg shadow-md mx-auto my-8">
      <h2 className="text-3xl font-semibold text-gray-800 mx-2 my-2">
        Smart Product Search
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label
            htmlFor="pdf-upload"
            className="block text-sm font-medium text-gray-700 mx-2 my-2"
          >
            Upload PDF
          </label>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-black-500 file:text-black-700
              hover:file:bg-gray-200
              mx-2  my-2"
          />
        </div>
        <button
          type="submit"
          disabled={!file || isLoading}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin mx-auto" size={24} />
          ) : (
            "Submit"
          )}
        </button>
      </form>
      {successMessage && (
        <p className="mt-4 text-center text-green-600">{successMessage}</p>
      )}
    </div>
  );
}
