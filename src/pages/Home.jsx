import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, TrendingUp, Star, Clock, DollarSign } from 'lucide-react';
import { jobsAPI } from '../services/api';

const Home = () => {
  const [searchData, setSearchData] = useState({
    query: '',
    district: ''
  });
  const [categories, setCategories] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const popularSearches = ["Carpenter", "Plumber", "Electrician", "Cleaner", "Mason"];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, jobsRes] = await Promise.all([
        jobsAPI.getCategories(),
        jobsAPI.getJobs({ limit: 8 })
      ]);
      
      setCategories(categoriesRes.data);
      setRecentJobs(jobsRes.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchData.query || searchData.district) {
      navigate('/jobs', { 
        state: { 
          searchQuery: searchData.query,
          district: searchData.district
        }
      });
    }
  };

  const handleCategoryClick = (category) => {
    navigate('/jobs', { state: { category } });
  };

  const handlePopularSearch = (search) => {
    navigate('/jobs', { state: { searchQuery: search } });
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(salary);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen">
      {/* Top Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Next Opportunity
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connecting informal sector workers with employers across Rwanda
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, skills, or category"
                      value={searchData.query}
                      onChange={(e) => setSearchData({ ...searchData, query: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="District or sector (e.g., Nyarugenge, Kicukiro)"
                      value={searchData.district}
                      onChange={(e) => setSearchData({ ...searchData, district: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                <span className="text-lg">500+ jobs posted this week</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <span className="text-lg">Trusted by workers across Rwanda</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Searches</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(search)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600 text-lg">Explore opportunities in various fields</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category, index) => (
                <div
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {category}
                    </h3>
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                      {Math.floor(Math.random() * 200) + 50} jobs
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Find the best {category.toLowerCase()} jobs in your area
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/jobs"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              View all categories
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Available Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Available Jobs</h2>
              <p className="text-gray-600 mt-2">
                {recentJobs.length} jobs found
              </p>
            </div>
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              View All Jobs
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {job.employer_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <Link to={`/jobs/${job.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-blue-600 text-lg">
                            {job.title}
                          </h3>
                        </Link>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>{job.employer_name}</span>
                          <span className="mx-2">•</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.district}, Kigali</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(job.created_at)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {job.category}
                      </span>
                      <span className="inline-flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(job.salary)}
                      </span>
                    </div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="bg-black text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && recentJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
              <p className="text-gray-500">Check back later for new opportunities</p>
            </div>
          )}
        </div>
      </section>

      
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of workers and employers who are already using KaziNiKazi to find opportunities and talent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold text-lg"
            >
              Sign Up Now
            </Link>
            <Link
              to="/jobs"
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 font-semibold text-lg transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;