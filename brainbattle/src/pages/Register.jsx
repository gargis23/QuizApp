import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';
import { authAPI } from '../api/api';

const Register = () => {
  const navigate = useNavigate();
  const { setUser, darkMode } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: ''
  });
  const [errors, setErrors] = useState({});
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const generateCaptcha = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch(operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
    }
    
    setCaptchaQuestion(`${num1} ${operation} ${num2} = ?`);
    setCaptchaAnswer(answer.toString());
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.captcha) {
      newErrors.captcha = 'Please solve the captcha';
    } else if (formData.captcha !== captchaAnswer) {
      newErrors.captcha = 'Captcha answer is incorrect';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (errors.captcha) {
        generateCaptcha();
        setFormData({...formData, captcha: ''});
      }
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authAPI.register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);

        // Redirect to home
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
      generateCaptcha();
      setFormData({...formData, captcha: ''});
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  /*
  // const handleGoogleSignIn = useGoogleLogin({
  //   onSuccess: async (tokenResponse) => {
  //     setIsLoading(true);
  //     try {
  //       // Get user info from Google
  //       const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
  //         headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
  //       });
  //       const userInfo = await userInfoResponse.json();

  //       // Send to backend
  //       const response = await authAPI.googleAuth({
  //         name: userInfo.name,
  //         email: userInfo.email,
  //         picture: userInfo.picture,
  //         googleId: userInfo.sub
  //       });

  //       if (response.data.success) {
  //         localStorage.setItem('token', response.data.data.token);
  //         localStorage.setItem('user', JSON.stringify(response.data.data.user));
  //         setUser(response.data.data.user);
  //         navigate('/');
  //       }
  //     } catch (error) {
  //       console.error('Google sign-in error:', error);
  //       setApiError(error.response?.data?.message || 'Google sign-in failed');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   },
  //   onError: () => {
  //     setApiError('Google sign-in failed');
  //   }
  // });
  */

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return darkMode ? 'bg-red-500' : 'bg-red-400';
    if (passwordStrength < 4) return darkMode ? 'bg-yellow-500' : 'bg-yellow-400';
    return darkMode ? 'bg-green-500' : 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return 'Weak';
    if (passwordStrength < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className={`rounded-2xl p-8 w-full max-w-md ${
        darkMode 
          ? 'glassy' 
          : 'bg-white/90 border border-purple-200 shadow-xl'
      }`}>
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600'
          }`}>
            <span className="text-white font-bold text-2xl">BB</span>
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Join BrainBattle
          </h2>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Create your account and start battling
          </p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
            <p className="text-red-400 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                errors.name 
                  ? 'border-red-500 focus:border-red-400' 
                  : (darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                errors.email 
                  ? 'border-red-500 focus:border-red-400' 
                  : (darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                errors.password 
                  ? 'border-red-500 focus:border-red-400' 
                  : (darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
              }`}
              placeholder="Create a password"
              disabled={isLoading}
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Password strength:
                  </span>
                  <span className={`font-semibold ${
                    passwordStrength < 2 ? 'text-red-400' : 
                    passwordStrength < 4 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 mt-1 ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:border-red-400' 
                  : (darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
              }`}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Security Verification
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-3 rounded-lg flex-1 ${
                darkMode ? 'glassy' : 'bg-purple-50 border border-purple-200'
              }`}>
                <span className={`font-mono text-lg ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {captchaQuestion}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  generateCaptcha();
                  setFormData({...formData, captcha: ''});
                }}
                className={`p-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500'
                    : 'bg-purple-100 hover:bg-purple-200'
                }`}
                disabled={isLoading}
              >
                🔄
              </button>
            </div>
            <input
              type="text"
              name="captcha"
              value={formData.captcha}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                errors.captcha 
                  ? 'border-red-500 focus:border-red-400' 
                  : (darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
              }`}
              placeholder="Enter the answer"
              disabled={isLoading}
            />
            {errors.captcha && <p className="text-red-400 text-sm mt-1">{errors.captcha}</p>}
          </div>

          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="terms"
              className={`rounded mt-1 ${
                darkMode 
                  ? 'border-gray-600 text-purple-600 focus:ring-purple-500'
                  : 'border-purple-300 text-purple-600 focus:ring-purple-500'
              }`}
              required
            />
            <label htmlFor="terms" className={`ml-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              I agree to the{' '}
              <button type="button" className={`transition-colors ${
                darkMode 
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-purple-600 hover:text-purple-700'
              }`}>
                Terms of Service
              </button>
              {' '}and{' '}
              <button type="button" className={`transition-colors ${
                darkMode 
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-purple-600 hover:text-purple-700'
              }`}>
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 py-3 rounded-lg font-semibold text-lg text-white transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                darkMode ? 'border-gray-600' : 'border-purple-200'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${
                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
              }`}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            {/* Google OAuth button commented out
            <button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full inline-flex justify-center items-center py-3 px-4 border rounded-lg shadow-sm font-medium transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'border-purple-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
            */}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className={`font-medium transition-colors ${
                darkMode
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              Go to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;