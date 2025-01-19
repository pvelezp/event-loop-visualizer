import { Eye, PauseCircle, PlayCircle, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import CodeDisplay from "./code-snippet";

const defaultCode = `console.log("Start");
setTimeout(() => {
  console.log("Timeout");
}, 0);
Promise.resolve().then(() => {
  console.log("Promise");
});
console.log("End");`;

const stepDescriptions = [
  "Ready to start code",
  "Global Execution Context is created and pushed to the Call Stack",
  "console.log('Start') is pushed to the Call Stack",
  "console.log('Start') is popped off the Call Stack after execution",
  "setTimeout is processed and its callback is sent to Browser APIs",
  "Promise is processed and its callback is queued in Microtask Queue",
  "console.log('End') is pushed to the Call Stack",
  "console.log('End') is popped off the Call Stack after execution",
  "Promise callback is pushed to Call Stack from Microtask Queue",
  "Promise callback is popped off the Call Stack after execution",
  "setTimeout callback is pushed to Call Stack from Callback Queue",
  "setTimeout callback is popped off the Call Stack after execution",
  "Global Execution Context is popped off the Call Stack - program complete",
];

const contextColors = {
  "Global Execution Context": "bg-indigo-900 border-indigo-500",
  'console.log("Start")': "bg-green-900 border-green-500",
  'console.log("End")': "bg-green-900 border-green-500",
  "Promise callback": "bg-purple-900 border-purple-500",
  "setTimeout callback": "bg-blue-900 border-blue-500",
};

const JsRuntimeVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [callStack, setCallStack] = useState([]);
  const [microtaskQueue, setMicrotaskQueue] = useState([]);
  const [callbackQueue, setCallbackQueue] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [lookingAt, setLookingAt] = useState("stack");

  const resetState = () => {
    setStep(0);
    setCallStack([]);
    setMicrotaskQueue([]);
    setCallbackQueue([]);
    setConsoleOutput([]);
    setIsPlaying(false);
    setLookingAt("stack");
  };

  useEffect(() => {
    if (!isPlaying) return;

    const steps = [
      // Step 0: Initial state
      () => {
        setCallStack(["Global Execution Context"]);
        setLookingAt("stack");
      },
      // Step 1: console.log("Start")
      () => {
        setCallStack(['console.log("Start")', "Global Execution Context"]);
        setConsoleOutput((prev) => [...prev, "Start"]);
        setLookingAt("stack");
      },
      // Step 2: Pop console.log("Start")
      () => {
        setCallStack(["Global Execution Context"]);
        setLookingAt("stack");
      },
      // Step 3: setTimeout callback added to callback queue
      () => {
        setCallbackQueue((prev) => [
          ...prev,
          'setTimeout(() => console.log("Timeout"))',
        ]);
        setLookingAt("callback");
      },
      // Step 4: Promise callback added to microtask queue
      () => {
        setMicrotaskQueue((prev) => [
          ...prev,
          'Promise.then(() => console.log("Promise"))',
        ]);
        setLookingAt("microtask");
      },
      // Step 5: console.log("End")
      () => {
        setCallStack(['console.log("End")', "Global Execution Context"]);
        setConsoleOutput((prev) => [...prev, "End"]);
        setLookingAt("stack");
      },
      // Step 6: Pop console.log("End")
      () => {
        setCallStack(["Global Execution Context"]);
        setLookingAt("microtask");
      },
      // Step 7: Execute Promise (microtask)
      () => {
        setCallStack(["Promise callback", "Global Execution Context"]);
        setMicrotaskQueue([]);
        setConsoleOutput((prev) => [...prev, "Promise"]);
        setLookingAt("stack");
      },
      // Step 8: Pop Promise callback
      () => {
        setCallStack(["Global Execution Context"]);
        setLookingAt("callback");
      },
      // Step 9: Execute setTimeout callback
      () => {
        setCallStack(["setTimeout callback", "Global Execution Context"]);
        setCallbackQueue([]);
        setConsoleOutput((prev) => [...prev, "Timeout"]);
        setLookingAt("stack");
      },
      // Step 10: Pop setTimeout callback
      () => {
        setCallStack(["Global Execution Context"]);
        setLookingAt("stack");
      },
      // Step 11: Pop Global Execution Context
      () => {
        setCallStack([]);
        setLookingAt("stack");
      },
    ];

    const timer = setTimeout(() => {
      if (step < steps.length) {
        steps[step]();
        setStep(step + 1);
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  const renderCallStack = (items) => (
    <div className="relative h-96 w-full">
      <div className="absolute inset-0 border-2 border-gray-600 rounded-lg bg-gray-800/50 backdrop-blur">
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Call Stack Empty
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2">
          {items.reverse().map((item, index) => (
            <div
              key={index}
              className={`transform transition-all duration-500 ease-out
                ${contextColors[item] || "bg-gray-700 border-gray-400"}
                border-2 rounded p-3 text-sm font-mono text-white
                shadow-lg relative
                ${index > 0 ? "-mt-1" : ""}`}
              style={{
                transform: `translateY(${-index * 2}px)`,
                zIndex: items.length - index,
              }}
            >
              {item}
              {index < items.length - 1 && (
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-black/20 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQueue = (title, items, bgColor, isActive) => (
    <div className="mb-4 w-full">
      <h3 className="text-gray-300 font-semibold mb-2">{title}</h3>
      <div
        className={`${bgColor} p-4 rounded-lg h-32  transition-all duration-500 border 
        ${
          isActive
            ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
            : "border-gray-700"
        }`}
      >
        {items.length === 0 && (
          <div className="text-gray-500 text-center  h-24 grid place-items-center">
            Queue Empty
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-orange-800 p-2 mb-2 rounded shadow-lg animate-fade-in text-gray-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-900 text-gray-100 h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            JavaScript Runtime Visualizer
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isPlaying ? (
                <PauseCircle className="w-5 h-5" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={resetState}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <CodeDisplay code={defaultCode} />
        </div>

        <div className="text-center mb-6 p-2 bg-gray-800 rounded-md border border-gray-700">
          <p className="text-lg text-indigo-300 font-medium">
            {stepDescriptions[step] || "Visualization complete"}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-6">
          <div className="col-span-3">
            <div className="text-gray-300 font-semibold mb-2">Call Stack</div>
            {renderCallStack(callStack.slice().reverse())}

            <div className="mt-4">
              <h3 className="text-gray-300 font-semibold mb-2">
                Console Output
              </h3>
              <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono min-h-48 border border-gray-700">
                {consoleOutput.length === 0 && (
                  <div className="text-gray-500">No output yet</div>
                )}
                {consoleOutput.map((output, index) => (
                  <div key={index} className="animate-fade-in">
                    &gt; {output}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <Eye
                className={`w-8 h-8 text-indigo-400 transition-all duration-500 ${
                  lookingAt === "stack"
                    ? "transform -translate-y-4"
                    : lookingAt === "microtask"
                    ? "transform translate-x-4"
                    : "transform translate-x-4 translate-y-4"
                }`}
              />
              <span className="text-sm text-gray-400">Event Loop</span>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-gray-800 flex flex-col gap-5 p-4 rounded-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Browser APIs
              </h2>
              {renderQueue(
                "Microtask Queue (Higher Priority)",
                microtaskQueue,
                "bg-gray-800",
                lookingAt === "microtask"
              )}
              {renderQueue(
                "Callback Queue",
                callbackQueue,
                "bg-gray-800",
                lookingAt === "callback"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsRuntimeVisualizer;
