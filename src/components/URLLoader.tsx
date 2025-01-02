import React, { useState, ChangeEvent } from 'react'
import { X } from 'lucide-react'

interface URLLoaderProps {
  maxUrls?: number
  disabled?: boolean
}

export default function URLLoader({ maxUrls = 5, disabled = false }: URLLoaderProps) {
  const [urls, setUrls] = useState<string[]>([''])

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const addUrlField = () => {
    if (urls.length < maxUrls) {
      setUrls([...urls, ''])
    }
  }

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls.length ? newUrls : [''])
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Enter URLs (Maximum {maxUrls})
      </label>
      <div className="space-y-2">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              name="url"
              type="url"
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                handleUrlChange(index, e.target.value)
              }
              disabled={disabled}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {urls.length > 1 && !disabled && (
              <button
                type="button"
                onClick={() => removeUrlField(index)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {urls.length < maxUrls && !disabled && (
        <button
          type="button"
          onClick={addUrlField}
          className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Add URL
        </button>
      )}
    </div>
  )
}

