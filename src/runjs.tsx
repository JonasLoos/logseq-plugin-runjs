import "@logseq/libs";
import React from "react";

async function getBlockFromContent(content: string): any {
  // go though all blocks on the page until a block with the given content is found
  const blocks = [];
  const tree = await logseq.Editor.getCurrentPageBlocksTree();
  blocks.push(...tree);
  while (blocks.length) {
    const block = blocks.pop();
    if (block.content.trim().slice("```\nrunjs".length,-"```".length) == content) return block;
    blocks.push(...block.children);
  }
  throw new Error('Block not found');
}

export default function (props: { content: string }) {
  const { content } = props;
  const elRef = React.useRef(null);
  const [evalOutput, setEvalOutput] = React.useState("");

  React.useEffect(() => {
    const setOutput = (text) => {
      setEvalOutput(text);
      // TODO(meain): allow to do more than just text
      elRef.current.textContent = text;
    };
    const replaceBlock = (text) => {
      // replace the current block with the given text if we are not on a template page
      logseq.Editor.getCurrentPage().then(page => {
        if (!(page && page.name && page.name.trim().toLowerCase().startsWith("template")))
          // TODO: this doesn't work reliably if multiple blocks are equal
          getBlockFromContent(content).then(block => logseq.Editor.updateBlock(block.uuid,text));
        else
          setOutput(`This block will be replaced when the template is applied.`);
      })
    };

    setTimeout(() => {
      // Have to put this in a timeout or LogSeq freaks out
      try {
        eval(content);
      } catch (error) {
        console.error('Error in eval:', error);
        setOutput('Error in execution: ' + error);
      }
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
