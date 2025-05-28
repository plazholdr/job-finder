export default function LoginIllustration() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md">
        <img 
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="People collaborating" 
          className="rounded-2xl shadow-lg mb-8"
        />
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Find Your Dream Career</h2>
          <p className="text-gray-600">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex space-x-4 pt-4">
            <div className="flex -space-x-2">
              <img 
                className="w-10 h-10 rounded-full border-2 border-white" 
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="User"
              />
              <img 
                className="w-10 h-10 rounded-full border-2 border-white" 
                src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="User"
              />
              <img 
                className="w-10 h-10 rounded-full border-2 border-white" 
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="User"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Join 10,000+ professionals</p>
              <p className="text-xs text-gray-500">who found their next role with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}