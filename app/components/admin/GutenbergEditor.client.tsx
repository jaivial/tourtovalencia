import { useEffect, useState, useCallback } from "react";
import {
  BlockEditorProvider,
  BlockList,
  WritingFlow,
  ObserveTyping,
  BlockTools,
  BlockEditorKeyboardShortcuts,
  BlockInspector,
  Inserter,
  BlockToolbar,
  __experimentalListView as ListView,
} from "@wordpress/block-editor";
import { serialize } from "@wordpress/blocks";
import {
  SlotFillProvider,
  Popover,
  Button,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { undo as undoIcon, redo as redoIcon, plus, drawerRight, listView } from "@wordpress/icons";
import { ShortcutProvider } from "@wordpress/keyboard-shortcuts";
import { initGutenberg } from "~/utils/gutenberg-init.client";

export type GutenbergEditorValue = {
  blocks: any[];
  html: string;
};

type GutenbergEditorProps = {
  initialBlocks: any[];
  onChange: (value: GutenbergEditorValue) => void;
};

function EditorToolbar({
  showSidebar,
  onToggleSidebar,
  showListView,
  onToggleListView,
}: {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showListView: boolean;
  onToggleListView: () => void;
}) {
  const { hasUndo, hasRedo } = useSelect(
    (select: any) => ({
      hasUndo: select("core/block-editor").hasUndo(),
      hasRedo: select("core/block-editor").hasRedo(),
    }),
    []
  );
  const { undo, redo } = useDispatch("core/block-editor");

  return (
    <div className="gutenberg-toolbar">
      <div className="gutenberg-toolbar__left">
        <Inserter
          rootClientId={undefined}
          position="bottom right"
          __experimentalIsQuick={false}
          renderToggle={({ onToggle, disabled }: any) => (
            <Button
              icon={plus}
              label={__("Añadir bloque")}
              onClick={onToggle}
              disabled={disabled}
              className="gutenberg-toolbar__inserter-toggle"
            />
          )}
        />
        <Button
          icon={undoIcon}
          label={__("Deshacer")}
          disabled={!hasUndo}
          onClick={() => undo()}
          className="gutenberg-toolbar__button"
        />
        <Button
          icon={redoIcon}
          label={__("Rehacer")}
          disabled={!hasRedo}
          onClick={() => redo()}
          className="gutenberg-toolbar__button"
        />
        <Button
          icon={listView}
          label={__("Vista de lista")}
          isPressed={showListView}
          onClick={onToggleListView}
          className="gutenberg-toolbar__button"
        />
      </div>
      <div className="gutenberg-toolbar__center">
        <BlockToolbar hideDragHandle />
      </div>
      <div className="gutenberg-toolbar__right">
        <Button
          icon={drawerRight}
          label={__("Configuración")}
          isPressed={showSidebar}
          onClick={onToggleSidebar}
          className="gutenberg-toolbar__button"
        />
      </div>
    </div>
  );
}

export default function GutenbergEditorClient({
  initialBlocks,
  onChange,
}: GutenbergEditorProps) {
  const [blocks, setBlocks] = useState<any[]>(initialBlocks || []);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showListView, setShowListView] = useState(false);

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

  const handleToggleSidebar = useCallback(
    () => setShowSidebar((v) => !v),
    []
  );
  const handleToggleListView = useCallback(
    () => setShowListView((v) => !v),
    []
  );

  return (
    <div className="gutenberg-editor-wrapper">
      <ShortcutProvider>
        <SlotFillProvider>
          <BlockEditorProvider
            value={blocks}
            onInput={setBlocks}
            onChange={setBlocks}
            settings={{
              hasFixedToolbar: true,
              __experimentalFeatures: {
                color: {
                  palette: {
                    default: [
                      { name: "Black", slug: "black", color: "#000000" },
                      { name: "White", slug: "white", color: "#ffffff" },
                      { name: "Primary", slug: "primary", color: "#0073aa" },
                      { name: "Secondary", slug: "secondary", color: "#23282d" },
                      { name: "Accent", slug: "accent", color: "#00a0d2" },
                      { name: "Light Gray", slug: "light-gray", color: "#f1f1f1" },
                    ],
                  },
                  gradients: {
                    default: [
                      {
                        name: "Vivid cyan blue to vivid purple",
                        gradient: "linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)",
                        slug: "vivid-cyan-blue-to-vivid-purple",
                      },
                      {
                        name: "Light green cyan to vivid green cyan",
                        gradient: "linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)",
                        slug: "light-green-cyan-to-vivid-green-cyan",
                      },
                    ],
                  },
                },
                typography: {
                  fontSizes: {
                    default: [
                      { name: "Small", slug: "small", size: "13px" },
                      { name: "Normal", slug: "normal", size: "16px" },
                      { name: "Medium", slug: "medium", size: "20px" },
                      { name: "Large", slug: "large", size: "24px" },
                      { name: "Huge", slug: "huge", size: "36px" },
                    ],
                  },
                },
              },
            } as any}
          >
            <EditorToolbar
              showSidebar={showSidebar}
              onToggleSidebar={handleToggleSidebar}
              showListView={showListView}
              onToggleListView={handleToggleListView}
            />

            <div className="gutenberg-editor-body">
              {showListView && (
                <div className="gutenberg-list-view">
                  <div className="gutenberg-list-view__header">
                    <strong>{__("Vista de lista")}</strong>
                    <Button
                      icon="no-alt"
                      label={__("Cerrar")}
                      onClick={handleToggleListView}
                      size="small"
                    />
                  </div>
                  <ListView />
                </div>
              )}

              <div className="gutenberg-content-area">
                <BlockTools>
                  <WritingFlow>
                    <ObserveTyping>
                      <div className="gutenberg-canvas">
                        <BlockList />
                      </div>
                    </ObserveTyping>
                  </WritingFlow>
                </BlockTools>
              </div>

              {showSidebar && (
                <div className="gutenberg-sidebar">
                  <div className="gutenberg-sidebar__header">
                    <strong>{__("Bloque")}</strong>
                    <Button
                      icon="no-alt"
                      label={__("Cerrar")}
                      onClick={handleToggleSidebar}
                      size="small"
                    />
                  </div>
                  <div className="gutenberg-sidebar__content">
                    <BlockInspector />
                  </div>
                </div>
              )}
            </div>

            <BlockEditorKeyboardShortcuts />
            <Popover.Slot />
          </BlockEditorProvider>
        </SlotFillProvider>
      </ShortcutProvider>
    </div>
  );
}
