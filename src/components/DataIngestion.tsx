"use client";

import React, { useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import URLLoader from "./URLLoader.tsx";
import VehicleDataEditor from "./VehicleDataEditor.tsx";

export default function SmartProductSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [vehicleData, setVehicleData] = useState<Record<string, any>>({});
  const [extractionInProgress, setExtractionInProgress] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setExtractionInProgress(true);
    setSuccessMessage("");

    try {
      const formData = new FormData(event.currentTarget);
      const urls = formData.getAll("url").filter(Boolean) as string[];

      if (urls.length === 0) {
        throw new Error("Please enter at least one URL");
      }

      if (urls.length > 5) {
        throw new Error("Maximum 5 URLs allowed");
      }

      const response = await fetch("https://scrape-graph-api-dev.ispgnet.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        setVehicleData(data);
        setSuccessMessage("Vehicle data extracted successfully!");
      } else {
        throw new Error(data.message || "Failed to extract vehicle data");
      }
    } catch (error) {
      setSuccessMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
      setExtractionInProgress(false);
    }
  };

  const handleSaveToMongoDB = async (editedData: Record<string, any>) => {
    try {
      const response = await fetch("https://scrape-graph-api-dev.ispgnet.com/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      console.log(editedData);
      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Data saved to MongoDB successfully!");
      } else {
        throw new Error(data.message || "Failed to save data");
      }
    } catch (error) {
      setSuccessMessage(
        error instanceof Error ? error.message : "Failed to save data"
      );
    }
  };

  return (
    <div className="bg-white w-full max-w-4xl py-10 px-8 rounded-lg shadow-md mx-auto my-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Vehicle Data Extractor
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <URLLoader maxUrls={5} disabled={extractionInProgress} />
        <button
          type="submit"
          disabled={isLoading || extractionInProgress}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {extractionInProgress ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span>Vehicle data is being extracted...</span>
            </div>
          ) : (
            "Extract vehicle data"
          )}
        </button>
      </form>
      {successMessage && (
        <p className="mt-4 text-center text-green-600">{successMessage}</p>
      )}
      {Object.keys(vehicleData).length > 0 && (
        <VehicleDataEditor data={vehicleData} onSave={handleSaveToMongoDB} />
      )}
    </div>
  );
}
