import React, { useState, FC, FormEvent } from 'react';
import axios from 'axios';

interface ApiResponse {
  Total_pages: number;
  Execution_Time: string;
  Time: string;
  Data?: string[];
}

const Knowledgebase: FC = () => {
  const [rootUrl, setRootUrl] = useState<string>('');
  const [apiOutput, setApiOutput] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingSpinnerVisible, setIsLoadingSpinnerVisible] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoadingSpinnerVisible(true);
    try {
      if (!rootUrl) {
        throw new Error('Please enter a Root URL');
      }
      const response = await axios.post<ApiResponse>('https://interim-cabdemo-module.ispgnet.com/scrapper', { url: rootUrl }, { headers: { 'Content-Type': 'application/json' } });
      setApiOutput(response.data);
      console.log(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.log(err);
    } finally {
      setIsLoadingSpinnerVisible(false);
      setLoading(false);
    }
  };

  const formatData = (data: ApiResponse): JSX.Element => {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 p-4 bg-green-100 rounded-md text-green-800 font-medium">
          <span>✅</span> URL processed successfully and Stored to the s3 bucket as .zip file with metadata
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="p-4 bg-gray-100 rounded-md border border-gray-300 flex flex-col gap-1">
            <span className="text-gray-600 font-medium">Total Pages</span>
            <span className="text-xl font-semibold">{data.Total_pages}</span>
          </div>
          <div className="p-4 bg-gray-100 rounded-md border border-gray-300 flex flex-col gap-1">
            <span className="text-gray-600 font-medium">Execution Time</span>
            <span className="text-xl font-semibold">{data.Execution_Time}</span>
          </div>
          <div className="p-4 bg-gray-100 rounded-md border border-gray-300 flex flex-col gap-1">
            <span className="text-gray-600 font-medium">Time</span>
            <span className="text-xl font-semibold">{data.Time}</span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Processed URLs</h3>
          <div className="flex flex-col gap-2">
            {data.Data?.map((url: string, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-100 rounded-md border border-gray-300">
                <span>🔗</span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{url}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-lg p-8 shadow-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Auto-Connect admin panel for RAG</h1>
          <p className="text-lg text-gray-600">Process and analyze website URLs for Auto-Connect</p>
        </div>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Please Enter Root URL"
              value={rootUrl}
              onChange={(e) => setRootUrl(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className={`p-3 rounded-md text-white transition ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-black hover:bg-gray-700'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center"><span>Processing</span><span className="animate-pulse">...</span></div>
              ) : 'Submit'}
            </button>
          </div>
          {isLoadingSpinnerVisible && (
            <div className="mt-2 text-blue-500"><span>🔄 Loading...</span></div>
          )}
          {!rootUrl && !loading && (
            <div className="flex items-center gap-2 p-3 bg-yellow-100 text-yellow-800 rounded-md mt-2">
              ⚠️ Please give a URL to proceed further
            </div>
          )}
        </form>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 text-red-600 rounded-md mb-6">
            ⚠️ {error}
          </div>
        )}
        {apiOutput && formatData(apiOutput)}
      </div>
    </div>
  );
};

export default Knowledgebase;
