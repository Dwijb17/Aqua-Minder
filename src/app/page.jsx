"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

function MainComponent() {
  const [currentPage, setCurrentPage] = useState("splash");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [waterUsage, setWaterUsage] = useState(null);
  const [alertDetails, setAlertDetails] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [token, setToken] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [plumbers, setPlumbers] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [userProfile, setUserProfile] = useState(null);

  // Initialize axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Authentication Functions
  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.token);
      setIsLoggedIn(true);
      setUserProfile(response.data.user);
      setCurrentPage('dashboard');
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      await axios.post('/api/auth/register', userData);
      toast.success('Registration successful! Please login.');
      setCurrentPage('login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Data Fetching Functions
  const fetchDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      setDevices(response.data);
      if (response.data.length > 0 && !selectedDevice) {
        setSelectedDevice(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchWaterUsage = async () => {
    if (!selectedDevice) return;
    try {
      const response = await axios.get(`/api/water-usage/${selectedDevice.device_id}`);
      setWaterUsage(response.data[0]?.total_volume || 0);
    } catch (error) {
      console.error('Failed to fetch water usage:', error);
    }
  };

  const fetchUsageHistory = async () => {
    if (!selectedDevice) return;
    try {
      const response = await axios.get(`/api/water-usage/history?device_id=${selectedDevice.device_id}&period=${selectedPeriod}`);
      setUsageHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch usage history:', error);
    }
  };

  const fetchLeaks = async () => {
    try {
      const response = await axios.get('/api/leaks');
      if (response.data.length > 0) {
        setAlertDetails(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch leaks:', error);
    }
  };

  const fetchPlumbers = async () => {
    try {
      const response = await axios.get('/api/plumbers');
      setPlumbers(response.data);
    } catch (error) {
      console.error('Failed to fetch plumbers:', error);
    }
  };

  // Initial Loading Effect
  useEffect(() => {
    if (currentPage === "splash") {
      const timer = setInterval(() => {
        setLoading((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setCurrentPage("login");
            return 100;
          }
          return prev + 20;
        });
      }, 500);
      return () => clearInterval(timer);
    }
  }, [currentPage]);

  // Data Loading Effect
  useEffect(() => {
    if (isLoggedIn) {
      fetchDevices();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (selectedDevice) {
      fetchWaterUsage();
      fetchUsageHistory();
      fetchLeaks();
    }
  }, [selectedDevice, selectedPeriod]);

  // Component Functions
  const handleBookPlumber = async (bookingData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/bookings/create', {
        ...bookingData,
        leak_id: alertDetails?.id
      });
      setBookingDetails(response.data);
      setCurrentPage('confirmation');
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      setLoading(true);
      await axios.put('/api/users/profile', profileData);
      setUserProfile(prev => ({ ...prev, ...profileData }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Components
  const SplashScreen = () => (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <i className="fas fa-tint text-6xl text-[#2196F3] animate-bounce"></i>
          </div>
          <h1 className="text-4xl font-bold text-[#1976D2] mb-4 font-roboto">
            AquaMinder
          </h1>
          <p className="text-[#424242] text-xl mb-8 font-roboto">
            Detect Leaks, Save Water
          </p>
          <div className="w-64 h-2 bg-[#BBDEFB] rounded-full overflow-hidden">
            <div
                className="h-full bg-[#2196F3] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loading}%` }}
            ></div>
          </div>
        </div>
      </div>
  );

  const LoginScreen = () => (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#1976D2] mb-6 text-center font-roboto">
            Login
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(e.target.email.value, e.target.password.value);
          }}>
            <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 p-2 border rounded"
                name="email"
                required
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full mb-4 p-2 border rounded"
                name="password"
                required
            />
            <button
                type="submit"
                className="w-full bg-[#2196F3] text-white p-2 rounded mb-4"
                //disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <button
              onClick={() => setCurrentPage('register')}
              className="w-full border border-[#2196F3] text-[#2196F3] p-2 rounded"
          >
            Register New Account
          </button>
        </div>
      </div>
  );

  const RegisterScreen = () => (
      <div className="min-h-screen bg-[#E3F2FD] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#1976D2] mb-6 text-center font-roboto">
            Register
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleRegister({
              email: e.target.email.value,
              password: e.target.password.value,
              name: e.target.name.value,
              phone: e.target.phone.value,
              address: e.target.address.value
            });
          }}>
            <input
                type="text"
                placeholder="Full Name"
                className="w-full mb-4 p-2 border rounded"
                name="name"
                required
            />
            <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 p-2 border rounded"
                name="email"
                required
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full mb-4 p-2 border rounded"
                name="password"
                required
            />
            <input
                type="tel"
                placeholder="Phone Number"
                className="w-full mb-4 p-2 border rounded"
                name="phone"
                required
            />
            <textarea
                placeholder="Address"
                className="w-full mb-4 p-2 border rounded"
                name="address"
                required
            ></textarea>
            <button
                type="submit"
                className="w-full bg-[#2196F3] text-white p-2 rounded mb-4"
                //disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <button
              onClick={() => setCurrentPage('login')}
              className="w-full border border-[#2196F3] text-[#2196F3] p-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
  );

  const Dashboard = () => (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#2196F3] text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-roboto">Dashboard</h1>
            <div className="flex items-center gap-4">
              <select
                  onChange={(e) => setSelectedDevice(devices.find(d => d.id === parseInt(e.target.value)))}
                  className="bg-white text-black rounded px-2 py-1"
                  value={selectedDevice?.id || ''}
              >
                {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.device_name}
                    </option>
                ))}
              </select>
              <i
                  onClick={() => setCurrentPage("settings")}
                  className="fas fa-cog text-2xl cursor-pointer"
              ></i>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-xl mb-4 font-roboto">Current Water Usage</h2>
            <div className="text-4xl text-center text-[#1976D2] font-bold mb-2">
              {waterUsage ? `${waterUsage.toFixed(1)}L` : 'Loading...'}
            </div>
            <div className="w-full bg-[#E3F2FD] h-2 rounded-full">
              <div
                  className="bg-[#2196F3] h-full rounded-full"
                  style={{ width: `${(waterUsage / 200) * 100}%` }}
              ></div>
            </div>
          </div>

          {alertDetails && (
              <div className="bg-[#FFEBEE] rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-[#F44336] mr-2"></i>
                  <span className="text-[#F44336] font-bold">
                Leak Detected! ({alertDetails.severity} Severity)
              </span>
                </div>
                <p className="text-sm text-[#F44336] mt-1">
                  Estimated loss: {alertDetails.estimated_loss}L/hour
                </p>
                <button
                    onClick={() => setCurrentPage("alert")}
                    className="mt-2 text-[#F44336] underline"
                >
                  View Details
                </button>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
                onClick={() => {
                  fetchPlumbers();
                  setCurrentPage("plumber");
                }}
                className="bg-white p-4 rounded-lg shadow text-center"
            >
              <i className="fas fa-wrench text-2xl text-[#1976D2] mb-2"></i>
              <div>Book Plumber</div>
            </button>
            <button
                onClick={() => setCurrentPage("history")}
                className="bg-white p-4 rounded-lg shadow text-center"
            >
              <i className="fas fa-history text-2xl text-[#1976D2] mb-2"></i>
              <div>Usage History</div>
            </button>
          </div>
        </div>
      </div>
  );

  const AlertDetails = () => (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#F44336] text-white p-4">
          <div className="flex items-center">
            <i
                onClick={() => setCurrentPage("dashboard")}
                className="fas fa-arrow-left mr-4 text-xl cursor-pointer"
            ></i>
            <h1 className="text-xl font-bold font-roboto">Alert Details</h1>
          </div>
        </div>

        {alertDetails && (
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Leak Detection</h3>
                  <p className="text-gray-600">
                    Detected on: {new Date(alertDetails.detected_at).toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    Severity: {alertDetails.severity}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Leak Details</h3>
                  <p className="text-gray-600">
                    Location: {alertDetails.location}
                  </p>
                  <p className="text-gray-600">
                    Estimated Water Loss: {alertDetails.estimated_loss}L/hour
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Recommended Actions</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Turn off the main water supply</li>
                    <li>Check visible pipes for damage</li>
                    <li>Document any water damage</li>
                    <li>Contact a professional plumber</li>
                  </ul>
                </div>

                <button
                    onClick={() => {
                      fetchPlumbers();
                      setCurrentPage("plumber");
                    }}
                    className="w-full bg-[#F44336] text-white p-3 rounded-lg"
                >
                  Book a Plumber Now
                </button>
              </div>
            </div>
        )}
      </div>
  );

  const PlumberBooking = () => (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#2196F3] text-white p-4">
          <div className="flex items-center">
            <i
                onClick={() => setCurrentPage("dashboard")}
                className="fas fa-arrow-left mr-4 text-xl cursor-pointer"
            ></i>
            <h1 className="text-xl font-bold font-roboto">Book a Plumber</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl mb-4 font-roboto">Available Plumbers</h2>
            {plumbers.map((plumber) => (
                <div
                    key={plumber.id}
                    className="border-b border-gray-200 py-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{plumber.name}</h3>
                      <p className="text-gray-600 text-sm">
                        Experience: {plumber.experience} years
                      </p>
                      <p className="text-gray-600 text-sm">
                        Rating: {plumber.rating}/5
                      </p>
                    </div>
                    <button
                        onClick={() => handleBookPlumber({
                          plumber_id: plumber.id,
                          device_id: selectedDevice.id
                        })}
                        className="bg-[#2196F3] text-white px-4 py-2 rounded"
                    >
                      Book
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );

  const UsageHistory = () => (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#2196F3] text-white p-4">
          <div className="flex items-center">
            <i
                onClick={() => setCurrentPage("dashboard")}
                className="fas fa-arrow-left mr-4 text-xl cursor-pointer"
            ></i>
            <h1 className="text-xl font-bold font-roboto">Usage History</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-roboto">Water Usage</h2>
              <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border rounded px-2 py-1"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div className="h-64">
              {usageHistory.length > 0 ? (
                  <div className="relative h-full">
                    {/* Simple bar chart implementation */}
                    <div className="flex h-full items-end space-x-2">
                      {usageHistory.map((usage, index) => (
                          <div
                              key={index}
                              className="flex-1 bg-[#2196F3] rounded-t"
                              style={{
                                height: `${(usage.volume / Math.max(...usageHistory.map(u => u.volume))) * 100}%`
                              }}
                          >
                            <div className="text-xs text-center mt-2 transform -rotate-45">
                              {usage.date}
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
              ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No usage data available
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  const Settings = () => (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-[#2196F3] text-white p-4">
          <div className="flex items-center">
            <i
                onClick={() => setCurrentPage("dashboard")}
                className="fas fa-arrow-left mr-4 text-xl cursor-pointer"
            ></i>
            <h1 className="text-xl font-bold font-roboto">Settings</h1>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl mb-4 font-roboto">Profile Settings</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProfile({
                name: e.target.name.value,
                email: e.target.email.value,
                phone: e.target.phone.value,
                address: e.target.address.value
              });
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                    type="text"
                    name="name"
                    defaultValue={userProfile?.name}
                    className="w-full p-2 border rounded"
                    required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                    type="email"
                    name="email"
                    defaultValue={userProfile?.email}
                    className="w-full p-2 border rounded"
                    required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone
                </label>
                <input
                    type="tel"
                    name="phone"
                    defaultValue={userProfile?.phone}
                    className="w-full p-2 border rounded"
                    required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <textarea
                    name="address"
                    defaultValue={userProfile?.address}
                    className="w-full p-2 border rounded"
                    required
                ></textarea>
              </div>
              <button
                  type="submit"
                  className="w-full bg-[#2196F3] text-white p-2 rounded"
                  disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="mt-4">
            <button
                onClick={() => {
                  setToken(null);
                  setIsLoggedIn(false);
                  setCurrentPage('login');
                }}
                className="w-full bg-[#F44336] text-white p-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
  );

  // Main Render
  return (
      <>
        {currentPage === "splash" && <SplashScreen />}
        {currentPage === "login" && <LoginScreen />}
        {currentPage === "register" && <RegisterScreen />}
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "alert" && <AlertDetails />}
        {currentPage === "plumber" && <PlumberBooking />}
        {currentPage === "history" && <UsageHistory />}
        {currentPage === "settings" && <Settings />}
      </>
  );
}

export default MainComponent;