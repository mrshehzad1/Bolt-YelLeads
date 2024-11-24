import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Conversation } from '../types';

function Conversations() {
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      // Placeholder for API call
      return [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
      
      <div className="grid gap-6">
        {conversations?.map((conversation) => (
          <div
            key={conversation.id}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="space-y-4">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'business' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'business'
                        ? 'bg-blue-600 text-white'
                        : message.sender === 'ai'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Conversations;