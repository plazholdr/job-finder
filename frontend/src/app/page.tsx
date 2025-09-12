export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-white rounded-lg p-2">
                <span className="text-gray-900 font-bold text-sm">Hi</span>
              </div>
              <span className="ml-3 text-xl font-bold text-white">hireup</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/jobs" className="text-gray-300 hover:text-white transition-colors font-medium">Jobs</a>
              <a href="/companies" className="text-gray-300 hover:text-white transition-colors font-medium">Companies</a>
              <a href="/community" className="text-gray-300 hover:text-white transition-colors font-medium">Community</a>
              <a href="/pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="/blog" className="text-gray-300 hover:text-white transition-colors font-medium">Blog</a>
              <a href="/auth/login" className="text-gray-300 hover:text-white transition-colors font-medium">Login</a>
              <a href="/auth/register" className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg transition-colors font-medium">
                Post a job
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gray-900 pt-20 pb-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
              <span className="mr-2">✨</span>
              Introducing hireup v1.3
              <span className="ml-2">→</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The future of working is remote
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Push back turn require you to murder your children we've bootstrapped the
              model, nor we need to build it so that it scales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <a href="/jobs" className="bg-green-500 hover:bg-green-600 text-black text-lg px-8 py-4 rounded-lg transition-colors inline-flex items-center font-medium">
                <span className="mr-2">🔍</span>
                Find a job
              </a>
              <a href="/companies" className="bg-gray-700 hover:bg-gray-600 text-white text-lg px-8 py-4 rounded-lg transition-colors font-medium">
                Hire talent
              </a>
            </div>
          </div>

          {/* Floating Job Cards */}
          <div className="relative">
            {/* Left Column */}
            <div className="absolute left-0 top-0 space-y-6">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">🔄</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Linear user flow</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-4">👥 3 roles available</span>
                      <span>💰 7 benefits</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both the dog...
                </p>
                <div className="flex gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">productivity</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">management</span>
                </div>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Typefully</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-4">👥 2 roles available</span>
                      <span>💰 6 benefits</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both the dog...
                </p>
              </div>
            </div>

            {/* Center Cards */}
            <div className="flex justify-center space-x-6">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-600 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">🎨</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-lg">🔷</span>
                    <span className="text-blue-500 text-lg">💎</span>
                    <span className="text-blue-600 text-lg">🔹</span>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">211 Designer Jobs</h3>
                <p className="text-gray-400 text-sm">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both th...
                </p>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-gray-600 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">💻</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 text-lg">🔴</span>
                    <span className="text-yellow-400 text-lg">🟡</span>
                    <span className="text-blue-400 text-lg">🔵</span>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">89 Developer Jobs</h3>
                <p className="text-gray-400 text-sm">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both th...
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="absolute right-0 top-0 space-y-6">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">🎬</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Loom, video recording</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-4">👥 5 roles available</span>
                      <span>💰 7 benefits</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both the dog...
                </p>
                <div className="flex gap-2">
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">productivity</span>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">meeting</span>
                </div>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-80">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-500 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Hubspot</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-4">👥 5 roles available</span>
                      <span>💰 7 benefits</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Reinvigorate the team knowledge process outsourcing. Fire up your browser both the dog...
                </p>
              </div>
            </div>

            {/* Bottom Center - Afterpay */}
            <div className="flex justify-center mt-20">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 w-96">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 rounded-lg p-2 mr-3">
                    <span className="text-white text-sm">💳</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Afterpay</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <span className="mr-4">👥 7 roles available</span>
                      <span className="mr-4">💰 9 benefits</span>
                      <span>👥 100-500 employees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-gray-400 text-lg font-medium">
            World's best companies are hiring on hireup
          </p>
        </div>
      </section>

      {/* Company Logos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">afterpay</div>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">attentive</div>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">gumroad</div>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">pipedrive</div>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">splunk</div>
            </div>
            <div className="flex justify-center">
              <div className="text-gray-400 font-bold text-lg">webflow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Just these easy steps to land on<br />your first remote job
            </h2>
          </div>

          {/* Mobile App Mockup */}
          <div className="flex justify-center mb-20">
            <div className="relative">
              {/* Phone Frame */}
              <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-white rounded-2xl w-80 h-96 overflow-hidden">
                  {/* Phone Screen Content */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 h-full p-6 flex flex-col">
                    <div className="text-center mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Register to hire up</h3>
                      <p className="text-sm text-gray-600">It's totally free! You can just register if you're new on hire up</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <span className="text-blue-600 text-sm">📧</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-sm text-gray-500">Enter your email</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-lg p-2">
                          <span className="text-green-600 text-sm">🔒</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-500">Create password</p>
                        </div>
                      </div>
                    </div>

                    <button className="bg-blue-600 text-white rounded-xl py-3 font-medium">
                      Sign up
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-20 top-10 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <span className="text-purple-600 text-sm">📄</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Upload resume</p>
                    <p className="text-xs text-gray-500">PDF, DOC</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-20 top-32 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-lg p-2">
                    <span className="text-green-600 text-sm">🎯</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Find your dream job</p>
                    <p className="text-xs text-gray-500">Remote positions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore 3,500 companies that<br />provides remote jobs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Startups</h3>
              <p className="text-gray-600 mb-4">Join innovative startups and help build the future</p>
              <a href="/companies?type=startup" className="text-blue-600 font-medium hover:underline">Explore startups →</a>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Top Companies</h3>
              <p className="text-gray-600 mb-4">Work with industry leaders and established brands</p>
              <a href="/companies?type=enterprise" className="text-blue-600 font-medium hover:underline">View top companies →</a>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scale-ups</h3>
              <p className="text-gray-600 mb-4">Be part of fast-growing companies making an impact</p>
              <a href="/companies?type=scaleup" className="text-blue-600 font-medium hover:underline">Find scale-ups →</a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tech Companies</h3>
              <p className="text-gray-600 mb-4">Join cutting-edge technology companies</p>
              <a href="/companies?type=tech" className="text-blue-600 font-medium hover:underline">Browse tech jobs →</a>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-pink-600 text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Agencies</h3>
              <p className="text-gray-600 mb-4">Express your creativity with design-focused companies</p>
              <a href="/companies?type=creative" className="text-blue-600 font-medium hover:underline">Explore creative roles →</a>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Science</h3>
              <p className="text-gray-600 mb-4">Work with data-driven companies and analytics teams</p>
              <a href="/companies?type=data" className="text-blue-600 font-medium hover:underline">View data roles →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            What we offer you as remote<br />job finder platform
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Everything you need to find and land your perfect remote job
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-600 rounded-xl p-6 mb-4">
                <span className="text-white text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">JOB SEARCH MADE SIMPLE</h3>
              <p className="text-gray-400 text-sm">Advanced filters and AI-powered matching to find your perfect role</p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 rounded-xl p-6 mb-4">
                <span className="text-white text-3xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">EASY APPLICATION PROCESS</h3>
              <p className="text-gray-400 text-sm">Apply to multiple jobs with one click using your saved profile</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 rounded-xl p-6 mb-4">
                <span className="text-white text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">DIRECT CHAT WITH RECRUITER</h3>
              <p className="text-gray-400 text-sm">Connect directly with hiring managers and get instant feedback</p>
            </div>
          </div>

          <a href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg transition-colors inline-block">
            Get Started
          </a>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hear what our beloved<br />customer said
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">John Doe</h4>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"Found my dream remote job within 2 weeks! The platform is incredibly user-friendly and the job matching is spot on."</p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">SM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah Miller</h4>
                  <p className="text-sm text-gray-500">Product Designer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"The direct chat feature with recruiters made the whole process so much smoother. Highly recommend!"</p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold">MJ</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mike Johnson</h4>
                  <p className="text-sm text-gray-500">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"Best remote job platform I've used. Great companies, easy application process, and excellent support team."</p>
              <div className="flex text-yellow-400">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a href="/testimonials" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors">
              Read more reviews
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm">Latest and important info via</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">About</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/about" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="/careers" className="hover:text-blue-600 transition-colors">Careers</a></li>
                <li><a href="/press" className="hover:text-blue-600 transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/help" className="hover:text-blue-600 transition-colors">Help</a></li>
                <li><a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a></li>
                <li><a href="/faq" className="hover:text-blue-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms</a></li>
                <li><a href="/cookies" className="hover:text-blue-600 transition-colors">Cookies</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/blog" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="/guides" className="hover:text-blue-600 transition-colors">Guides</a></li>
                <li><a href="/tools" className="hover:text-blue-600 transition-colors">Tools</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/investors" className="hover:text-blue-600 transition-colors">Investors</a></li>
                <li><a href="/partners" className="hover:text-blue-600 transition-colors">Partners</a></li>
                <li><a href="/api" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Social</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/twitter" className="hover:text-blue-600 transition-colors">Twitter</a></li>
                <li><a href="/linkedin" className="hover:text-blue-600 transition-colors">LinkedIn</a></li>
                <li><a href="/github" className="hover:text-blue-600 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-blue-600 rounded-lg p-2 mr-3">
                <span className="text-white font-bold text-sm">🎯</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Hire</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Hire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
