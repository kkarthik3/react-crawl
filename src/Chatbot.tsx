"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Draggable from "react-draggable";
import { Resizable } from "re-resizable";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";


interface Message {
  type: "text" | "cars" | "form";
  content: string | null;
  sender: "user" | "bot";
}

interface Car {
  name: string;
  image: string;
  year: number;
  price: number;
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
  const [showButtons, setShowButtons] = useState(true);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputEnabled, setInputEnabled] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 400, height: 600 });

  // Use sessionId from useRef to maintain consistency
  const sessionId = useRef(uuidv4());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchCarVariants = async () => {
      try {
        const response = await axios.get(
          "https://s3bebicvlnm3dn3clqktisk7he0sgwyp.lambda-url.us-east-1.on.aws/models"
        );
        setCars(Object.values(response.data));
      } catch (error) {
        console.error("Error fetching car variants:", error);
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            content: "Error fetching car variants. Please try again later.",
            sender: "bot",
          },
        ]);
      }
    };

    fetchCarVariants();
  }, []);

  const callChatAPI = async (message: string) => {
    const response = await fetch(`https://interim-cab-module-api.ispgnet.com/chat/`, {
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

    const data = await response.json();
    return data.responses;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { type: "text", content: inputMessage, sender: "user" },
    ]);
    setInputMessage("");

    try {
      const response = await callChatAPI(inputMessage);
      setMessages((prev) => [
        ...prev,
        { type: "text", content: response, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error calling Chat API:", error);
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

  const handleQueryClick = () => {
    setShowButtons(false)
    setInputEnabled(true)
    setMessages((prev) => [
      ...prev,
      {
        type: "text",
        content: "Sure, what would you like to know?",
        sender: "bot",
      },
    ]);
  };

  const handleShowCars = () => {
    setShowButtons(false);
    setMessages((prev) => [
      ...prev,
      { type: "cars", content: null, sender: "bot" },
    ]);
  };

  const handleShowInterest = () => {
    setMessages((prev) => {
      // Check if there's already a form message in the array
      const hasForm = prev.some((message) => message.type === "form");
  
      // If a form message exists, return the array unchanged; otherwise, add a new form message
      if (hasForm) {
        return prev;
      }
  
      return [
        ...prev,
        { type: "form", content: null, sender: "user" },
      ];
    });
  };

  

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://s3bebicvlnm3dn3clqktisk7he0sgwyp.lambda-url.us-east-1.on.aws/saveInterest",
        {
          name,
          email,
          car: cars[currentCarIndex]?.name || "Default Car",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          content: `Thank you ${name}! We'll contact you at ${email} about the ${cars[currentCarIndex]?.name}.`,
          sender: "bot",
        },
      ]);
      setName("");
      setEmail("");
      setShowButtons(true);
      setInputEnabled(false);
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

  return (
    <div className="fixed bottom-4 right-4">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-5 flex items-center rounded-full bg-black text-white py-2 px-4"
        >
          <MessageSquare className="mr-2 h-4 w-4 " /> Chat
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
              <h2 className="text-lg font-semibold text-white">Customer Support</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-gray-200 hover:text-white bg-black transition-colors"
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
                      className={`flex  rounded-lg p-2 max-w-[80%] text-justify ${
                        msg.sender === "user"
                          ? "bg-black text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {msg.type === "cars" &&
                    cars.length > 0 &&
                    cars[currentCarIndex] && (
                      <div className="w-[80%] bg-white text-black shadow-lg rounded-xl ">
                        <div className="p-4">
                          <img
                            src={cars[currentCarIndex].image}
                            alt={cars[currentCarIndex].name}
                            className="w-full h-40 object-cover mb-2 bg-gray-200 rounded-lg"
                          />
                          <h2 className="font-semibold text-base">
                            {cars[currentCarIndex].name}
                          </h2>
                          <h3 className="font-medium text-base">
                            {cars[currentCarIndex].year}
                          </h3>
                        </div>
                        <div className="flex justify-between border-t p-4">
                          <button
                            onClick={() =>
                              setCurrentCarIndex(
                                (prev) => (prev - 1 + cars.length) % cars.length
                              )
                            }
                            className="rounded-full p-2 hover:bg-gray-200 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleShowInterest}
                            className="bg-black text-white py-2 px-4 rounded"
                          >
                            Show Interest
                          </button>
                          <button
                            onClick={() =>
                              setCurrentCarIndex(
                                (prev) => (prev + 1) % cars.length
                              )
                            }
                            className="rounded-full p-2 hover:bg-gray-200 transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  {msg.type === "form" && !isFormSubmitted &&(
                    <form
                      onSubmit={handleSubmitInterest}
                      className="space-y-2 w-[80%] "
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
              {showButtons && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleQueryClick}
                    className="bg-black text-white py-2 px-4 rounded"
                  >
                    Queries
                  </button>
                  <button
                    onClick={handleShowCars}
                    className="bg-black text-white py-2 px-4 rounded"
                  >
                    Show Cars
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {inputEnabled && (
              <div className="p-4 border-t flex space-x-2 rounded-b-xl">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                  className="flex-grow rounded-lg border border-gray-300 p-2"
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-black text-white py-2 px-4 rounded flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="loader"></div>
                  ) : (
                    "Send"
                  )}
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
      `}</style>
    </div>
  );
};

export default CustomerSupportChatbot;