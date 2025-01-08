'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Plus } from 'lucide-react'

interface DatabaseContextType {
  selectedDatabase: string;
  setSelectedDatabase: (database: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export interface DatabaseResponse {
  status: string;
  databases: string[];
}

export interface CreateDatabaseResponse {
  status: string;
  message: string;
}

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');

  return (
    <DatabaseContext.Provider value={{ selectedDatabase, setSelectedDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export default function DatabaseDashboard() {
  const [databases, setDatabases] = useState<string[]>([])
  const [newDbName, setNewDbName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { selectedDatabase, setSelectedDatabase } = useDatabase()

  useEffect(() => {
    fetchDatabases()
  }, [])

  const fetchDatabases = async () => {
    try {
      const response = await fetch('http://localhost:8000/database')
      const data: DatabaseResponse = await response.json()
      if (data.status === 'success') {
        setDatabases(data.databases)
      } else {
        showToast("Error", "Failed to fetch databases", true)
      }
    } catch (error) {
      console.error('Error fetching databases:', error)
      showToast("Error", "An error occurred while fetching databases", true)
    }
  }

  const createDatabase = async () => {
    if (!newDbName.trim()) {
      showToast("Error", "Please enter a database name", true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/create_database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ db_name: newDbName }),
      })
      const data: CreateDatabaseResponse = await response.json()
      if (data.status === 'success') {
        showToast("Success", data.message)
        setNewDbName('')
        fetchDatabases()
        setShowCreateDialog(false)
      } else {
        showToast("Error", data.message || "Failed to create database", true)
      }
    } catch (error) {
      console.error('Error creating database:', error)
      showToast("Error", "An error occurred while creating the database", true)
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (title: string, message: string, isError: boolean = false) => {
    // This is a simple implementation. You might want to replace this with a more robust toast solution.
    alert(`${title}: ${message}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-center mb-8">Knowledge Store</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((database) => (
            <div 
              key={database}
              className={`p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow cursor-pointer rounded-lg
                ${database === selectedDatabase ? 'bg-slate-800 text-white' : 'bg-white'}
              `}
              onClick={() => setSelectedDatabase(database)}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-medium">{database}</h2>
                <span 
                  className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Create Database Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Database</h2>
              <input
                type="text"
                placeholder="Database name"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={createDatabase}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Database'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          className="mt-4  h-14 w-14 rounded-full shadow-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add new database</span>
        </button>
      </main>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[40%] w-[150%] h-[150%] rotate-12">
          {/* Diagonal Lines */}
          <div className="absolute h-1 w-[200%] bg-blue-200/20 transform -rotate-45" />
          <div className="absolute h-1 w-[200%] bg-orange-200/20 transform -rotate-45 translate-y-20" />
          <div className="absolute h-1 w-[200%] bg-purple-200/20 transform -rotate-45 translate-y-40" />
          
          {/* Dots */}
          <div className="absolute w-4 h-4 rounded-full bg-blue-200/30 top-1/4 left-1/4" />
          <div className="absolute w-4 h-4 rounded-full bg-orange-200/30 top-1/3 right-1/4" />
          <div className="absolute w-4 h-4 rounded-full bg-purple-200/30 bottom-1/4 left-1/3" />
        </div>
      </div>
    </div>
  )
}