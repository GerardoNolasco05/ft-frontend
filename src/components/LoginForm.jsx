import { useState } from "react";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`You entered: ${form.email}, ${form.password}`);
    setForm({ email: "", password: "" });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-6 sm:p-8">
        <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-200 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-25 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-200 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-25 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 text-white font-medium py-2.5 hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
