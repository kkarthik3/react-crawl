"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import { v4 as uuidv4 } from "uuid";

interface Message {
  type: "text" | "cars" | "form" | "vehicleVariants" | "compareVariant";
  content: string | null;
  sender: "user" | "bot";
  recommendations?: string[];
  vehicleVariants?: string[] | VehicleVariant[];
  metadata?: string[];
  compare_variant?: CompareVariant[];
}

interface Car {
  brand: string;
  variant: string;
  model: string;
  imageSrc: string;
  price: number;
}

interface VehicleVariant {
  _id: string;
  variant: string;
  brand: string;
  model: string;
  price: number;
  imageSrc: string;
}

interface CompareVariant {
  _id: string;
  brand: string;
  model: string;
  variant: string;
  price: string;
  imageSrc: string;
}

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 bg-gray-200 rounded-lg p-3 max-w-[80px]">
    <div className="typing-dot"></div>
    <div className="typing-dot animation-delay-200"></div>
    <div className="typing-dot animation-delay-400"></div>
  </div>
);

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
  const [cars, setCars] = useState<Car[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputEnabled, setInputEnabled] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });

  const sessionId = useRef(uuidv4());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const callChatAPI = async (message: string) => {
    const response = await fetch(
      `https://interim-cab-module-api.ispgnet.com/chat/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          session_id: sessionId.current,
        }),
      }
    );

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

      if (
        data.vehiclevariants &&
        ((Array.isArray(data.vehiclevariants) &&
          data.vehiclevariants.length > 0) ||
          (typeof data.vehiclevariants === "string" &&
            data.vehiclevariants !== "[]"))
      ) {
        if (Array.isArray(data.vehiclevariants)) {
          setMessages((prev) => [
            ...prev,
            {
              type: "vehicleVariants",
              content: null,
              sender: "bot",
              vehicleVariants: data.vehiclevariants,
            },
          ]);
        } else if (typeof data.vehiclevariants === "string") {
          const variants: VehicleVariant[] = JSON.parse(data.vehiclevariants);
          setMessages((prev) => [
            ...prev,
            {
              type: "cars",
              content: null,
              sender: "bot",
              vehicleVariants: variants,
            },
          ]);
        }
      } else if (data.compare_variant && data.compare_variant.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: "compareVariant",
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
              "I'm sorry, I couldn't find any specific vehicle variants for that query.",
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
            car: cars[currentCarIndex]?.brand || "Default Car",
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
          content: `Thank you ${name}! We'll contact you at ${email} about the ${cars[currentCarIndex]?.brand}.`,
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

  const renderVehicleVariantButtons = (variants: string[]) => {
    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {variants.map((variant, index) => (
          <button
            key={index}
            onClick={() => handleSendMessage(variant)}
            className="bg-gray-200 text-black py-2 px-4 rounded text-sm 
                      border border-black 
                      hover:bg-gray-300 hover:border-gray-700 
                      transition-all duration-200 ease-in-out"
          >
            {variant}
          </button>
        ))}
      </div>
    );
  };

  const renderVehicleCard = (variant: VehicleVariant) => {
    return (
      <div className="w-full bg-white text-black shadow-lg rounded-xl">
        <div className="p-4">
          <img
            src={variant.imageSrc}
            alt={variant.model}
            className="w-full h-40 object-cover mb-2 bg-gray-200 rounded-lg"
          />
          <h2 className="font-semibold text-base">{variant.model}</h2>
          <h3 className="font-medium text-base">Variant : {variant.variant}</h3>
          <p>Price: {variant.price}</p>
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

  const renderVehicleCards = (variants: VehicleVariant[]) => {
    return (
      <div className="relative w-[80%]">
        <div className="flex overflow-x-hidden">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentCarIndex * 100}%)` }}
            >
              {renderVehicleCard(variant)}
            </div>
          ))}
        </div>
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
    );
  };

  const renderCompareVariantTable = (variants: CompareVariant[]) => {
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Features</th>
              {variants.map((variant, index) => (
                <th key={variant._id} className="py-2 px-4 border-b">
                  {variant.variant}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="py-2 px-4 border-b">Model</td>
              {variants.map((variant) => (
                <td key={`${variant._id}-model`} className="py-2 px-4 border-b">
                  {variant.model}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Variant</td>
              {variants.map((variant) => (
                <td
                  key={`${variant._id}-variant`}
                  className="py-2 px-4 border-b"
                >
                  {variant.variant}
                </td>
              ))}
            </tr>
            <tr className="bg-gray-50">
              <td className="py-2 px-4 border-b">Price</td>
              {variants.map((variant) => (
                <td key={`${variant._id}-price`} className="py-2 px-4 border-b">
                  {variant.price}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 px-4 border-b">Image</td>
              {variants.map((variant) => (
                <td key={`${variant._id}-image`} className="py-2 px-4 border-b">
                  <img
                    src={variant.imageSrc}
                    alt={`${variant.brand} ${variant.model}`}
                    className="w-64 h-16 object-cover"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
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
                  {msg.type === "vehicleVariants" &&
                    msg.vehicleVariants &&
                    renderVehicleVariantButtons(
                      msg.vehicleVariants as string[]
                    )}
                  {msg.type === "cars" &&
                    msg.vehicleVariants &&
                    renderVehicleCards(msg.vehicleVariants as VehicleVariant[])}
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
                  {msg.type === "compareVariant" &&
                    msg.compare_variant &&
                    renderCompareVariantTable(msg.compare_variant)}
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
