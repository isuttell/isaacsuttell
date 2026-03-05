'use client';

import type { ForwardedRef } from 'react';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  linkDialogPlugin,
  linkPlugin,
  imagePlugin,
  codeBlockPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertCodeBlock,
  InsertThematicBreak,
  ListsToggle,
  DiffSourceToggleWrapper,
  Separator,
} from '@mdxeditor/editor';
import { basicDark } from 'cm6-theme-basic-dark';
import '@mdxeditor/editor/style.css';

export default function MDXEditorInitialized({
  editorRef,
  diffMarkdown,
  imageUploadHandler,
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  diffMarkdown?: string;
  imageUploadHandler?: (image: File) => Promise<string>;
} & Omit<MDXEditorProps, 'editorRef'>) {
  return (
    <MDXEditor
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        linkDialogPlugin(),
        linkPlugin(),
        imagePlugin({ imageUploadHandler }),
        codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
        diffSourcePlugin({
          viewMode: 'rich-text',
          diffMarkdown: diffMarkdown ?? '',
          codeMirrorExtensions: [basicDark],
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles />
              <CodeToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <InsertTable />
              <InsertCodeBlock />
              <InsertThematicBreak />
              <ListsToggle options={['bullet', 'number', 'check']} />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
      {...props}
      className={`dark-theme ${props.className ?? ''}`}
      ref={editorRef}
    />
  );
}
