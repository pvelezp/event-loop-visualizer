import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeDisplay = ({ code }: { code: string }) => {
  return (
    <SyntaxHighlighter
      customStyle={{ borderRadius: "0.4rem", marginBottom: "0rem" }}
      language="javascript"
      style={vscDarkPlus}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeDisplay;
