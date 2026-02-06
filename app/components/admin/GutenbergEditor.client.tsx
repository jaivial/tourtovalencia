import { useEffect, useState } from "react";
import {
  BlockEditorProvider,
  BlockList,
  WritingFlow,
  ObserveTyping,
  BlockTools,
  BlockEditorKeyboardShortcuts,
} from "@wordpress/block-editor";
import { serialize } from "@wordpress/blocks";
import { SlotFillProvider } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { initGutenberg } from "~/utils/gutenberg-init.client";

export type GutenbergEditorValue = {
  blocks: any[];
  html: string;
};

type GutenbergEditorProps = {
  initialBlocks: any[];
  onChange: (value: GutenbergEditorValue) => void;
};

export default function GutenbergEditorClient({ initialBlocks, onChange }: GutenbergEditorProps) {
  const [blocks, setBlocks] = useState<any[]>(initialBlocks || []);

  useEffect(() => {
    initGutenberg();
  }, []);

  useEffect(() => {
    setBlocks(initialBlocks || []);
  }, [initialBlocks]);

  useEffect(() => {
    const html = serialize(blocks);
    onChange({ blocks, html });
  }, [blocks, onChange]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <SlotFillProvider>
        <BlockEditorProvider
          value={blocks}
          onInput={setBlocks}
          onChange={setBlocks}
          settings={{ hasFixedToolbar: true }}
        >
          <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
            {__("Editor de contenido")}
          </div>
          <BlockTools>
            <WritingFlow>
              <ObserveTyping>
                <div className="min-h-[420px] px-4 py-6">
                  <BlockList />
                </div>
              </ObserveTyping>
            </WritingFlow>
          </BlockTools>
          <BlockEditorKeyboardShortcuts />
        </BlockEditorProvider>
      </SlotFillProvider>
    </div>
  );
}
