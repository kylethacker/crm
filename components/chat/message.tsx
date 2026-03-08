'use client';

import type { UIMessage } from 'ai';
import { Streamdown, type AnimateOptions } from 'streamdown';
import { code } from '@streamdown/code';
import { ToolInvocation } from './tool-invocation';

const plugins = { code };

const animateOptions: AnimateOptions = {
  animation: 'fadeIn',
  duration: 300,
  sep: 'word',
};

type MessageItemProps = {
  message: UIMessage;
  isStreaming?: boolean;
};

function isToolPart(part: UIMessage['parts'][number]): part is Extract<
  UIMessage['parts'][number],
  { toolCallId: string }
> {
  return 'toolCallId' in part;
}

export function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    const text = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text)
      .join('');

    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
        <span className="text-xs font-medium text-white dark:text-neutral-900">
          AI
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-3 pt-0.5">
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            if (!part.text) return null;
            return (
              <div key={`${part.type}-${i}`} className="text-sm leading-relaxed">
                <Streamdown
                  mode={isStreaming ? 'streaming' : 'static'}
                  animated={isStreaming ? animateOptions : false}
                  caret={isStreaming ? 'block' : undefined}
                  plugins={plugins}
                >
                  {part.text}
                </Streamdown>
              </div>
            );
          }

          if (isToolPart(part)) {
            return <ToolInvocation key={part.toolCallId} part={part} />;
          }

          return null;
        })}
      </div>
    </div>
  );
}
