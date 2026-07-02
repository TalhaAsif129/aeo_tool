import { useState } from "react";

export default function UrlForm({ onSubmit, loading }) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      {/* Search Bar - Button Full Cover */}
      <div className="relative w-full group">
        {/* Search Icon - Left Side */}
        <span className="pointer-events-none absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-slate-400 z-10">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>

        {/* Input Field - Full Rounded */}
        <input
          id="website-url"
          type="url"
          placeholder="Enter URL (https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full h-12 sm:h-14 pl-10 sm:pl-14 pr-0 rounded-full border-2 bg-white text-sm sm:text-base text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:shadow-md hover:shadow-md
          border-sky-400
          group-hover:border-sky-400"
          required
        />

        {/* Button - Full Cover on Search Bar (Right Side) */}
        <button
          type="submit"
          disabled={loading}
          className="absolute right-0 top-0 h-full w-auto min-w-[90px] sm:min-w-[130px] inline-flex items-center justify-center gap-1.5 rounded-r-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 sm:px-7 text-xs sm:text-sm font-semibold text-white shadow-md shadow-sky-500/25 transition-all duration-200 hover:from-sky-600 hover:to-indigo-700 hover:shadow-lg hover:shadow-sky-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className=" sm:inline">Checking...</span>
            </>
          ) : (
            <>
              <span className=" sm:inline font-medium">Check Website</span>
            </>
          )}
        </button>
      </div>

      {/* Pro Tip */}
      <p className="mt-3  mb-18 text-xs text-slate-400 text-center">
        {/* 💡 Include <span className="font-medium text-slate-500">https://</span> for accurate results */}
      </p>
    </form>
  );
}
