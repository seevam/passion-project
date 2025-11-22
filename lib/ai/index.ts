import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize OpenAI (required for idea generation)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
});

// Initialize Anthropic (Claude) - optional
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-placeholder',
});

// Initialize Pinecone lazily for vector search - optional
let _pinecone: Pinecone | null = null;
export const getPinecone = () => {
  if (!_pinecone && process.env.PINECONE_API_KEY) {
    _pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return _pinecone;
};

// Get the index - returns null if Pinecone not configured
export const getVectorIndex = () => {
  const pc = getPinecone();
  if (!pc) return null;
  return pc.index(process.env.PINECONE_INDEX || 'projectlaunch');
};
