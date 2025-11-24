'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImportMessage {
  message?: string;
  error?: string;
  type?: string;
  progress?: { current: number; total: number };
  stats?: { imported: number; skipped: number };
  results?: any;
}

export default function AdminImportPage() {
  const [token, setToken] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ imported: 0, skipped: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startImport = async () => {
    if (!token.trim()) {
      setError('Please enter the admin token');
      return;
    }

    setIsImporting(true);
    setMessages([]);
    setProgress(0);
    setStats({ imported: 0, skipped: 0 });
    setIsComplete(false);
    setError(null);

    try {
      const response = await fetch('/api/admin/run-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data: ImportMessage = JSON.parse(line.slice(6));

            if (data.error) {
              setError(data.error);
              setMessages(prev => [...prev, `❌ Error: ${data.error}`]);
            } else if (data.message) {
              setMessages(prev => [...prev, data.message]);
            }

            if (data.progress) {
              const progressPercent = (data.progress.current / data.progress.total) * 100;
              setProgress(progressPercent);
            }

            if (data.stats) {
              setStats(data.stats);
            }

            if (data.type === 'complete') {
              setIsComplete(true);
              setProgress(100);
            }
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setMessages(prev => [...prev, `❌ Failed: ${errorMsg}`]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin: Import Projects</h1>
        <p className="text-muted-foreground mt-2">
          One-time import endpoint for bulk project data
        </p>
      </div>

      {/* Security Warning */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Security Notice:</strong> This is a protected endpoint. You need the ADMIN_IMPORT_TOKEN
          from your environment variables. After importing, consider removing this page.
        </AlertDescription>
      </Alert>

      {/* Token Input */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Enter the admin import token (set in ADMIN_IMPORT_TOKEN environment variable)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="token">Admin Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Enter your admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isImporting}
              className="mt-2"
            />
          </div>

          <Button
            onClick={startImport}
            disabled={!token || isImporting || isComplete}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Importing... (This may take 5-10 minutes)
              </>
            ) : isComplete ? (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Import Complete!
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Start Import
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress */}
      {(isImporting || isComplete) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Import Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.imported}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isComplete && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Import successful!</strong> All projects have been imported to the gallery.
            Visit the <a href="/gallery" className="underline font-semibold">Gallery</a> to see them.
          </AlertDescription>
        </Alert>
      )}

      {/* Console Log */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Log</CardTitle>
            <CardDescription>Real-time progress updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm">
              {messages.map((msg, idx) => (
                <div key={idx} className="text-gray-100 mb-1">
                  {msg}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2 text-sm">
          <p><strong>1. Set Environment Variable:</strong></p>
          <code className="block bg-blue-100 p-2 rounded">
            ADMIN_IMPORT_TOKEN=your-secret-token-here
          </code>

          <p className="mt-4"><strong>2. In Vercel:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Go to Project Settings → Environment Variables</li>
            <li>Add: <code className="bg-blue-100 px-1">ADMIN_IMPORT_TOKEN</code></li>
            <li>Value: A secure random string (e.g., use a password generator)</li>
            <li>Redeploy your app</li>
          </ul>

          <p className="mt-4"><strong>3. Run Import:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Enter the token above</li>
            <li>Click "Start Import"</li>
            <li>Wait 5-10 minutes for completion</li>
          </ul>

          <p className="mt-4 font-semibold">⚠️ Security: Remove this page after importing!</p>
        </CardContent>
      </Card>
    </div>
  );
}
