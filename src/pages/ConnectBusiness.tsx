import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

function ConnectBusiness() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, user } = useAuthStore();

  const handleYelpLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const yelpEmail = formData.get('yelpEmail') as string;
    const yelpPassword = formData.get('yelpPassword') as string;

    try {
      // Here you would integrate with Yelp's API
      // This is a placeholder for the actual Yelp API integration
      const mockYelpData = {
        businessName: "Sample Business Name",
        yelpId: "sample-yelp-id",
        phone: "(555) 555-5555",
        address: "123 Business St",
        website: "https://example.com"
      };

      // Update the business record in Supabase
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          business_name: mockYelpData.businessName,
          phone: mockYelpData.phone,
          website_url: mockYelpData.website,
          address: mockYelpData.address,
          yelp_api_key: 'sample-api-key' // In real implementation, this would be a proper API key
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local auth state
      setAuth(user?.id || '', {
        ...user!,
        businessName: mockYelpData.businessName
      });

      toast.success('Business connected successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Yelp connection error:', error);
      toast.error(error.message || 'Failed to connect business');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Connect Your Business</h1>

      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Connect with Yelp
        </h2>
        
        <form onSubmit={handleYelpLogin} className="space-y-4">
          <div>
            <label
              htmlFor="yelpEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Yelp Business Email
            </label>
            <input
              type="email"
              id="yelpEmail"
              name="yelpEmail"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="yelpPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Yelp Business Password
            </label>
            <input
              type="password"
              id="yelpPassword"
              name="yelpPassword"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              'Connect with Yelp'
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500">
          By connecting your Yelp business account, you'll be able to manage your leads and responses directly from our platform.
        </p>
      </div>
    </div>
  );
}

export default ConnectBusiness;