import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface FormPayload {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  civilId: string;
}


interface UserInfoFormProps {
  onSubmit: (formData: FormPayload) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    civilId: "",
  });

  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.firstName || !formData.lastName ||
        !formData.phone || !formData.email) {
      setToast({
        show: true,
        title: "Error",
        message: "Please fill in all mandatory fields",
        type: "error"
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setToast({
        show: true,
        title: "Error",
        message: "Please enter a valid email address",
        type: "error"
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Civil ID validation (12 digits)
    if (formData.civilId && !/^\d{12}$/.test(formData.civilId.replace(/\s/g, ''))) {
      setToast({
        show: true,
        title: "Error",
        message: "Civil ID must be 12 digits",
        type: "error"
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Prepare payload
    const payload: FormPayload = {
      title: formData.title,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      civilId: formData.civilId.replace(/\s/g, ''), // Remove spaces from civil ID
    };

    // Call the onSubmit prop with the form data
    onSubmit(payload);
  };

  const formatCivilId = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g) || [];
    return groups.join(' ');
  };

  return (
    <div className="max-w-72 p-2 space-y-1 bg-white rounded-lg shadow-lg">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white transition-all duration-300 ease-in-out`}>
          <h3 className="font-semibold">{toast.title}</h3>
          <p>{toast.message}</p>
        </div>
      )}

      {/* <div className="max-w-72 p-2 space-y-1 bg-white rounded-lg shadow-lg"> */}
        <div>
          {/* <h2 className="text-center text-xl font-extrabold text-gray-900">
            Personal Information
          </h2> */}
          <h2 className="text-center text-xl font-bold text-gray-900">
          Please fill in your details
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            Please fill in your details
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-0">
            <div>
              <label htmlFor="title" className="text-xs font-medium text-gray-700">Title</label>
              <select
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 rounded-md"
                required
              >
                <option value="">Select title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1">
                <PhoneInput
                  country={"kw"}
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    fontSize: "16px",
                    borderRadius: "0.5rem",
                  }}
                  containerStyle={{
                    width: "100%",
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="civilId" className="block text-sm font-medium text-gray-700">Civil ID</label>
              <input
                id="civilId"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={formData.civilId}
                onChange={(e) => {
                  const formatted = formatCivilId(e.target.value);
                  setFormData({ ...formData, civilId: formatted });
                }}
                maxLength={15}
                placeholder="Enter 12 digit Civil ID"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            Proceed
          </button>
        </form>
      {/* </div> */}
    </div>
  );
};

export default UserInfoForm;
