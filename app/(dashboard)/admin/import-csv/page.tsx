'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('batchSize', '100');

      const response = await fetch('/api/projects/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.results);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Failed to upload CSV file');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Projects from CSV</h1>
        <p className="text-muted-foreground mt-2">
          Upload your CSV file containing student projects to import them into the gallery
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV File Requirements</CardTitle>
          <CardDescription>
            Your CSV should include the following columns (flexible naming):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Supported Column Names:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code className="bg-gray-100 px-1">title</code> - Project title (required)</li>
                <li>• <code className="bg-gray-100 px-1">abstract</code> - Project description</li>
                <li>• <code className="bg-gray-100 px-1">year</code> - Completion year</li>
                <li>• <code className="bg-gray-100 px-1">country</code> - Student's country</li>
                <li>• <code className="bg-gray-100 px-1">award</code> - Awards received</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Also Accepted (flexible):</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code className="bg-gray-100 px-1">description</code> / <code className="bg-gray-100 px-1">summary</code></li>
                <li>• <code className="bg-gray-100 px-1">student_name</code> / <code className="bg-gray-100 px-1">author</code></li>
                <li>• <code className="bg-gray-100 px-1">email</code> / <code className="bg-gray-100 px-1">student_email</code></li>
                <li>• <code className="bg-gray-100 px-1">category</code> - Auto-detected from award</li>
                <li>• <code className="bg-gray-100 px-1">thumbnail</code> / <code className="bg-gray-100 px-1">image</code></li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Example CSV format:</strong> title,year,country,abstract,award
              <br />
              <strong>Categories auto-detected:</strong> CREATIVE, TECHNICAL, RESEARCH, SOCIAL_IMPACT, ENTREPRENEURIAL, LEADERSHIP
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Select your CSV file to begin importing projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileUp className="h-12 w-12 text-gray-400" />
              <div>
                <p className="font-medium">
                  {file ? file.name : 'Click to select CSV file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : 'Maximum file size: 50MB'}
                </p>
              </div>
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Importing... This may take several minutes
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Import Projects
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Import Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-700">{result.total}</p>
                <p className="text-sm text-muted-foreground">Total Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{result.imported}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{result.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-sm mb-2">Errors:</p>
                <div className="bg-white border border-orange-200 rounded p-3 max-h-40 overflow-y-auto">
                  {result.errors.map((err: string, idx: number) => (
                    <p key={idx} className="text-xs text-orange-700 mb-1">
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => (window.location.href = '/gallery')}
              className="w-full mt-4"
            >
              View Gallery
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
