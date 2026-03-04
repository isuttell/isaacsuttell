'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';

const Editor = dynamic(() => import('./mdx-editor-initialized'), {
  ssr: false,
});

type WrapperProps = Omit<MDXEditorProps, 'editorRef'> & {
  diffMarkdown?: string;
  imageUploadHandler?: (image: File) => Promise<string>;
};

export const MDXEditorWrapper = forwardRef<MDXEditorMethods, WrapperProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
));

MDXEditorWrapper.displayName = 'MDXEditorWrapper';
