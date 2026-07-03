// ============================================
// ProblemsList.jsx - Prominent Version
// ============================================

const getSeverity = (problem) => {
  const normalized = problem.toLowerCase();

  // Check for critical issues (❌)
  if (
    normalized.includes("❌") ||
    normalized.includes("critical") ||
    normalized.includes("error") ||
    normalized.includes("fail") ||
    normalized.includes("unreachable") ||
    normalized.includes("no ssl") ||
    normalized.includes("not secure") ||
    (normalized.includes("missing") && !normalized.includes("⚠️"))
  ) {
    return { label: "Critical", tone: "bg-rose-100 text-rose-700", icon: "❌" };
  }

  // Check for warnings (⚠️)
  if (
    normalized.includes("⚠️") ||
    normalized.includes("average") ||
    normalized.includes("some") ||
    normalized.includes("can be improved") ||
    normalized.includes("consider") ||
    normalized.includes("missing") ||
    normalized.includes("not enabled") ||
    normalized.includes("could not")
  ) {
    return {
      label: "Warning",
      tone: "bg-amber-100 text-amber-700",
      icon: "⚠️",
    };
  }

  // Check for good/pass (✅) - These will be filtered out
  if (
    normalized.includes("✅") ||
    normalized.includes("good") ||
    normalized.includes("detected") ||
    normalized.includes("perfect") ||
    normalized.includes("excellent") ||
    normalized.includes("great") ||
    normalized.includes("pass") ||
    normalized.includes("valid") ||
    normalized.includes("enabled") ||
    normalized.includes("found") ||
    normalized.includes("successful") ||
    normalized.includes("fast") ||
    normalized.includes("all")
  ) {
    return {
      label: "Pass",
      tone: "bg-emerald-100 text-emerald-700",
      icon: "✅",
      isPass: true,
    };
  }

  // Default to info for everything else (ℹ️)
  return { label: "Info", tone: "bg-sky-100 text-sky-700", icon: "ℹ️" };
};

// ============================================
// Get specific fix recommendations for each problem
// ============================================
const getFixRecommendation = (problem) => {
  const lower = problem.toLowerCase();

  // ---- SSL Issues ----
  if (lower.includes("no ssl") || lower.includes("not secure")) {
    return "Install SSL certificate and enforce HTTPS redirects.";
  }
  if (lower.includes("ssl certificate is valid") || lower.includes("ssl enabled")) {
    return "✅ SSL is properly configured. Keep certificates updated.";
  }

  // ---- Speed Issues ----
  if (lower.includes("slow") || (lower.includes("loading time") && lower.includes("slow"))) {
    return "Optimize images, enable caching, and use a CDN.";
  }
  if (lower.includes("average loading time")) {
    return "Consider image optimization and browser caching.";
  }
  if (lower.includes("fast loading")) {
    return "✅ Great performance! Keep optimizing regularly.";
  }

  // ---- Mobile Issues ----
  if (lower.includes("viewport") && lower.includes("missing")) {
    return "Add viewport meta tag for responsive design.";
  }
  if (lower.includes("mobile")) {
    return "Implement responsive design and test on multiple devices.";
  }

  // ---- SEO Issues ----
  if (lower.includes("title") && lower.includes("missing")) {
    return "Add a descriptive title tag (50-60 characters).";
  }
  if (lower.includes("meta description") && lower.includes("missing")) {
    return "Add meta description (150-160 characters) for SEO.";
  }

  // ---- Alt Text Issues ----
  if (lower.includes("alt") && lower.includes("missing")) {
    return "Add descriptive alt text to all images.";
  }
  if (lower.includes("all") && lower.includes("alt text")) {
    return "✅ All images have proper alt text.";
  }

  // ---- Security Headers ----
  if (lower.includes("x-frame-options") && lower.includes("missing")) {
    return "Add X-Frame-Options header to prevent clickjacking.";
  }
  if (lower.includes("csp") && lower.includes("missing")) {
    return "Implement Content-Security-Policy header.";
  }
  if (lower.includes("hsts") && lower.includes("missing")) {
    return "Enable HSTS for better security.";
  }

  // ---- GZIP Compression ----
  if (lower.includes("gzip") && lower.includes("not enabled")) {
    return "Enable GZIP compression on your server.";
  }
  if (lower.includes("gzip") && lower.includes("enabled")) {
    return "✅ GZIP compression is enabled.";
  }

  // ---- DNS Issues ----
  if (lower.includes("dns") && lower.includes("failed")) {
    return "Check DNS configuration and domain records.";
  }
  if (lower.includes("dns resolution successful")) {
    return "✅ DNS is properly configured.";
  }

  // ---- Domain Quality Issues ----
  if (lower.includes("uncommon domain extension")) {
    return "Consider using a more common domain extension (.com, .org, .net).";
  }
  if (lower.includes("domain contains hyphens")) {
    return "Remove hyphens from your domain name for better branding.";
  }
  if (lower.includes("very short domain name")) {
    return "Consider a longer, more descriptive domain name.";
  }
  if (lower.includes("very long domain name")) {
    return "Shorten your domain name for better memorability.";
  }
  if (lower.includes("domain contains numbers")) {
    return "Consider removing numbers for a more professional domain.";
  }

  // ---- Estimated Metrics ----
  if (lower.includes("estimated")) {
    return "For accurate results, use Google PageSpeed Insights or GTmetrix.";
  }
  if (lower.includes("cors restricted") || lower.includes("cors")) {
    return "Enable CORS headers or use server-side checks for full analysis.";
  }

  // ---- General Issues ----
  if (lower.includes("could not measure")) {
    return "Check server response time and network conditions.";
  }
  if (lower.includes("additional checks require")) {
    return "Enable CORS or use server-side checks for full analysis.";
  }
  if (lower.includes("accessible") || lower.includes("unreachable")) {
    return "Check if the website is online and accessible.";
  }

  // ---- Default recommendation ----
  return "Review this issue and apply appropriate optimization.";
};

export default function ProblemsList({ problems }) {
  // ============================================
  // Filter out Pass items and summary messages
  // ============================================
  const filteredProblems = problems.filter((p) => {
    const lower = p.toLowerCase();

    // Remove summary messages
    if (
      lower.includes("excellent website performance") ||
      lower.includes("good performance with minor improvements") ||
      lower.includes("moderate issues found") ||
      lower.includes("significant issues found") ||
      lower.includes("critical issues found") ||
      lower.includes("perfect score") ||
      lower.includes("minor issues found") ||
      lower.includes("all checks passed")
    ) {
      return false;
    }

    // Remove Pass items (✅) - these are not issues
    if (
      lower.includes("✅") ||
      (lower.includes("valid") && lower.includes("ssl")) ||
      lower.includes("fast loading") ||
      (lower.includes("enabled") && !lower.includes("not enabled")) ||
      lower.includes("good") ||
      lower.includes("detected") ||
      lower.includes("perfect") ||
      lower.includes("excellent") ||
      lower.includes("great") ||
      lower.includes("successful") ||
      (lower.includes("all") && lower.includes("alt text")) ||
      lower.includes("compression is enabled") ||
      lower.includes("dns resolution successful") ||
      lower.includes("trusted domain extension")
    ) {
      return false;
    }

    // Only keep items that are actual issues (Critical, Warning, or Info)
    return true;
  });

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      
      {/* ✅ Header - Same as Grade Section */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Issues to Fix</h2>
              <p className="text-xs sm:text-sm text-slate-500 hidden xs:block">Detailed breakdown of all detected issues</p>
            </div>
          </div>

          {/* Right: Issues Badge */}
          <div className="hidden md:flex flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-sm bg-rose-50 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {filteredProblems.length} {filteredProblems.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Body - Prominent Cards */}
      <div className="p-4 sm:p-6 lg:p-8">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-lg shadow-emerald-200">
              <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">🎉 No Issues Detected!</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-500">All checks passed. Your website is performing well!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredProblems.map((problem, index) => {
              const severity = getSeverity(problem);
              const fixRecommendation = getFixRecommendation(problem);

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 hover:shadow-lg ${
                    severity.label === "Critical" 
                      ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300" 
                      : severity.label === "Warning" 
                        ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300"
                        : "border-sky-200 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-300"
                  }`}
                >
                  {/* Left Accent Bar - Thicker & Prominent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    severity.label === "Critical" 
                      ? "bg-rose-500" 
                      : severity.label === "Warning" 
                        ? "bg-amber-500"
                        : "bg-sky-500"
                  } group-hover:w-2 transition-all duration-300`}></div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 pl-4">
                    
                    {/* Icon - Larger & Prominent */}
                    <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-xl sm:text-2xl ${severity.tone} flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                      {severity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                          {problem}
                        </p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${severity.tone} flex-shrink-0 shadow-sm`}>
                          {severity.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-700">💡 Fix:</span> {fixRecommendation}
                      </p>
                    </div>

                    {/* Issue Number - Prominent */}
                    <div className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full bg-slate-200/50 text-slate-400 text-xs font-bold flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}