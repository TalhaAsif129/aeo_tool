import "./App.css";
import { useState, useRef } from "react";
import UrlForm from "./components/toolone/UrlForm";
import GradeCard from "./components/toolone/GradeCard";
import ProblemsList from "./components/toolone/ProblemsList";
import EmailGate from "./components/toolone/EmailGate";
import { checkWebsite } from "./components/services/websiteChecker";
import ReportDownload from "./components/toolone/ReportDownload";

function App() {
  const [url, setUrl] = useState("");
  const [grade, setGrade] = useState("");
  const [score, setScore] = useState(0);
  const [problems, setProblems] = useState([]);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailGateRef = useRef(null);

  const handleEmailSubmit = (submittedEmail) => {
    setEmail(submittedEmail);
    setEmailSubmitted(true);
    setShowEmailGate(false);
  };

  const showEmailGateAndScroll = () => {
    setShowEmailGate(true);
    setTimeout(() => {
      emailGateRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleCheck = async (submittedUrl) => {
    setLoading(true);
    setUrl(submittedUrl);

    const result = await checkWebsite(submittedUrl);

    setGrade(result.grade);
    setScore(result.score);
    setProblems(result.problems);
    setShowEmailGate(true);
    setLoading(false);
  };

  const getRealIssueCount = (problemList) => {
    return problemList.filter((p) => {
      const lower = p.toLowerCase();
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
      return true;
    }).length;
  };

  const realIssueCount = getRealIssueCount(problems);

  return (
    <div className="min-h-screen lg:px-10 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* ============================================
            HEADER
            ============================================ */}
        <header className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm text-sky-700 border border-sky-100 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Free SEO & Performance Checker
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
            Free Website{" "}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              Auditor
            </span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
            Enter your website URL to get an{" "}
            <span className="font-semibold text-slate-700">A–F grade</span> and
            a{" "}
            <span className="font-semibold text-slate-700">
              detailed fix list
            </span>
          </p>
        </header>

        {/* ============================================
            URL FORM
            ============================================ */}
        <UrlForm onSubmit={handleCheck} loading={loading} />

        {/* ============================================
            GRADE + STATS - Professional Card
            ============================================ */}
        {/* ============================================
    GRADE + STATS - Professional Card
    ============================================ */}
        {/* ============================================
    GRADE + STATS - Prominent Card
    ============================================ */}
        {grade && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* ✅ Prominent Header */}
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Audit Results
                    </h2>
                    <p className="text-xs sm:text-sm text-sky-100 hidden xs:block">
                      Complete overview of your website performance
                    </p>
                  </div>
                </div>

                {/* ✅ Right: Grade Badge - White Version */}
                <div className="hidden md:flex flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                      grade === "A"
                        ? "bg-green-100 text-green-700"
                        : grade === "B"
                          ? "bg-blue-100 text-blue-700"
                          : grade === "C"
                            ? "bg-yellow-100 text-yellow-700"
                            : grade === "D"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    Grade {grade}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ Body with Prominent Stats */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Side: Grade Circle */}
                <div className="w-full lg:w-2/5 flex justify-center">
                  <GradeCard grade={grade} />
                </div>

                {/* Divider Line (Desktop) */}
                <div className="hidden lg:block w-px h-72 bg-gradient-to-b from-transparent via-slate-500 to-transparent"></div>

                {/* Right Side: Quick Stats - Larger & Prominent */}
                <div className="w-full lg:w-3/5">
                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    {/* Stat 1: Total Checks */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 sm:p-5 text-center border-2 border-slate-100 hover:border-sky-300 hover:shadow-md transition-all duration-300 group">
                      <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {problems.length}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 uppercase tracking-wide">
                        Total Checks
                      </p>
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"></div>
                      </div>
                    </div>

                    {/* Stat 2: Issues Found */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 sm:p-5 text-center border-2 border-slate-100 hover:border-amber-300 hover:shadow-md transition-all duration-300 group">
                      <p
                        className={`text-3xl sm:text-4xl font-extrabold ${realIssueCount === 0 ? "text-emerald-600" : "text-amber-600"} group-hover:scale-105 transition-transform`}
                      >
                        {realIssueCount}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 uppercase tracking-wide">
                        Issues Found
                      </p>
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${realIssueCount === 0 ? "w-full bg-emerald-500" : "w-1/2 bg-amber-500"}`}
                        ></div>
                      </div>
                    </div>

                    {/* Stat 3: Performance Score */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 sm:p-5 text-center border-2 border-slate-100 hover:border-sky-300 hover:shadow-md transition-all duration-300 group">
                      <p className="text-3xl sm:text-4xl font-extrabold text-sky-600 group-hover:scale-105 transition-transform">
                        {score}/100
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 uppercase tracking-wide">
                        Performance Score
                      </p>
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stat 4: Overall Grade */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 sm:p-5 text-center border-2 border-slate-100 hover:border-red-300 hover:shadow-md transition-all duration-300 group">
                      <p
                        className={`text-3xl sm:text-4xl font-extrabold ${
                          grade === "A"
                            ? "text-green-600"
                            : grade === "B"
                              ? "text-blue-600"
                              : grade === "C"
                                ? "text-yellow-600"
                                : grade === "D"
                                  ? "text-orange-600"
                                  : "text-red-600"
                        } group-hover:scale-105 transition-transform`}
                      >
                        {grade}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 uppercase tracking-wide">
                        Overall Grade
                      </p>
                      <div className="mt-3 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            grade === "A"
                              ? "w-full bg-green-500"
                              : grade === "B"
                                ? "w-3/4 bg-blue-500"
                                : grade === "C"
                                  ? "w-1/2 bg-yellow-500"
                                  : grade === "D"
                                    ? "w-1/4 bg-orange-500"
                                    : "w-1/6 bg-red-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            ISSUES LIST (2nd)
            ============================================ */}
        {grade && (
          <div className="mt-6">
            <ProblemsList problems={problems} />
          </div>
        )}

        {/* ============================================
            REPORT DOWNLOAD (3rd) - PDF Export
            ============================================ */}
        {grade && (
          <div className="mt-6">
            <ReportDownload
              url={url}
              grade={grade}
              score={score}
              problems={problems}
              email={email}
              onRequestEmail={showEmailGateAndScroll}
            />
          </div>
        )}

        {/* ============================================
            EMAIL GATE (4th - Last) - Get Full Report
            ============================================ */}
        {grade && (
          <div className="mt-6" ref={emailGateRef}>
            {!showEmailGate ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Get Your Full Report
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Enter your email to receive the complete audit report
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={showEmailGateAndScroll}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                  >
                    Continue to Email →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <EmailGate
                  url={url}
                  grade={grade}
                  problems={problems}
                  email={email}
                  emailSubmitted={emailSubmitted}
                  onEmailSubmit={handleEmailSubmit}
                />
              </div>
            )}
          </div>
        )}

        {/* ============================================
            NO AUDIT STATE
            ============================================ */}
        {/* {!grade && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Audit Yet</h3>
              <p className="text-slate-500">Enter a URL above to see your audit results here</p>
            </div>
          </div>
        )} */}

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="mt-28 text-center text-slate-400 text-sm border-t border-slate-200 pt-8">
          <p>
            © 2026 AuditPro — Free Website Auditor. All checks are simulated for
            demo purposes.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
