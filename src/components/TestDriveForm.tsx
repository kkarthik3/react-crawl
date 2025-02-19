import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { X } from "lucide-react";
import { fetchModels, fetchShowrooms, fetchVariants } from "../services/api";

interface TestDriveFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

export interface Showroom {
  id: string;
  title: string;
}

export interface Model {
  id: string;
  name: string;
  modelCode: string;
  year: number; // Include the year property
}

export interface Vehicle {
  id: string;
  name: string;
  modelId: string;
  variantCode: string;
}

export interface TestDriveFormData {
  branch: string;
  testDriveLocation: "showroom" | "customer";
  enableOvernightTestdrive: boolean;
  date: Date;
  startTime: string;
  endTime: string;
  model: string;
  vehicle: string;
}

export const api = {
  async getModels(showroomId: string): Promise<Model[]> {
    const models = await fetchModels(showroomId);
    return models.map((model) => ({
      id: model._id,
      name: model.name,
      modelCode: model.modelCode,
      year: model.year, // Include the year property
    }));
  },

  async getVehicles(modelId: string, showroomId: string): Promise<Vehicle[]> {
    const variants = await fetchVariants(modelId, showroomId);
    return variants.map((variant) => ({
      id: variant._id,
      name: variant.name,
      modelId,
      variantCode: variant.variantCode,
    }));
  },

  async getShowrooms(): Promise<Showroom[]> {
    const showrooms = await fetchShowrooms();
    return showrooms.map((showroom: Showroom) => ({
      id: showroom._id,
      name: showroom.title,
    }));
  },
};

const generateTimeSlots = () => {
  const slots = [];
  let hour = 9;
  let minute = 0;

  while (hour < 24) {
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timeString = `${displayHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;
    slots.push(timeString);

    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }

    if (hour === 23 && minute === 30) break;
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const TestDriveForm: React.FC<TestDriveFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<TestDriveFormData>({
    branch: "",
    testDriveLocation: "showroom",
    enableOvernightTestdrive: false,
    date: new Date(),
    startTime: "",
    endTime: "",
    model: "",
    vehicle: "",
  });

  const { data: models } = useQuery({
    queryKey: ["models", formData.branch],
    queryFn: () => api.getModels(formData.branch),
    enabled: !!formData.branch,
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles", formData.model, formData.branch],
    queryFn: () => api.getVehicles(formData.model, formData.branch),
    enabled: !!formData.model && !!formData.branch,
  });

  const { data: showrooms } = useQuery({
    queryKey: ["showrooms"],
    queryFn: api.getShowrooms,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedModel = models?.find((model) => model.id === formData.model);
    const selectedVehicle = vehicles?.find(
      (vehicle) => vehicle.id === formData.vehicle
    );
    const selectedShowroom = showrooms?.find(
      (showroom) => showroom.id === formData.branch
    );

    if (!selectedModel || !selectedVehicle || !selectedShowroom) {
      console.error("Invalid selection");
      return;
    }

    const startDateTime = parse(
      formData.startTime,
      "hh:mm a",
      new Date(formData.date)
    );
    const endDateTime = parse(
      formData.endTime,
      "hh:mm a",
      new Date(formData.date)
    );

    const payload = {
      startTime: format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      endTime: format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      modelCode: selectedModel.modelCode,
      modelID: selectedModel.id,
      modelYear: selectedModel.year, // Include the year property
      variantCode: selectedVehicle.variantCode,
      vehicle: selectedVehicle.id,
      showroomID: selectedShowroom.id,
    };

    console.log("Payload:", payload);
    onSubmit(payload);
  };

  const handleCancel = () => {
    onCancel();
    console.log("Form cancelled");
  };

  const filterEndTimeSlots = () => {
    if (!formData.startTime) return timeSlots;
    const [startHour, startMinute] = formData.startTime.split(":").map(Number);
    return timeSlots.filter((time) => {
      const [endHour, endMinute] = time.split(":").map(Number);
      return (
        endHour > startHour ||
        (endHour === startHour && endMinute > startMinute)
      );
    });
  };

  return (
    <div className="max-w-72 p-2 space-y-1 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold px-4">Schedule a test drive</h1>
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col space-y-2 px-2 py-2"
      >
        {/* Branch Selection */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Branch</label>
          <select
            value={formData.branch}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                branch: e.target.value,
                model: "",
                vehicle: "",
              }))
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs"
          >
            <option value="">Select Branch</option>
            {showrooms?.map((branch: Showroom) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Test Drive Date */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Test Drive Date
          </label>
          <input
            type="date"
            value={format(formData.date, "yyyy-MM-dd")}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                date: new Date(e.target.value),
              }))
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs"
          />
        </div>

        {/* Start & End Time in One Row */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Start Time
            </label>
            <select
              value={formData.startTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startTime: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs"
            >
              <option value="">Start</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">
              End Time
            </label>
            <select
              value={formData.endTime}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endTime: e.target.value }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs"
            >
              <option value="">End</option>
              {filterEndTimeSlots().map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Model</label>
          <select
            value={formData.model}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                model: e.target.value,
                vehicle: "",
              }))
            }
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs"
          >
            <option value="">Select Model</option>
            {models?.map((model: Model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Vehicle</label>
          <select
            value={formData.vehicle}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, vehicle: e.target.value }))
            }
            disabled={!formData.model}
            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Vehicle</option>
            {vehicles?.map((vehicle: Vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
        >
          Book Test drive
        </button>
      </form>
    </div>
  );
};

export default TestDriveForm;
