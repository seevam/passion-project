'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Lightbulb, Target, Heart, Copy, Check } from 'lucide-react';

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

function MessageContent({ content }: { content: string }) {
  // Simple formatting for better readability
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check for numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="my-2 pl-2">
            <span className="font-semibold">{line}</span>
          </div>
        );
      }
      // Check for bullet points
      if (/^[-•*]/.test(line.trim())) {
        return (
          <div key={index} className="my-1 flex items-start">
            <span className="mr-2 text-primary-600">•</span>
            <span>{line.replace(/^[-•*]\s*/, '')}</span>
          </div>
        );
      }
      // Check for bold text (basic **text** support)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="my-2">
            {parts.map((part, i) => (
              i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
            ))}
          </p>
        );
      }
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} className="my-2">{line}</p>;
      }
      return <br key={index} />;
    });
  };

  return <div className="text-sm leading-relaxed">{formatMessage(content)}</div>;
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
      className={`flex items-start gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-md ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-primary-500 to-primary-600'
            : 'bg-gradient-to-br from-secondary-500 to-accent-500'
        }`}
      >
        {message.role === 'user' ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex max-w-[85%] flex-col gap-1 md:max-w-[75%]`}>
        <div
          className={`group relative rounded-2xl px-4 py-3 shadow-sm ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
              : 'bg-white text-gray-900 ring-1 ring-gray-200'
          }`}
        >
          <MessageContent content={message.content} />

          {/* Copy button for AI messages */}
          {message.role === 'assistant' && (
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 hidden rounded-lg bg-gray-100 p-1.5 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 group-hover:block"
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
          className={`px-1 text-xs text-gray-500 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}
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
          conversationHistory: messages.slice(-10), // Last 10 messages for context
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
        // Handle specific error cases
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 px-6 py-3 shadow-sm">
          <Sparkles className="mr-2 h-5 w-5 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            AI-Powered Mentorship
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Talk to Your AI Mentor</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Get personalized guidance, brainstorm ideas, and stay motivated
        </p>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt.prompt)}
              className="flex items-center space-x-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:scale-105 hover:border-primary-300 hover:shadow-duo"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600">
                {prompt.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {prompt.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <Card className="border-2 shadow-duo">
        <CardHeader className="border-b-2 bg-gradient-to-r from-primary-50 to-secondary-50">
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2 h-5 w-5 text-primary-600" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="max-h-[400px] min-h-[400px] overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4 md:max-h-[500px] md:min-h-[500px] md:p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 to-accent-500 shadow-md">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400" style={{ animationDelay: '0.15s' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-accent-400" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Form */}
          <div className="border-t-2 bg-white p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your projects..."
                disabled={isLoading}
                className="flex-1 border-2 bg-white focus-visible:ring-primary-500"
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="shrink-0 px-4 md:px-6"
              >
                <Send className="h-5 w-5" />
                <span className="ml-2 hidden md:inline">Send</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AI responses may not always be perfect. Use your best judgment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-lg">
            <Lightbulb className="mr-2 h-5 w-5 text-accent-600" />
            Tips for Getting the Most from Your Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-base">💡</span>
              <span>Be specific about your goals and challenges</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-base">🎯</span>
              <span>Ask for actionable advice and concrete next steps</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-base">📚</span>
              <span>Share context about your project and timeline</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-base">🤔</span>
              <span>Don't hesitate to ask follow-up questions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
