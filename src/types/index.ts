export interface Lead {
  id: string;
  businessId: string;
  customerName: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'responded' | 'closed';
  source: 'yelp' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  sender: 'business' | 'customer' | 'ai';
  timestamp: string;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  isActive: boolean;
}

export interface BusinessMetrics {
  totalLeads: number;
  responseRate: number;
  averageResponseTime: number;
  conversionRate: number;
}