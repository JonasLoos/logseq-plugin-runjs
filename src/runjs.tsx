import "@logseq/libs";
import React from "react";

export default function (props: { content: string, uuid: string }) {
  const { content, uuid } = props;
  const elRef = React.useRef(null);
  const [evalOutput, setEvalOutput] = React.useState("");

  React.useEffect(() => {
    const setOutput = (text) => {
      setEvalOutput(text);
      // TODO(meain): allow to do more than just text
      elRef.current.textContent = text;
    };
    const replaceOutput = (text) => {
      logseq.Editor.updateBlock(uuid, text)
    }

    setTimeout(() => {
      // Have to put this in a timeout or LogSeq freaks out
      eval(content);
    }, 100);
  }, []);

  return (
    <>
      {evalOutput ? (
        <div className={"runjs"} ref={elRef} />
      ) : (
        <i>Processing...</i>
      )}
    </>
  );
}
