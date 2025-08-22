import { useState } from "react";

const initialForm = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  trainingSpeciality: "",
  password: "",
  confirmPassword: "",
};

function RegisterForm() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`You entered: ${form.name} ${form.lastName}, Email: ${form.email}`);
    setForm(initialForm);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-4 sm:p-6">
        <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Last name</label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Email full width */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-200 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Phone full width */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-200 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">City</label>
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Training speciality */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Training speciality</label>
            <input
              name="trainingSpeciality"
              type="text"
              value={form.trainingSpeciality}
              onChange={handleChange}
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-sm bg-white text-gray-900 px-12 py-1 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Button full width */}
          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 text-white font-medium py-2.5 hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
