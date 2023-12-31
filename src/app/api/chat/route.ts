import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const redis = createClient({
    url: "redis://default:sRqVkLkgjZn17ZAU9EPVVcqy5RCrFsJe@redis-11841.c308.sa-east-1-1.ec2.cloud.redislabs.com:11841",
  });

  const redisVectorStore = new RedisVectorStore(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    {
      indexName: "ai-test-index",
      redisClient: redis,
      keyPrefix: "api-test:",
    }
  );

  const openAiChat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
    temperature: 0.3,
  });

  const prompt = new PromptTemplate({
    template: `
        Você responde perguntas sobre a vida profissional de Rafael Odassi.
        Se a resposta não foir encontrada nas transcrições, responda que você não sabe.
        Se possível, inclua exemplos.

        Transcrições:
        {context}
        
        Pergunta:
        {question}
      `.trim(),
    inputVariables: ["context", "question"],
  });

  const chain = RetrievalQAChain.fromLLM(
    openAiChat,
    redisVectorStore.asRetriever(),
    {
      prompt,
    }
  );

  await redis.connect();

  const response = await chain.call({
    query: body.value,
  });

  await redis.disconnect();

  return new NextResponse(response.text);
}
