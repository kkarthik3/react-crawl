"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { v4 as uuidv4 } from "uuid";

interface Message {
  type:
    | "text"
    | "vehicle_models"
    | "vehicleVariants"
    | "variant_information"
    | "compare_variant"
    | "form"
    | "product_recommendation";
  content: string | null;
  sender: "user" | "bot";
  recommendations?: string[];
  vehicle_models?: string[];
  vehicleVariants?: VehicleVariant[];
  variant_information?: VariantInformation[];
  compare_variant?: CompareVariant[];
  product_recommendation?: ProductRecommendation[];
  metadata?: string[];
}

interface VariantInformation {
  // existing properties...
  [key: string]: any; // add this index signature
}

interface VehicleVariant {
  brand: string;
  variant: string;
  model: string;
  engine_type: string;
  transmission: string;
  price_information: number;
  drive: string;
  fuel: string;
  image_src: string;
}

interface ProductRecommendation {
  brand: string;
  model: string;
  variant: string;
  engine_type: string;
  transmission: string;
  price: string;
  drive: string;
  fuel: string;
  image_src: string;
}

interface VariantInformation {
  brand: string;
  model: string;
  variant: string;
  engine_specifications: {
    transmission: string;
    engine_displacement_cc: string;
    power_output_hp: string;
    engine_type: string;
  };
  price_information: {
    ex_showroom_price: number;
    EMI_options: {
      finance_estimate: number;
      estimated_emi_months: string;
    };
  };
  drive: string;
  fuel: string;
  colors: string[];
  image_src: string;
}

interface CompareVariant {
  variant: string;
  details: VariantInformation[];
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 bg-gray-200 rounded-lg p-3 max-w-[80px]">
    <div className="typing-dot"></div>
    <div className="typing-dot animation-delay-200"></div>
    <div className="typing-dot animation-delay-400"></div>
  </div>
);

function greet<T extends string>(message: T): Capitalize<T> {
  // Note: This is just for type demonstration.
  // The actual capitalization needs to be done at runtime.
  return (message.charAt(0).toUpperCase() + message.slice(1)) as Capitalize<T>;
}

const CustomerSupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "text",
      content: "Welcome! How can I assist you today?",
      sender: "bot",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] =
    useState(0);

  const sessionId = useRef(uuidv4());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const callChatAPI = async (message: string) => {
    const response = await fetch(`http://localhost:8000/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
        session_id: sessionId.current,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to call Chat API");
    }
    return await response.json();
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: "text", content: message, sender: "user" },
    ]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const data = await callChatAPI(message);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsTyping(false);

      if (data.vehicle_models && data.vehicle_models.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: "vehicle_models",
            content: null,
            sender: "bot",
            vehicle_models: data.vehicle_models,
          },
        ]);
      } else if (data.vehiclevariants && data.vehiclevariants.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: "vehicleVariants",
            content: null,
            sender: "bot",
            vehicleVariants: data.vehiclevariants,
            product_recommendation: data.product_recommendation,
          },
        ]);
      } else if (
        data.variant_information &&
        data.variant_information.length > 0
      ) {
        setMessages((prev) => [
          ...prev,
          {
            type: "variant_information",
            content: null,
            sender: "bot",
            variant_information: data.variant_information,
          },
        ]);
      } else if (data.compare_variant && data.compare_variant.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: "compare_variant",
            content: null,
            sender: "bot",
            compare_variant: data.compare_variant,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            content:
              data.responses ||
              "I'm sorry, I couldn't find any specific information for that query.",
            sender: "bot",
            recommendations: data.recommendations || [],
            metadata: data.metadata || [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error calling Chat API:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          content: "Sorry, I encountered an error. Please try again later.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowInterest = () => {
    setMessages((prev) => {
      const hasForm = prev.some((message) => message.type === "form");
      if (hasForm) {
        return prev;
      }

      return [...prev, { type: "form", content: null, sender: "user" }];
    });
  };

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://s3bebicvlnm3dn3clqktisk7he0sgwyp.lambda-url.us-east-1.on.aws/saveInterest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            car:
              messages[messages.length - 1].vehicleVariants?.[currentCarIndex]
                ?.model || "Default Car",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save interest");
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          content: `Thank you ${name}! We'll contact you at ${email} about the ${
            messages[messages.length - 1].vehicleVariants?.[currentCarIndex]
              ?.model
          }.`,
          sender: "bot",
        },
      ]);
      setName("");
      setEmail("");
      setInputEnabled(true);
      setIsFormSubmitted(true);
    } catch (error) {
      console.error("Error saving interest:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          content:
            "Sorry, there was an error saving your interest. Please try again later.",
          sender: "bot",
        },
      ]);
    }
  };

  const renderVehicleModelButtons = (models: string[]) => {
    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {models.map((model, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(`Show me variants of ${model}`)}
            className="bg-gray-200 text-black py-2 px-4 rounded text-sm 
                      border border-black 
                      hover:bg-gray-300 hover:border-gray-700 
                      transition-all duration-200 ease-in-out"
          >
            {model}
          </button>
        ))}
      </div>
    );
  };

  const renderVehicleCard = (
    variant: VehicleVariant | ProductRecommendation
  ) => {
    return (
      <div className="w-full bg-white text-black shadow-lg rounded-xl">
        <div className="p-4">
          <img
            src={
              variant.image_src || (variant as ProductRecommendation).image_src
            }
            alt={`${variant.brand} ${variant.model} ${variant.variant}`}
            className="w-full h-40 object-cover mb-2 bg-gray-200 rounded-lg"
          />
          <h2 className="font-semibold text-base">
            {variant.brand} {variant.model}
          </h2>
          <h3 className="font-medium text-base">Variant: {variant.variant}</h3>
          <p>Engine: {variant.engine_type}</p>
          <p>Transmission: {variant.transmission}</p>
          <p>
            Drive: {variant.drive} Fuel: {variant.fuel}
          </p>
          <p>
            Price: ₹
            {(variant as VehicleVariant).price_information?.toLocaleString() ||
              (variant as ProductRecommendation).price}
          </p>
          <button
            onClick={handleShowInterest}
            className="mt-2 w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
          >
            Show Interest
          </button>
        </div>
      </div>
    );
  };

  const renderVehicleCards = (
    variants: VehicleVariant[],
    recommendations: ProductRecommendation[] | undefined
  ) => {
    return (
      <div className="relative w-[80%]">
        {/* Vehicle Variants Carousel */}
        <div className="relative flex overflow-x-hidden">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentCarIndex * 100}%)` }}
            >
              {renderVehicleCard(variant)}
            </div>
          ))}
          {variants.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentCarIndex((prev) =>
                    prev > 0 ? prev - 1 : variants.length - 1
                  )
                }
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full p-2"
                aria-label="Previous car"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() =>
                  setCurrentCarIndex((prev) =>
                    prev < variants.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full p-2"
                aria-label="Next car"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Recommendations Section */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              {showRecommendations
                ? "Hide Recommendations"
                : "View Recommendations"}
            </button>

            {showRecommendations && (
              <div className="relative mt-4">
                {/* Recommendations Carousel */}
                <div className="flex overflow-x-hidden">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-full transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${
                          currentRecommendationIndex * 100
                        }%)`,
                      }}
                    >
                      {renderVehicleCard(recommendation)}
                    </div>
                  ))}
                  {recommendations.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentRecommendationIndex((prev) =>
                            prev > 0 ? prev - 1 : recommendations.length - 1
                          )
                        }
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full p-2"
                        aria-label="Previous recommendation"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentRecommendationIndex((prev) =>
                            prev < recommendations.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full p-2"
                        aria-label="Next recommendation"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderVariantInformationTable = (variantInfo: VariantInformation) => {
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <tbody>
            {Object.entries(variantInfo).map(([key, value]) => {
              if (
                typeof value === "object" &&
                value !== null &&
                key !== "image_src"
              ) {
                return (
                  <React.Fragment key={key}>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b font-bold" colSpan={2}>
                        {key.replace(/_/g, " ").toUpperCase()}
                      </td>
                    </tr>
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <tr key={`${key}-${subKey}`}>
                        <td className="py-2 px-4 border-b font-bold">
                          {greet(subKey.replace(/_/g, " "))}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {typeof subValue === "object" && subValue !== null
                            ? Object.entries(subValue).map(
                                ([subSubKey, subSubValue]) => (
                                  <div key={subSubKey}>{`${subSubKey.replace(
                                    /_/g,
                                    " "
                                  )}: ${subSubValue}`}</div>
                                )
                              )
                            : String(subValue)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              } else if (Array.isArray(value)) {
                return (
                  <tr key={key}>
                    <td className="py-2 px-4 border-b">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 px-4 border-b">{value.join(", ")}</td>
                  </tr>
                );
              } else if (key !== "image_src") {
                return (
                  <tr key={key}>
                    <td className="py-2 px-4 border-b">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 px-4 border-b">{value}</td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
        <div className="mt-4">
          <img
            src={variantInfo.image_src}
            alt={`${variantInfo.brand} ${variantInfo.model} ${variantInfo.variant}`}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    );
  };

  const renderCompareVariantTable = (variants: CompareVariant[]) => {
    if (!variants || variants.length === 0) return null;

    const variantInfo1 = variants[0].details[0];
    const variantInfo2 = variants[1].details[0];

    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <tbody>
            {Object.keys(variantInfo1)
              .filter((key) => key !== "image_src")
              .map((key, index) => {
                if (
                  typeof variantInfo1[key] === "object" &&
                  variantInfo1[key] !== null
                ) {
                  return (
                    <React.Fragment key={key}>
                      <tr className="bg-gray-50">
                        <td
                          className="py-2 px-4 border-b font-bold"
                          colSpan={3}
                        >
                          {key.replace(/_/g, " ").toUpperCase()}
                        </td>
                      </tr>
                      {Object.keys(variantInfo1[key]).map(
                        (subKey, subIndex) => (
                          <tr key={`${key}-${subKey}`}>
                            <td className="py-2 px-4 border-b font-bold">
                              {greet(subKey.replace(/_/g, " "))}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {renderCompareVariantValue(
                                variantInfo1,
                                key,
                                subKey
                              )}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {renderCompareVariantValue(
                                variantInfo2,
                                key,
                                subKey
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  );
                } else if (Array.isArray(variantInfo1[key])) {
                  return (
                    <tr key={key}>
                      <td className="py-2 px-4 border-b">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {variantInfo1[key].join(", ")}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {variantInfo2[key].join(", ")}
                      </td>
                    </tr>
                  );
                } else if (key !== "image_src") {
                  return (
                    <tr key={key}>
                      <td className="py-2 px-4 border-b">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {variantInfo1[key]}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {variantInfo2[key]}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
          </tbody>
        </table>
        <div className="mt-4 flex justify-around">
          {variants.map((variant, index) => (
            <div key={index} className="w-1/3 px-2">
              <img
                src={variant.details[0].image_src}
                alt={`${variant.details[0].brand} ${variant.details[0].model} ${variant.variant}`}
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompareVariantValue = (
    detail: any,
    key: string,
    subKey?: string
  ) => {
    if (subKey) {
      if (
        typeof detail[key][subKey] === "object" &&
        detail[key][subKey] !== null
      ) {
        return Object.keys(detail[key][subKey]).map(
          (subSubKey, subSubIndex) => (
            <div key={subSubKey}>{`${subSubKey.replace(/_/g, " ")}: ${
              detail[key][subKey][subSubKey]
            }`}</div>
          )
        );
      } else {
        return detail[key][subKey];
      }
    } else {
      if (typeof detail[key] === "object" && detail[key] !== null) {
        return Object.keys(detail[key]).map((subKey, subIndex) => (
          <div key={subKey}>{`${subKey.replace(/_/g, " ")}: ${
            detail[key][subKey]
          }`}</div>
        ));
      } else if (Array.isArray(detail[key])) {
        return detail[key].join(", ");
      } else {
        return detail[key];
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-5 flex items-center rounded-full bg-black text-white py-2 px-4"
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Chat
        </button>
      )}
      {isOpen && (
        <Draggable handle=".handle">
          <Resizable
            size={{ width: windowSize.width, height: windowSize.height }}
            minWidth={300}
            minHeight={400}
            maxWidth={500}
            maxHeight={650}
            onResizeStop={(e, direction, ref, d) => {
              setWindowSize({
                width: parseFloat(ref.style.width),
                height: parseFloat(ref.style.height),
              });
            }}
            className="fixed w-80 h-[500px] flex flex-col bg-white text-black shadow-lg rounded-lg"
          >
            <div className="flex justify-between items-center mb-4 p-4 border-b handle bg-black rounded-t-xl">
              <h2 className="text-lg font-semibold text-white">
                Customer Support
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-gray-200 hover:text-white bg-black transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.type === "text" && msg.content && (
                    <div
                      className={`flex flex-col rounded-lg p-2 max-w-[80%] text-justify ${
                        msg.sender === "user"
                          ? "bg-black text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <div>{msg.content}</div>
                      {msg.metadata && msg.metadata.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-blue-500 text-sm">
                            Sources:
                          </span>
                          {msg.metadata.map((item, i) => (
                            <a
                              key={i}
                              href={item}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm"
                            >
                              [{i + 1}]
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {msg.type === "vehicle_models" &&
                    msg.vehicle_models &&
                    renderVehicleModelButtons(msg.vehicle_models)}
                  {msg.type === "vehicleVariants" &&
                    msg.vehicleVariants &&
                    renderVehicleCards(
                      msg.vehicleVariants,
                      msg.product_recommendation
                    )}
                  {msg.type === "variant_information" &&
                    msg.variant_information &&
                    renderVariantInformationTable(msg.variant_information[0])}
                  {msg.type === "compare_variant" &&
                    msg.compare_variant &&
                    renderCompareVariantTable(msg.compare_variant)}
                  {msg.type === "form" && !isFormSubmitted && (
                    <form
                      onSubmit={handleSubmitInterest}
                      className="space-y-2 w-[80%]"
                    >
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white text-black p-2"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white text-black p-2"
                      />
                      <button
                        type="submit"
                        className="w-full bg-black text-white py-2 px-4 rounded"
                      >
                        Submit Interest
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              {messages[messages.length - 1]?.sender === "bot" &&
                messages[messages.length - 1]?.recommendations && (
                  <div className="flex flex-wrap justify-end gap-2 mt-2 w-[80%] ml-auto">
                    {messages[messages.length - 1].recommendations?.map(
                      (recommendation, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(recommendation)}
                          className="bg-gray-200 text-black py-1 px-2 rounded text-sm 
                                    border border-black 
                                    hover:bg-gray-300 hover:border-gray-700 
                                    transition-all duration-200 ease-in-out"
                        >
                          {recommendation}
                        </button>
                      )
                    )}
                  </div>
                )}
              <div ref={messagesEndRef} />
            </div>
            {inputEnabled && (
              <div className="p-4 border-t flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-grow rounded-lg border border-gray-300 p-2"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="bg-black text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  Send
                </button>
              </div>
            )}
          </Resizable>
        </Draggable>
      )}
      <style>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #333;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #666;
          border-radius: 50%;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerSupportChatbot;
