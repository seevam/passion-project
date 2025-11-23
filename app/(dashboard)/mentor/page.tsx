'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Lightbulb, Target, Heart } from 'lucide-react';

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
        <div className="mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 px-6 py-3">
          <Sparkles className="mr-2 h-5 w-5 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            AI-Powered Mentorship
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Talk to Your AI Mentor</h1>
        <p className="mt-2 text-lg text-muted-foreground">
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
              className="flex items-center space-x-3 rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
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
      <Card className="border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-secondary-50">
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2 h-5 w-5 text-primary-600" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] min-h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    message.role === 'user'
                      ? 'bg-primary-500'
                      : 'bg-gradient-to-br from-secondary-400 to-accent-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`mt-2 text-xs ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary-400 to-accent-500">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl bg-gray-100 px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t bg-gray-50 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your projects..."
                disabled={isLoading}
                className="flex-1 border-2 bg-white"
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="lg"
                className="px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              AI responses may not always be perfect. Use your best judgment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5 text-accent-600" />
            Tips for Getting the Most from Your Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">💡</span>
              <span>Be specific about your goals and challenges</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>Ask for actionable advice and concrete next steps</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">📚</span>
              <span>Share context about your project and timeline</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🤔</span>
              <span>Don't hesitate to ask follow-up questions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
