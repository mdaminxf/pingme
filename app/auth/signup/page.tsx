'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [goto, setGoto] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== cpassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, cpassword }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/auth/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Sign Up</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700">Username</label>
            <input
              id="name"
              type="text"
              required
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              required
              placeholder="********"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC]"
            />
          </div>
          <div>
            <label htmlFor="cfpassword" className="block text-sm text-gray-700">Re-enter Password</label>
            <input
              id="cfpassword"
              type="password"
              required
              placeholder="********"
              onChange={(e) => setCpassword(e.target.value)}
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC]"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full p-2 mt-4 bg-zinc-600 text-white rounded-lg hover:bg-[#8A56AC] focus:outline-none focus:ring-2 focus:ring-[#8A56AC] disabled:opacity-70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-4 border-t-transparent border-white rounded-full"
                />
              </div>
            ) : (
              'Sign Up'
            )}
          </motion.button>

          <div className="text-center text-gray-500 mt-4">
            <span>------------OR------------</span>
            <br />
            <span>
              {!goto ? (
                <Link  
                  href="/auth/login"
                  onClick={() => setGoto(true)}
                  className="text-lg text-gray-700 font-semibold underline underline-offset-2"
                >
                  Already have an account
                </Link>
              ) : (
                <div className="flex justify-center items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-6 h-6 border-4 border-t-transparent border-[#8A56AC] mt-1 rounded-full"
                  />
                </div>
              )}
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
