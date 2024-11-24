import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateResponse(leadId, message) {
  try {
    // Fetch lead and business context
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        business: true,
        conversations: {
          include: {
            messages: true
          }
        }
      }
    });

    // Get business templates
    const templates = await prisma.template.findMany({
      where: {
        businessId: lead.businessId,
        isActive: true
      }
    });

    // Prepare conversation history
    const conversationHistory = lead.conversations[0]?.messages.map(msg => ({
      role: msg.sender.toLowerCase(),
      content: msg.content
    })) || [];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional customer service representative for ${lead.business.businessName}. 
                   Use the following response templates as guidance: ${templates.map(t => t.content).join('\n')}`
        },
        ...conversationHistory,
        { role: "user", content: message }
      ]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI response generation error:', error);
    throw new Error('Failed to generate AI response');
  }
}