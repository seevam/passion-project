'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Lightbulb, Target, Heart, Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  {
    icon: <Lightbulb className="h-5 w-5" />,
    label: 'Help me brainstorm project ideas',
    prompt: 'I need help brainstorming creative project ideas that align with my interests and goals.',
  },
  {
    icon: <Target className="h-5 w-5" />,
    label: 'Create a project plan',
    prompt: 'Can you help me create a detailed plan for my project, including milestones and tasks?',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    label: 'I\'m feeling stuck',
    prompt: 'I\'m feeling stuck with my project. Can you help me get unstuck and stay motivated?',
  },
];

function MessageContent({ content, role }: { content: string; role: 'user' | 'assistant' }) {
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers (lines starting with #)
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className={cn("mt-4 mb-2 text-base font-bold", role === 'user' ? 'text-white' : 'text-gray-900')}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className={cn("mt-4 mb-2 text-lg font-bold", role === 'user' ? 'text-white' : 'text-gray-900')}>
            {line.replace('## ', '')}
          </h2>
        );
      }

      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="my-1.5 flex items-start gap-2">
            <span className={cn("font-bold", role === 'user' ? 'text-white' : 'text-primary-600')}>
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }

      // Bullet points
      if (/^[-•*]/.test(line.trim())) {
        return (
          <div key={index} className="my-1 flex items-start gap-2">
            <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full",
              role === 'user' ? 'bg-white' : 'bg-primary-500'
            )}></span>
            <span className="flex-1">{line.replace(/^[-•*]\s*/, '')}</span>
          </div>
        );
      }

      // Bold text (basic **text** support)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="my-2">
            {parts.map((part, i) => (
              i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : <span key={i}>{part}</span>
            ))}
          </p>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        return <p key={index} className="my-2 leading-relaxed">{line}</p>;
      }

      return <div key={index} className="h-2" />;
    });
  };

  return <div className="text-sm">{formatMessage(content)}</div>;
}

function MessageBubble({ message, onCopy }: { message: Message; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        message.role === 'user' ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg',
          message.role === 'user'
            ? 'bg-gradient-to-br from-primary-500 to-primary-600 ring-2 ring-primary-200'
            : 'bg-gradient-to-br from-secondary-500 via-purple-500 to-accent-500 ring-2 ring-secondary-200'
        )}
      >
        {message.role === 'user' ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex max-w-[90%] flex-col gap-1.5 md:max-w-[80%]')}>
        <div
          className={cn(
            'group relative rounded-2xl px-4 py-3 shadow-md transition-shadow hover:shadow-lg',
            message.role === 'user'
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              : 'bg-white text-gray-900 ring-1 ring-gray-200'
          )}
        >
          <MessageContent content={message.content} role={message.role} />

          {/* Copy button for AI messages */}
          {message.role === 'assistant' && (
            <button
              onClick={handleCopy}
              className={cn(
                'absolute right-2 top-2 rounded-lg bg-gray-100 p-1.5 text-gray-600 transition-all',
                'opacity-0 hover:bg-gray-200 hover:text-gray-900 group-hover:opacity-100',
                copied && 'opacity-100'
              )}
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'px-1 text-xs text-gray-500',
            message.role === 'user' ? 'text-right' : 'text-left'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate a session ID for this conversation
    setSessionId(`session_${Date.now()}`);

    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your AI mentor. I'm here to help you with your passion projects, provide guidance, and support you along the way. What would you like to talk about today?",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
          conversationHistory: messages.slice(-10),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: data.message,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        if (response.status === 401) {
          throw new Error(data.error || 'Please sign in to use the AI mentor.');
        }
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: error instanceof Error
          ? error.message
          : "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex h-full flex-col md:mx-auto md:max-w-5xl">
      {/* Header - Hidden on mobile for full screen chat */}
      <div className="hidden text-center md:block md:mb-6">
        <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 px-6 py-3 shadow-sm">
          <Sparkles className="mr-2 h-5 w-5 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            AI-Powered Mentorship
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">Talk to Your AI Mentor</h1>
        <p className="mt-2 text-base text-muted-foreground lg:text-lg">
          Get personalized guidance, brainstorm ideas, and stay motivated
        </p>
      </div>

      {/* Quick Prompts - Show only when conversation is new */}
      {messages.length <= 1 && (
        <div className="mb-4 grid gap-3 md:mb-6 md:grid-cols-3">
          {QUICK_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt.prompt)}
              className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:scale-[1.02] hover:border-primary-300 hover:shadow-duo active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600 shadow-sm">
                {prompt.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {prompt.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Container - Full screen on mobile */}
      <Card className="flex flex-1 flex-col border-2 shadow-duo md:flex-none">
        {/* Chat Header */}
        <CardHeader className="border-b-2 bg-gradient-to-r from-primary-50 via-secondary-50 to-accent-50 py-3 md:py-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 to-accent-500">
              <Bot className="h-4 w-4 text-white md:h-5 md:w-5" />
            </div>
            <span>AI Mentor Chat</span>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              Online
            </div>
          </CardTitle>
        </CardHeader>

        {/* Messages Container - Flexible height */}
        <CardContent className="flex flex-1 flex-col p-0">
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 via-purple-500 to-accent-500 shadow-lg ring-2 ring-secondary-200">
                    <Zap className="h-5 w-5 animate-pulse text-white" />
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-gray-200">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-400 shadow-sm" style={{ animationDelay: '0s' }}></div>
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-400 shadow-sm" style={{ animationDelay: '0.15s' }}></div>
                      <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent-400 shadow-sm" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form - Sticky at bottom */}
          <div className="border-t-2 bg-white p-3 md:p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 border-2 bg-white text-base transition-all focus-visible:ring-2 focus-visible:ring-primary-500 md:text-sm"
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="shrink-0 gap-2 px-4 shadow-duo transition-all hover:scale-105 active:scale-95 md:px-6"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span className="hidden md:inline">Send</span>
                  </>
                )}
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Press Enter to send • AI responses may vary
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card - Hidden on mobile */}
      <Card className="mt-6 hidden border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white shadow-sm md:block">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-accent-600" />
            Tips for Getting the Most from Your Mentor
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid gap-2 text-sm text-gray-700 md:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-base">💡</span>
              <span>Be specific about your goals and challenges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base">🎯</span>
              <span>Ask for actionable advice and concrete next steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base">📚</span>
              <span>Share context about your project and timeline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-base">🤔</span>
              <span>Don't hesitate to ask follow-up questions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
