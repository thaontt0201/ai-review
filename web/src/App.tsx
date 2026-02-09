import { useState } from "react";
import { INITIAL_CODE } from "./constants";
import CodeForm from "./CodeForm";
import FeedbackForm from "./FeedbackForm";
import { type AxiosError } from "axios";
import { trpc } from "./utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, isLoading, login, logout } = useAuth();
  const [code, setCode] = useState(INITIAL_CODE);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const codeSubmit = useMutation(trpc.submitCode.mutationOptions());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code,
        language: "javascript",
        modelName: "llama3.2",
      };
      const res = await codeSubmit.mutateAsync(payload);
      const data = res;
      const message = data?.feedback || "No feedback received.";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <header className="max-w-3xl mx-auto px-6 mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          AI-Powered Code Reviewer
        </h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Login with Google
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        <hr className="mb-8 border-gray-200" />

        {user ? (
          <>
            <CodeForm
              handleSubmit={handleSubmit}
              code={code}
              setCode={setCode}
              loading={loading}
            />
            <FeedbackForm feedback={feedback} />
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Please log in to continue
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in with your Google account to use the AI Code Reviewer.
            </p>
            <button
              onClick={login}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Login with Google
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
