'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { ConfirmationDialog } from './ConfirmationDialog'

interface DatabaseResponse {
  status: string
  databases: string[]
}

interface VehicleDataEditorProps {
  data: Record<string, any>
  onSave: (data: Record<string, any>, selectedDatabase: string) => Promise<void>
  showToast: (title: string, message: string, isError: boolean) => void
}

export default function VehicleDataEditor({ data, onSave, showToast }: VehicleDataEditorProps) {
  const [editedData, setEditedData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [databases, setDatabases] = useState<string[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>('')
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    url: string;
    variantIndex: number;
  }>({ isOpen: false, url: '', variantIndex: -1 })

  const fetchDatabases = async () => {
    try {
      const response = await fetch('https://scrape-graph-api-dev.ispgnet.com/database')
      const data: DatabaseResponse = await response.json()
      if (data.status === 'success') {
        setDatabases(data.databases)
        if (data.databases.length > 0) {
          setSelectedDatabase(data.databases[0])
        }
      } else {
        showToast("Error", "Failed to fetch databases", true)
      }
    } catch (error) {
      console.error('Error fetching databases:', error)
      showToast("Error", "An error occurred while fetching databases", true)
    }
  }

  useEffect(() => {
    fetchDatabases()
  }, [])

  const toggleSection = (path: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const handleDeleteVariant = (url: string, variantIndex: number) => {
    setConfirmDialog({ isOpen: true, url, variantIndex })
  }

  const confirmDeleteVariant = () => {
    const { url, variantIndex } = confirmDialog
    setEditedData(prev => {
      const newData = { ...prev }
      if (newData[url]?.data) {
        newData[url].data = newData[url].data.filter((_, index: number) => index !== variantIndex)
        if (newData[url].data.length === 0) {
          delete newData[url]
        }
      }
      return newData
    })
  }

  const handleValueChange = (
    url: string,
    variantIndex: number,
    path: string[],
    value: any
  ) => {
    setEditedData(prev => {
      const newData = { ...prev }
      if (newData[url]?.data?.[variantIndex]) {
        let current = newData[url].data[variantIndex]
        const lastKey = path[path.length - 1]
        
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]]
        }
        
        current[lastKey] = value
      }
      return newData
    })
  }

  const renderField = (
    key: string,
    value: any,
    url: string,
    variantIndex: number,
    path: string[] = []
  ) => {
    const currentPath = [...path, key]
    const pathString = currentPath.join('.')

    if (Array.isArray(value)) {
      return (
        <div key={key} className="ml-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleSection(pathString)}
          >
            {expandedSections[pathString] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <label className="font-medium">{key}</label>
          </div>
          {expandedSections[pathString] && (
            <div className="ml-4 space-y-2">
              {value.map((item, index) => (
                <div key={index}>
                  {typeof item === 'object' ? (
                    Object.entries(item).map(([subKey, subValue]) =>
                      renderField(subKey, subValue, url, variantIndex, [...currentPath, index.toString()])
                    )
                  ) : (
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleValueChange(url, variantIndex, [...currentPath, index.toString()], e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="ml-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleSection(pathString)}
          >
            {expandedSections[pathString] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <label className="font-medium">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</label>
          </div>
          {expandedSections[pathString] && (
            <div className="ml-4 space-y-2">
              {Object.entries(value).map(([subKey, subValue]) =>
                renderField(subKey, subValue, url, variantIndex, currentPath)
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={key} className="ml-4 grid grid-cols-1 gap-2">
        <label className="block text-sm font-medium text-gray-700">
          {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </label>
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => handleValueChange(
            url,
            variantIndex,
            currentPath,
            typeof value === 'number' ? parseFloat(e.target.value) : e.target.value
          )}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
        />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate selectedDatabase
    if (!selectedDatabase) {
        showToast("Error", "Please select a database", true)
        return
    }

    // Validate editedData (optional, based on your requirements)
    if (!editedData || Object.keys(editedData).length === 0) {
        showToast("Error", "No data to save", true)
        return
    }

    setIsLoading(true)
    try {
        // Call the onSave function and handle success
        await onSave(editedData, selectedDatabase)
        showToast("Success", "Data saved successfully!", false)

    } catch (error) {
        // Handle errors from onSave
        const errorMessage = error instanceof Error ? error.message : "Failed to save data"
        showToast("Error", errorMessage, true)
    } finally {
        setIsLoading(false) // Ensure loading is reset
    }
}


  // Check if data is empty or invalid
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500">
        No vehicle data available to edit.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Edit Vehicle Data</h3>
        <div className="w-64">
          <select
            value={selectedDatabase}
            onChange={(e) => setSelectedDatabase(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
          >
            <option value="">Select Database</option>
            {databases.map((db) => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.entries(editedData).map(([url, urlData]: [string, any]) => (
        <div key={url} className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-lg break-all">{url}</h4>
          {urlData?.data?.map((variant: any, variantIndex: number) => (
            <div key={variantIndex} className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium">Variant {variantIndex + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleDeleteVariant(url, variantIndex)}
                  disabled={urlData.data.length === 1}
                  className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  title={urlData.data.length === 1 ? "Cannot delete the only variant" : "Delete this variant"}
                >
                  <Trash2 size={20} />
                </button>
              </div>
              {Object.entries(variant).map(([key, value]) =>
                renderField(key, value, url, variantIndex)
              )}
            </div>
          ))}
        </div>
      ))}
      
      <button
        type="submit"
        disabled={isLoading || !selectedDatabase}
        className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span>Saving to database...</span>
          </div>
        ) : (
          'Save to Database'
        )}
      </button>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, url: '', variantIndex: -1 })}
        onConfirm={confirmDeleteVariant}
        message="Are you sure you want to delete this variant?"
      />
    </form>
  )
}
