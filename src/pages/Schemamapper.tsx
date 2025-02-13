"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, ArrowRight, Loader2, Edit2, Save, X } from "lucide-react"
import axios from "axios"
import { useSearchParams } from "react-router-dom"
// import { useCachedData } from "../contexts/cachedData"

const API_ROOT = "https://scrape-graph-api-dev.ispgnet.com"

// Custom hook for caching API responses
const useApiCache = () => {
  const [cache, setCache] = useState<Record<string, any>>({})

  const getCacheKey = (endpoint: string, params: Record<string, any>) => {
    return `${endpoint}-${JSON.stringify(params)}`
  }

  const getCachedData = (endpoint: string, params: Record<string, any>) => {
    const key = getCacheKey(endpoint, params)
    return cache[key]
  }

  const setCachedData = (endpoint: string, params: Record<string, any>, data: any) => {
    const key = getCacheKey(endpoint, params)
    setCache((prev) => ({ ...prev, [key]: data }))
  }

  const clearCache = () => {
    setCache({})
  }

  return { getCachedData, setCachedData, clearCache }
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-2">
    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
  </div>
)

// Schema Key Management Component
const SchemaKeyManager = ({
  projectDatabase,
  externalKeys,
  onKeysUpdate,
  isLoadingKeys,
}: {
  projectDatabase: string
  externalKeys: string[]
  onKeysUpdate: () => void
  isLoadingKeys: boolean
}) => {
  const [newKey, setNewKey] = useState("")
  const [editingKey, setEditingKey] = useState<{ index: number; value: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveSchemaKeys = async (updatedKeys: string[]) => {
    setIsSaving(true)
    try {
      await axios.post(`${API_ROOT}/api/update_schema_keys`, {
        project_database: projectDatabase,
        keys: updatedKeys,
      })
      onKeysUpdate()
    } catch (error) {
      console.error("Error saving schema keys:", error)
      alert("Failed to save schema keys")
    } finally {
      setIsSaving(false)
    }
  }

  const addKey = async () => {
    if (!newKey.trim()) return
    const updatedKeys = [...externalKeys, newKey.trim()]
    await saveSchemaKeys(updatedKeys)
    setNewKey("")
  }

  const deleteKey = async (index: number) => {
    const updatedKeys = externalKeys.filter((_, i) => i !== index)
    await saveSchemaKeys(updatedKeys)
  }

  const startEditing = (index: number, value: string) => {
    setEditingKey({ index, value })
  }

  const saveEdit = async () => {
    if (!editingKey) return
    const updatedKeys = [...externalKeys]
    updatedKeys[editingKey.index] = editingKey.value
    await saveSchemaKeys(updatedKeys)
    setEditingKey(null)
  }

  if (isLoadingKeys) {
    return <LoadingSpinner />
  }

  return (
    <div className="mb-6 p-4 border rounded bg-white">
      <h2 className="text-lg font-semibold mb-4">Manage Schema Keys</h2>

      {/* Add new key */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="New schema key"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addKey}
          disabled={!newKey.trim() || isSaving}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {/* Key list */}
      <div className="space-y-2">
        {externalKeys.map((key, index) => (
          <div key={index} className="flex items-center gap-2">
            {editingKey?.index === index ? (
              <>
                <input
                  type="text"
                  value={editingKey.value}
                  onChange={(e) => setEditingKey({ index, value: e.target.value })}
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={saveEdit} className="text-green-500 hover:text-green-700">
                  <Save className="w-5 h-5" />
                </button>
                <button onClick={() => setEditingKey(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 p-2">{key}</span>
                <button onClick={() => startEditing(index, key)} className="text-blue-500 hover:text-blue-700">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => deleteKey(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

async function retrieveExistingMapping(projectDatabase: string) {
  try {
    const response = await fetch(`${API_ROOT}/api/retrieve_existing_mapping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project_database: projectDatabase }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    return data.mappings
  } catch (error) {
    console.error("Error retrieving mappings:", error)
    return {}
  }
}

interface SourcePath {
  db: string
  collection: string
  path: string[]
}

interface Mapping {
  source: SourcePath
  target: {
    key: string
  }
}

interface Schema {
  [key: string]: {
    type?: string
    [key: string]: any
  }
}

const SchemaMapper = () => {
  const [searchParams] = useSearchParams()
  const initialSourceUrl = searchParams.get("url") || ""
  const [sourceUrl, setSourceUrl] = useState(initialSourceUrl)
  const [mappings, setMappings] = useState<Mapping[]>([
    {
      source: { db: "", collection: "", path: [] },
      target: { key: "" },
    },
  ])

  // Loading states
  const [isLoadingDbs, setIsLoadingDbs] = useState(false)
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isLoadingKeys, setIsLoadingKeys] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingMappings, setIsLoadingMappings] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})

  const [projectDatabases, setProjectDatabases] = useState<string[]>([])
  const [selectedProjectDb, setSelectedProjectDb] = useState("")
  const [isLoadingProjectDbs, setIsLoadingProjectDbs] = useState(false)

  // Source state
  const [sourceDbs, setSourceDbs] = useState<string[]>([])
  const [sourceCollections, setSourceCollections] = useState<string[]>([])
  const [sourceSchema, setSourceSchema] = useState<Schema | null>(null)

  // Destination state
  const [externalKeys, setExternalKeys] = useState<string[]>([])

  // Initialize cache
  const { getCachedData, setCachedData, clearCache } = useApiCache()

  // Fetch existing mappings when project database is selected
  useEffect(() => {
    const fetchExistingMappings = async () => {
      if (!selectedProjectDb) return

      setIsLoadingMappings(true)
      try {
        const existingMappings = await retrieveExistingMapping(selectedProjectDb)
        if (Object.keys(existingMappings).length === 0) {
          setMappings([
            {
              source: { db: "", collection: "", path: [] },
              target: { key: "" },
            },
          ])
        } else {
          // Convert the mappings object to our mapping format
          const formattedMappings = Object.entries(existingMappings).map(([targetKey, sourcePath]) => {
            const [db, collection, ...pathParts] = (sourcePath as string).split(".")
            return {
              source: {
                db,
                collection,
                path: pathParts,
              },
              target: {
                key: targetKey,
              },
            }
          })
          setMappings(formattedMappings)

          // Set sourceDbs, sourceCollections, and sourceSchema based on the first mapping
          // if (formattedMappings[0]?.source.db) {
          //   const uniqueDbs = [...new Set(formattedMappings.map((m) => m.source.db))]
          //   setSourceDbs(uniqueDbs)

          //   if (formattedMappings[0]?.source.collection) {
          //     const uniqueCollections = [...new Set(formattedMappings.map((m) => m.source.collection))]
          //     setSourceCollections(uniqueCollections)

          //     // Fetch schema for the first mapping's db and collection
          //     await fetchSchema(sourceUrl, formattedMappings[0].source.db, formattedMappings[0].source.collection)
          //   }
          // }
        }
      } catch (error) {
        console.error("Error fetching existing mappings:", error)
        setMappings([
          {
            source: { db: "", collection: "", path: [] },
            target: { key: "" },
          },
        ])
      } finally {
        setIsLoadingMappings(false)
      }
    }

    fetchExistingMappings()
  }, [selectedProjectDb, sourceUrl])

  // Fetch predefined schema keys with caching
  const fetchPredefinedSchema = useCallback(async () => {
    if (!selectedProjectDb) return

    const cachedKeys = getCachedData("predefined-schema", { projectDb: selectedProjectDb })
    if (cachedKeys) {
      setExternalKeys(cachedKeys)
      return
    }

    setIsLoadingKeys(true)
    try {
      const response = await axios.get(`${API_ROOT}/api/schema_keys/${selectedProjectDb}`)
      const keys = response.data.keys || []
      setExternalKeys(keys)
      setCachedData("predefined-schema", { projectDb: selectedProjectDb }, keys)
    } catch (error) {
      console.error("Error fetching predefined schema:", error)
      setExternalKeys([])
    } finally {
      setIsLoadingKeys(false)
    }
  }, [selectedProjectDb, getCachedData, setCachedData])

  const handleSchemaKeysUpdate = useCallback(() => {
    clearCache()
    fetchPredefinedSchema()
  }, [clearCache, fetchPredefinedSchema])

  useEffect(() => {
    if (selectedProjectDb) {
      fetchPredefinedSchema()
    }
  }, [selectedProjectDb, fetchPredefinedSchema])

  useEffect(() => {
    const fetchProjectDatabases = async () => {
      setIsLoadingProjectDbs(true)
      try {
        const response = await fetch("https://scrape-graph-api-dev.ispgnet.com/database")
        const data = await response.json()
        if (data.status === "success") {
          setProjectDatabases(data.databases)
        }
      } catch (error) {
        console.error("Error fetching databases:", error)
      } finally {
        setIsLoadingProjectDbs(false)
      }
    }

    fetchProjectDatabases()
  }, [])

  // Fetch databases with caching
  const fetchDatabases = useCallback(
    async (url: string) => {
      const cachedDbs = getCachedData("databases", { url })
      if (cachedDbs) {
        setSourceDbs(cachedDbs)
        return
      }

      setIsLoadingDbs(true)
      try {
        const response = await axios.post(`${API_ROOT}/api/databases`, { mongoUrl: url })
        setSourceDbs(response.data)
        setCachedData("databases", { url }, response.data)
      } catch (error) {
        console.error("Error fetching databases:", error)
      } finally {
        setIsLoadingDbs(false)
      }
    },
    [getCachedData, setCachedData],
  )

  // Fetch collections with caching and loading state per mapping
  const fetchCollections = async (url: string, db: string, mappingIndex: number) => {
    const cachedCollections = getCachedData("collections", { url, db })
    if (cachedCollections) {
      setSourceCollections(cachedCollections)
      return
    }

    setLoadingStates((prev) => ({ ...prev, [mappingIndex]: true }))
    setIsLoadingCollections(true)
    try {
      const response = await axios.post(`${API_ROOT}/api/collections`, {
        mongoUrl: url,
        database: db,
      })
      setSourceCollections(response.data)
      setCachedData("collections", { url, db }, response.data)
    } catch (error) {
      console.error("Error fetching collections:", error)
    } finally {
      setIsLoadingCollections(false)
      setLoadingStates((prev) => ({ ...prev, [mappingIndex]: false }))
    }
  }

  // Fetch schema with caching
  const fetchSchema = useCallback(
    async (url: string, db: string, collection: string) => {
      const cachedSchema = getCachedData("schema", { url, db, collection })
      if (cachedSchema) {
        setSourceSchema(cachedSchema)
        return
      }

      setIsLoadingSchema(true)
      try {
        const response = await axios.post(`${API_ROOT}/api/schema`, {
          mongoUrl: url,
          database: db,
          collection: collection,
        })
        setSourceSchema(response.data)
        setCachedData("schema", { url, db, collection }, response.data)
      } catch (error) {
        console.error("Error fetching schema:", error)
      } finally {
        setIsLoadingSchema(false)
      }
    },
    [getCachedData, setCachedData],
  )

  useEffect(() => {
    if (sourceUrl) fetchDatabases(sourceUrl)
  }, [sourceUrl, fetchDatabases])

  const getFieldPaths = (schema: Schema, currentPath: string[] = []): string[][] => {
    let paths: string[][] = []
    if (!schema || typeof schema !== "object") return paths
    Object.entries(schema).forEach(([key, value]) => {
      const newPath = [...currentPath, key]
      if (value && value.type) {
        paths.push(newPath)
      } else if (typeof value === "object") {
        paths = [...paths, ...getFieldPaths(value, newPath)]
      }
    })
    return paths
  }

  const updateMapping = (index: number, side: "source" | "target", field: string, value: any) => {
    const newMappings = [...mappings]
    if (side === "source") {
      if (field === "db") {
        newMappings[index].source = { db: value, collection: "", path: [] }
        fetchCollections(sourceUrl, value, index)
      } else if (field === "collection") {
        newMappings[index].source = { ...newMappings[index].source, collection: value, path: [] }
        fetchSchema(sourceUrl, newMappings[index].source.db, value)
      } else if (field === "path") {
        newMappings[index].source = { ...newMappings[index].source, path: value }
      }
    } else if (side === "target") {
      newMappings[index].target = { key: value }
    }
    setMappings(newMappings)
  }

  const addMapping = () => {
    setMappings([
      ...mappings,
      {
        source: { db: "", collection: "", path: [] },
        target: { key: "" },
      },
    ])
  }

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index))
  }

  const saveMappings = async (projectDatabase: string) => {
    setIsSaving(true)
    try {
      const formattedMappings = mappings.reduce((acc: { [key: string]: string }, mapping) => {
        const sourcePath = `${mapping.source.db}.${mapping.source.collection}.${mapping.source.path.join(".")}`
        const targetKey = mapping.target.key
        acc[targetKey] = sourcePath
        return acc
      }, {})

      await axios.post(`${API_ROOT}/api/save-mapping`, {
        project_database: projectDatabase,
        mappings: formattedMappings,
      })
      alert("Mappings saved successfully!")
    } catch (error) {
      console.error("Error saving mappings:", error)
      alert("Failed to save mappings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MongoDB Schema Mapper</h1>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Source MongoDB URL"
            className="w-full p-2 border rounded"
          />

          {isLoadingProjectDbs ? (
            <LoadingSpinner />
          ) : (
            <select
              value={selectedProjectDb}
              onChange={(e) => setSelectedProjectDb(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Project Database</option>
              {projectDatabases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedProjectDb && (
        <SchemaKeyManager
          projectDatabase={selectedProjectDb}
          externalKeys={externalKeys}
          onKeysUpdate={handleSchemaKeysUpdate}
          isLoadingKeys={isLoadingKeys}
        />
      )}

      {isLoadingMappings ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
          <span className="ml-2">Loading existing mappings...</span>
        </div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No mappings found. Click "Add Mapping" to create one.</div>
      ) : (
        mappings.map((mapping, index) => (
          <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Source Selection */}
              <div>
                <h3 className="font-semibold mb-2">Source Path</h3>
                <select
                  value={mapping.source.db}
                  onChange={(e) => updateMapping(index, "source", "db", e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                >
                  <option value="">Select Database</option>
                  {sourceDbs.map((db) => (
                    <option key={db} value={db}>
                      {db}
                    </option>
                  ))}
                </select>

                {mapping.source.db && (
                  <div className="relative">
                    {loadingStates[index] ? (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      </div>
                    ) : null}
                    <select
                      value={mapping.source.collection}
                      onChange={(e) => updateMapping(index, "source", "collection", e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      disabled={loadingStates[index]}
                    >
                      <option value="">Select Collection</option>
                      {sourceCollections.map((collection) => (
                        <option key={collection} value={collection}>
                          {collection}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {sourceSchema && (
                  <select
                    value={mapping.source.path.join(".")}
                    onChange={(e) => updateMapping(index, "source", "path", e.target.value.split("."))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Field Path</option>
                    {getFieldPaths(sourceSchema).map((path) => (
                      <option key={path.join(".")} value={path.join(".")}>
                        {path.join(".")}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Target Selection */}
              <div>
                <h3 className="font-semibold mb-2">Target Key</h3>
                <select
                  value={mapping.target.key}
                  onChange={(e) => updateMapping(index, "target", "key", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Key</option>
                  {externalKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {mapping.source.path.length > 0 && mapping.target.key && (
                  <div className="flex items-center space-x-2">
                    <span>{mapping.source.path.join(".")}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{mapping.target.key}</span>
                  </div>
                )}
              </div>
              <button onClick={() => removeMapping(index)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={addMapping}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add Mapping</span>
        </button>

        <button
          onClick={() => saveMappings(selectedProjectDb)}
          disabled={!selectedProjectDb || isSaving}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Mappings</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default SchemaMapper

