"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";

// Update this to match your Python API endpoint
const API_URL = "http://localhost:8000";

// Define the expected response type
interface UploadResponse {
  message: string;
  processed_files: number;
  processing_times: number[];
}

export default function GraphRAGingest() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTimes, setProcessingTimes] = useState<number[]>([]);
  const [processedFileCount, setProcessedFileCount] = useState<number>(0);
  const [selectedDev, setSelectedDev] = useState("dev1");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      const response = await fetch(`${API_URL}/upload?dev=${selectedDev}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Upload failed");
      }

      const data: UploadResponse = await response.json();
      console.log("Upload successful:", data);
      setProcessingTimes(data.processing_times || []);
      setProcessedFileCount(data.processed_files || 0);
      setSuccessMessage(data.message || "Files processed successfully");

      // Reset form
      setFiles(null);
      const form = e.target as HTMLFormElement;
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const invalidFiles = Array.from(selectedFiles).filter(
        (file) => file.type !== "application/pdf"
      );

      if (invalidFiles.length > 0) {
        setError("Please select only PDF files");
        e.target.value = "";
        return;
      }

      setFiles(selectedFiles);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleDevChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDev(e.target.value);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Graph RAG ingestion
      </h1>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="dev-select"
            className="block w-1/2 text-base font-medium text-gray-700"
          >
            Select Environment
          </label>
          <select
            id="dev-select"
            value={selectedDev}
            onChange={handleDevChange}
            className="mt-1 block w-1/2 p-3 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="dev1">dev1</option>
            <option value="dev2">dev2</option>
          </select>
        </div>

        <div>
          <h2 className="text-lg mb-2">Upload PDF</h2>
          <div className="space-y-2">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="inline-flex px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
            >
              Choose Files
            </label>
            <span className="ml-3 text-gray-600">
              {files ? `${files.length} file(s) selected` : "No files chosen"}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isLoading || !files}
        >
          {isLoading ? (
            <>
              <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>

      {processedFileCount > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Processing Summary</h2>
          <div className="border rounded-md p-4 bg-blue-50">
            <div className="flex items-center text-blue-700">
              <FileText className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {processedFileCount} file(s) processed successfully
              </span>
            </div>
          </div>
        </div>
      )}

      {processingTimes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Processing Times</h2>
          <ul className="border rounded-md p-2">
            {processingTimes.map((time, index) => (
              <li
                key={index}
                className="text-gray-700 py-1 flex justify-between items-center border-b last:border-b-0"
              >
                <span>File {index + 1}:</span>
                <span className="font-medium">{time.toFixed(2)} seconds</span>
              </li>
            ))}
            {processingTimes.length > 1 && (
              <li className="text-gray-800 py-1 flex justify-between items-center font-semibold border-t">
                <span>Total Time:</span>
                <span>
                  {processingTimes
                    .reduce((sum, time) => sum + time, 0)
                    .toFixed(2)}{" "}
                  seconds
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
