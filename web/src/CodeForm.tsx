const CodeForm: React.FC<{
  handleSubmit: (e: React.FormEvent) => void;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
}> = ({ handleSubmit, code, setCode, loading }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Paste Code
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-40 p-4 border border-gray-200 rounded-lg bg-white font-mono text-sm leading-relaxed resize-none shadow-sm"
        />
      </section>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
        aria-busy={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};
export default CodeForm;
