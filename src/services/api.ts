// api.ts
export const API_URL = "https://api.crm-cherry.alg-dev.ispgnet.com/api/vehicle/test-drive/list";
export const SHOWROOM_API_URL = "https://api.crm-cherry.alg-dev.ispgnet.com/api/showroom?ecommerceOnly=true";

const requestOptions: RequestInit = {
  method: "POST",
  headers: {
    "Origin": "https://app.crm-cherry.alg-dev.ispgnet.com",
    "Referer": "https://app.crm-cherry.alg-dev.ispgnet.com",
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDVhYmZhNjE0NmIyYjM1NzM4YTQ4ZjIiLCJuYW1lIjoiQWxnaGFuaW0gU3RhZmYiLCJlbWFpbCI6ImFkbWluQGFsZ2hhbmltLmNvbSIsImF2YXRhciI6eyJfaWQiOiI2NzllMTA0ODNjNjAzMTU2NTU1NWE0OTMiLCJmaWVsZG5hbWUiOiJmaWxlIiwib3JpZ2luYWxuYW1lIjoiZG93bmxvYWQucG5nIiwiZW5jb2RpbmciOiI3Yml0IiwibWltZXR5cGUiOiJpbWFnZS9wbmciLCJzaXplIjo1NDk0LCJidWNrZXQiOiJhbGdoYW5pbS1jaGV2ZXJvbGV0LWRldi1zMyIsImtleSI6IjE3MDEwNzg4NjEyNTMvOWU1OTI5NzgtZTNlNC00NzYxLWFiODUtMDFhZmRkOGFmY2FkLWRvd25sb2FkLnBuZyIsImFjbCI6InByaXZhdGUiLCJjb250ZW50VHlwZSI6ImltYWdlL3BuZyIsInN0b3JhZ2VDbGFzcyI6IlNUQU5EQVJEIiwibG9jYXRpb24iOiJodHRwczovL2FsZ2hhbmltLWNoZXZlcm9sZXQtZGV2LXMzLnMzLmV1LXdlc3QtMi5hbWF6b25hd3MuY29tLzE3MDEwNzg4NjEyNTMvOWU1OTI5NzgtZTNlNC00NzYxLWFiODUtMDFhZmRkOGFmY2FkLWRvd25sb2FkLnBuZyIsImV0YWciOiJcImIyYTdiY2UzYjNlYTFkMjllZmE4MWY2ZGIyZDJjNWZlXCIifSwicGhvbmUiOiI5NjU2NDY0MTIzOCIsImFjY291bnRUeXBlIjoiR3JvdXBDb250cm9sIiwicm9sZXMiOlsiQWRtaW4iXSwidXNlcklkIjoiNjA1YWJmYTYxNDZiMmIzNTczOGE0OGYyIiwiaWF0IjoxNzM5MjU4MTM3LCJleHAiOjE3NDE4NTAxMzd9.HkSgNPN_nOWM8p1e3weDJTTpWNOXvGCS41FzGnTC6X4",
  },
  body: JSON.stringify({}),
  redirect: "follow",
};

const showroomRequestOptions: RequestInit = {
  method: "GET",
  headers: {
    "Origin": "https://app.crm-cherry.alg-dev.ispgnet.com",
    "Referer": "https://app.crm-cherry.alg-dev.ispgnet.com",
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDVhYmZhNjE0NmIyYjM1NzM4YTQ4ZjIiLCJuYW1lIjoiQWxnaGFuaW0gU3RhZmYiLCJlbWFpbCI6ImFkbWluQGFsZ2hhbmltLmNvbSIsImF2YXRhciI6eyJfaWQiOiI2NzllMTA0ODNjNjAzMTU2NTU1NWE0OTMiLCJmaWVsZG5hbWUiOiJmaWxlIiwib3JpZ2luYWxuYW1lIjoiZG93bmxvYWQucG5nIiwiZW5jb2RpbmciOiI3Yml0IiwibWltZXR5cGUiOiJpbWFnZS9wbmciLCJzaXplIjo1NDk0LCJidWNrZXQiOiJhbGdoYW5pbS1jaGV2ZXJvbGV0LWRldi1zMyIsImtleSI6IjE3MDEwNzg4NjEyNTMvOWU1OTI5NzgtZTNlNC00NzYxLWFiODUtMDFhZmRkOGFmY2FkLWRvd25sb2FkLnBuZyIsImFjbCI6InByaXZhdGUiLCJjb250ZW50VHlwZSI6ImltYWdlL3BuZyIsInN0b3JhZ2VDbGFzcyI6IlNUQU5EQVJEIiwibG9jYXRpb24iOiJodHRwczovL2FsZ2hhbmltLWNoZXZlcm9sZXQtZGV2LXMzLnMzLmV1LXdlc3QtMi5hbWF6b25hd3MuY29tLzE3MDEwNzg4NjEyNTMvOWU1OTI5NzgtZTNlNC00NzYxLWFiODUtMDFhZmRkOGFmY2FkLWRvd25sb2FkLnBuZyIsImV0YWciOiJcImIyYTdiY2UzYjNlYTFkMjllZmE4MWY2ZGIyZDJjNWZlXCIifSwicGhvbmUiOiI5NjU2NDY0MTIzOCIsImFjY291bnRUeXBlIjoiR3JvdXBDb250cm9sIiwicm9sZXMiOlsiQWRtaW4iXSwidXNlcklkIjoiNjA1YWJmYTYxNDZiMmIzNTczOGE0OGYyIiwiaWF0IjoxNzM5MjU4MTM3LCJleHAiOjE3NDE4NTAxMzd9.HkSgNPN_nOWM8p1e3weDJTTpWNOXvGCS41FzGnTC6X4",
  },
  redirect: "follow",
};

export const fetchModels = async (showroomId: string) => {
    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
  
      if (!data?.data) throw new Error("No data found");
  
      const uniqueModels = new Map();
  
      data.data.forEach((vehicle: any) => {
        const modelId = vehicle.vehicleModel._id;
  
        if (!uniqueModels.has(modelId) && vehicle.showroom._id === showroomId) {
          uniqueModels.set(modelId, {
            _id: modelId,
            modelCode: vehicle.vehicleModel.modelCode,
            name: vehicle.vehicleModel.name,
            year: vehicle.vehicleModel.year, // Include the year property
          });
        }
      });
  
      return Array.from(uniqueModels.values());
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  };
  
  export const fetchVariants = async (modelId: string, showroomId: string) => {
    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
  
      if (!data?.data) throw new Error("No data found");
  
      const uniqueVariants = new Map();
  
      data.data.forEach((vehicle: any) => {
        if (vehicle.vehicleModel._id === modelId && vehicle.showroom._id === showroomId) {
          const variantId = vehicle._id;
  
          if (!uniqueVariants.has(variantId)) {
            uniqueVariants.set(variantId, {
              _id: variantId,
              variantCode: vehicle.vehicleVariant.variantCode,
              name: vehicle.vehicleVariant.name,
            });
          }
        }
      });
  
      return Array.from(uniqueVariants.values());
    } catch (error) {
      console.error("Error fetching variants:", error);
      return [];
    }
  };
  
  export const fetchShowrooms = async () => {
    try {
      const response = await fetch(SHOWROOM_API_URL, showroomRequestOptions);
      const data = await response.json();
  
      if (!data?.data) throw new Error("No data found");
  
      return data.data.map((showroom: any) => ({
        _id: showroom._id,
        title: showroom.title,
      }));
    } catch (error) {
      console.error("Error fetching showrooms:", error);
      return [];
    }
  };
  