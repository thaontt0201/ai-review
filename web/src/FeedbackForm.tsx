import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FeedbackForm: React.FC<{ feedback: string }> = ({ feedback }) => {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        GPT-Based Feedback
      </h2>
      <div className="p-4 border border-gray-200 rounded-lg bg-white text-gray-700 min-h-[72px]">
        {feedback ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, children, ...props }) {
                return inline ? (
                  <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre
                    className="bg-gray-100 p-3 rounded overflow-auto text-sm"
                    {...props}
                  >
                    <code>{children}</code>
                  </pre>
                );
              },
              a({ children, href, ...props }) {
                return (
                  <a
                    className="text-blue-600 hover:underline break-words"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              p({ children }) {
                return <p className="mb-2">{children}</p>;
              },
            }}
          >
            {feedback}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-400">
            Feedback will appear here after you submit your code.
          </p>
        )}
      </div>
    </section>
  );
};
export default FeedbackForm;
