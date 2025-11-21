import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Anthropic (Claude)
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Initialize Pinecone for vector search
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the index
export const getVectorIndex = () => {
  return pinecone.index(process.env.PINECONE_INDEX || 'projectlaunch');
};
