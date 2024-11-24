import { PrismaClient } from '@prisma/client';
import { generateResponse } from './aiService.js';

const prisma = new PrismaClient();

export async function processYelpLead(businessId, customerData) {
  const { name, email, message } = customerData;

  try {
    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        businessId,
        customerName: name,
        email,
        message,
        source: 'YELP',
        status: 'NEW'
      }
    });

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        messages: {
          create: {
            content: message,
            sender: 'CUSTOMER'
          }
        }
      }
    });

    // Generate AI response
    const aiResponse = await generateResponse(lead.id, message);

    // Add AI response to conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse,
        sender: 'AI'
      }
    });

    // Update lead status
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'RESPONDED' }
    });

    return lead;
  } catch (error) {
    console.error('Lead processing error:', error);
    throw new Error('Failed to process lead');
  }
}