import { useState } from "react";
import { INITIAL_CODE } from "./constants";
import CodeForm from "./CodeForm";
import FeedbackForm from "./FeedbackForm";
import { type AxiosError } from "axios";
import { trpc } from "./utils/trpc";
import { useMutation } from "@tanstack/react-query";

function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const codeSubmit = useMutation(trpc.submitCode.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
      const payload = {
        code,
        language: "javascript",
        modelName: "llama3.2",
      };
      const res = await codeSubmit.mutateAsync(payload);

      const data = res;
      console.log("Received response:", data);
      const message = data?.message?.content || "No feedback received.";

      setFeedback(message);
    } catch (err: unknown) {
      const error = err as AxiosError;
      const serverData = error?.response?.data;
      const msg = serverData
        ? typeof serverData === "string"
          ? serverData
          : JSON.stringify(serverData)
        : (error?.message ?? String(error));
      setFeedback(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <main className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-gray-900">
          AI-Powered Code Reviewer
        </h1>
        <hr className="mt-4 mb-8 border-gray-200" />

        <CodeForm
          handleSubmit={handleSubmit}
          code={code}
          setCode={setCode}
          loading={loading}
        />

        <FeedbackForm feedback={feedback} />
      </main>
    </div>
  );
}
export default App;
