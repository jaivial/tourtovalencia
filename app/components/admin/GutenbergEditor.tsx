import { useEffect, useState } from "react";
import type { GutenbergEditorValue } from "./GutenbergEditor.client";

export type { GutenbergEditorValue } from "./GutenbergEditor.client";

type GutenbergEditorProps = {
  initialBlocks: any[];
  onChange: (value: GutenbergEditorValue) => void;
};

export default function GutenbergEditor(props: GutenbergEditorProps) {
  const [EditorComponent, setEditorComponent] = useState<
    ((props: GutenbergEditorProps) => JSX.Element) | null
  >(null);

  useEffect(() => {
    let mounted = true;
    import("./GutenbergEditor.client").then((mod) => {
      if (mounted) {
        setEditorComponent(() => mod.default);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!EditorComponent) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
        Cargando editor...
      </div>
    );
  }

  return <EditorComponent {...props} />;
}
