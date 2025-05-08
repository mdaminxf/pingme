'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState('');
  const [goto, setGoto] = useState(false);


  // Custom login handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
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
        <h2 className="text-3xl font-semibold text-gray-700 mb-6 text-center">Sign In</h2>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC] focus:border-[#8A56AC]"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full p-3 mt-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56AC] focus:border-[#8A56AC]"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600 ml-2">Remember me</label>
            </div>
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">Forgot password?</a>
          </div>

          <motion.button
            type="submit"
            className="w-full p-3 mt-4 bg-zinc-600 text-white rounded-lg hover:bg-[#8A56AC] focus:outline-none focus:ring-2 focus:ring-[#8A56AC]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-4 border-t-transparent border-white mt-1 rounded-full"
                />
              </div>
            ) : 'Log In'}
          </motion.button>

          <div className="text-center text-gray-500">
            <span>----------- OR -----------</span>
            <br />
            {!goto ? (
                <Link
                  href="/auth/signup"
                  onClick={() => setGoto(true)}
                  className="text-lg text-gray-700 font-semibold underline underline-offset-2"
                >
                  Create an account
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
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
