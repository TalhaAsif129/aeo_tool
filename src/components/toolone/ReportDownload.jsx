import { useState, useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';
import axios from 'axios';
import PDFGenerator from './PDFGenerator';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// ============================================
// GRADE METADATA
// ============================================
const gradeMeta = {
  A: { label: "Excellent", bg: [34, 197, 94], text: "#ffffff" },
  B: { label: "Very Good", bg: [34, 197, 94], text: "#ffffff" },
  C: { label: "Average", bg: [245, 158, 11], text: "#ffffff" },
  D: { label: "Needs Improvement", bg: [249, 115, 22], text: "#ffffff" },
  F: { label: "Critical", bg: [239, 68, 68], text: "#ffffff" },
};

const getGradeColor = (grade) => {
  return gradeMeta[grade] || gradeMeta.C;
};

const cleanProblemText = (text) => {
  return String(text)
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ============================================
// FILTERS - SAME AS PROBLEMSLIST
// ============================================
const filterProblems = (problems) => {
  return problems.filter((p) => {
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
  });
};

const getSeverity = (problem) => {
  const normalized = problem.toLowerCase();
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
    return "Critical";
  }
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
    return "Warning";
  }
  return "Info";
};

const getRecommendations = (problemsList) => {
  const recs = [];
  if (!problemsList || problemsList.length === 0) {
    return ["No issues found. Your website is performing well!", "Continue monitoring performance regularly."];
  }

  const realIssues = filterProblems(problemsList);
  if (realIssues.length === 0) {
    recs.push("✅ Continue monitoring performance regularly.");
    recs.push("✅ Maintain good UX and accessibility practices.");
    recs.push("✅ Keep your website's software and plugins updated.");
    return recs;
  }

  const allProblems = realIssues.join(" ").toLowerCase();

  if (allProblems.includes("unreachable") || allProblems.includes("not accessible")) {
    recs.push("🔍 Check if the website is online and accessible.");
    recs.push("🔍 Verify the URL is correct and the server is running.");
    return recs;
  }

  if (allProblems.includes("no ssl") || allProblems.includes("not secure")) {
    recs.push("🔒 Install SSL certificate and enforce HTTPS.");
    recs.push("🔒 Redirect all HTTP traffic to HTTPS.");
  }
  if (allProblems.includes("slow") || allProblems.includes("speed")) {
    recs.push("⚡ Optimize images and enable browser caching.");
    recs.push("⚡ Use a CDN to improve load times globally.");
  }
  if (allProblems.includes("viewport") || allProblems.includes("mobile")) {
    recs.push("📱 Ensure responsive design with viewport meta tags.");
    recs.push("📱 Test on multiple devices and screen sizes.");
  }
  if (allProblems.includes("seo") || allProblems.includes("meta")) {
    recs.push("📝 Create an optimized title tag and meta description.");
    recs.push("📝 Use structured data where appropriate.");
  }
  if (allProblems.includes("alt")) {
    recs.push("🖼️ Add descriptive alt text to all images.");
  }
  if (allProblems.includes("security") || allProblems.includes("header")) {
    recs.push("🛡️ Implement security headers (CSP, X-Frame-Options).");
  }
  if (allProblems.includes("gzip") && allProblems.includes("not enabled")) {
    recs.push("📦 Enable GZIP compression for faster loading.");
  }

  if (recs.length < 3) {
    recs.push("📊 Regularly monitor your website performance.");
    recs.push("🔄 Keep your website software and plugins updated.");
  }

  return [...new Set(recs)].slice(0, 6);
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReportDownload({
  url,
  grade,
  score,
  problems,
}) {
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const previousEmailRef = useRef("");
  const gradeColor = getGradeColor(grade);
  const cleanedProblems = problems.map((p) => cleanProblemText(p));

  // ✅ Use PDFGenerator
  const { generatePDF } = PDFGenerator({
    url,
    grade,
    score,
    problems: cleanedProblems,
    realIssueCount: filterProblems(problems).length,
    criticalCount: filterProblems(problems).filter(p => getSeverity(p) === "Critical").length,
    warningCount: filterProblems(problems).filter(p => getSeverity(p) === "Warning").length,
  });

  // ✅ Filter issues for display
  const filteredProblems = filterProblems(problems);
  const realIssueCount = filteredProblems.length;
  const criticalIssues = filteredProblems.filter(p => getSeverity(p) === "Critical");
  const warnings = filteredProblems.filter(p => getSeverity(p) === "Warning");
  const criticalCount = criticalIssues.length;
  const warningCount = warnings.length;

  // ============================================
  // UPLOAD PDF
  // ============================================
  const uploadPDF = async (base64Data, filename) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', blob, filename);

      const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data && response.data.data && response.data.data.url) {
        return response.data.data.url;
      } else {
        throw new Error('Upload failed - no link received');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  };

  // ============================================
  // SEND EMAIL
  // ============================================
  const sendEmailWithPDFLink = async (email) => {
    if (!email) {
      setSendStatus("Please enter your email address.");
      return false;
    }

    setIsSending(true);
    setSendStatus("Generating your report...");

    try {
      const pdfResult = await generatePDF();
      if (!pdfResult || !pdfResult.base64Attachment) {
        throw new Error("Failed to generate PDF");
      }

      setSendStatus("Uploading PDF to secure server...");
      const downloadLink = await uploadPDF(pdfResult.base64Attachment, pdfResult.filename);

      setSendStatus("Sending email with PDF download link...");

      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0] || 'User',
        website_url: url,
        grade: grade,
        score: score,
        issue_count: problems.length,
        audit_date: new Date().toLocaleDateString(),
        download_link: downloadLink,
        report_summary: `Grade: ${grade} | Score: ${score}/100 | Issues: ${problems.length}`,
        message: `Hi,\n\nYour website audit report for ${url} is ready.\n\nGrade: ${grade}\nScore: ${score}/100\nIssues: ${problems.length}\n\nClick the link below to download your PDF report:\n${downloadLink}\n\nThank you for using our service!`,
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', response);
      setSendStatus(`✅ PDF report sent to ${email}`);
      setEmailSent(true);
      previousEmailRef.current = email;
      setEmailInput("");

      return true;
    } catch (error) {
      console.error("Error:", error);
      setSendStatus(`❌ Failed to send report: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setIsSending(false);
      setUploadProgress(0);
    }
  };

  // ============================================
  // HANDLE EMAIL SUBMIT
  // ============================================
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim();
    if (trimmedEmail) {
      // Save to localStorage
      const leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.push({ email: trimmedEmail, url, grade, date: new Date().toISOString() });
      localStorage.setItem('leads', JSON.stringify(leads));
      
      // Send email
      sendEmailWithPDFLink(trimmedEmail);
    }
  };

  const handleManualDownload = async () => {
    const result = await generatePDF();
    if (!result || !result.base64Attachment) return;

    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${result.base64Attachment}`;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================
  // SCORE CALCULATION
  // ============================================
  const finalScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 50;
  const recommendations = getRecommendations(problems);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 sm:gap-6">
        
        {/* Left Side - White Card */}
        <div className="rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-white p-5 sm:p-6 lg:p-8 shadow-xl ring-1 ring-slate-200">
          <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
            Audit summary
          </span>
          <h1 className="mt-4 sm:mt-6 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight text-slate-900">
            Export a beautiful website audit report
          </h1>
          <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-500">
            Create a ready-to-share PDF with your website grade, issue breakdown, and recommendations in one polished package.
          </p>

          <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4">
            <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-4 sm:p-5 ring-1 ring-slate-200">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">
                Overall grade
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4">
                <div className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl text-2xl sm:text-3xl font-bold text-white shadow-lg ${
                  grade === 'A' ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/30' :
                  grade === 'B' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' :
                  grade === 'C' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/30' :
                  grade === 'D' ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30' :
                  'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                }`}>
                  {grade}
                </div>
                <div>
                  <p className={`text-base sm:text-lg font-semibold ${
                    grade === 'A' ? 'text-green-600' :
                    grade === 'B' ? 'text-blue-600' :
                    grade === 'C' ? 'text-yellow-600' :
                    grade === 'D' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {gradeColor.label}
                  </p>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-400">
                    Score: {finalScore}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center ring-1 ring-slate-200">
                <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {problems.length}
                </p>
                <p className="mt-1 sm:mt-2 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total checks
                </p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center ring-1 ring-slate-200">
                <p className="text-xl sm:text-2xl font-semibold text-red-600">
                  {criticalCount}
                </p>
                <p className="mt-1 sm:mt-2 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Critical
                </p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center ring-1 ring-slate-200">
                <p className="text-xl sm:text-2xl font-semibold text-amber-600">
                  {realIssueCount === 0 ? "0" : realIssueCount}
                </p>
                <p className="mt-1 sm:mt-2 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Issues to fix
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Email Input - Fixed */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3"> Enter your email to receive the PDF report</p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                required
              />
              <button
                type="submit"
                disabled={isSending}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin inline h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Report'
                )}
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-400">
               We respect your privacy. No spam, no third-party sharing.
            </p>
          </div>

          {/* Download PDF Only Button */}
        

          {sendStatus && (
            <div className={`mt-3 p-3 rounded-xl text-xs sm:text-sm ${
              sendStatus.includes('✅') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
              sendStatus.includes('❌') ? 'bg-red-50 text-red-700 border border-red-100' :
              'bg-slate-50 text-slate-600 border border-slate-100'
            }`}>
              {sendStatus}
            </div>
          )}
        </div>

        {/* Right Side - White Card */}
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-white p-4 sm:p-5 lg:p-6 shadow-xl ring-1 ring-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="w-full sm:w-auto min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">
                  Website
                </p>
                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {url}
                </p>
              </div>
              <div className={`rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap ${
                grade === 'A' ? 'bg-green-50 text-green-700' :
                grade === 'B' ? 'bg-blue-50 text-blue-700' :
                grade === 'C' ? 'bg-yellow-50 text-yellow-700' :
                grade === 'D' ? 'bg-orange-50 text-orange-700' :
                'bg-rose-50 text-rose-700'
              }`
              }>
                 
                
                {gradeColor.label}
              </div>
              
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-base sm:text-lg font-semibold text-slate-900">
                  {finalScore}/100
                </p>
                <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Score
                </p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-base sm:text-lg font-semibold text-red-600">
                  {criticalCount}
                </p>
                <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Critical
                </p>
              </div>
              <div className="rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-base sm:text-lg font-semibold text-amber-600">
                  {warningCount}
                </p>
                <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-xs uppercase tracking-[0.2em] text-slate-400">
                  Warnings
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Recommendations - Baqi Sections Ki Tarah White */}
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-white p-4 sm:p-5 lg:p-6 shadow-lg ring-1 ring-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-slate-800">Actionable Recommendations</p>
                  <p className="text-xs text-slate-500 hidden xs:block">Prioritized fixes to improve your website</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
                {recommendations.length} tips
              </span>
            </div>

            <ul className="space-y-3 sm:space-y-4">
              {recommendations.slice(0, 4).map((rec, idx) => {
                const text = rec.replace(/^[^\s]+\s/, '');
                
                const priority = idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Low';
                const priorityColors = {
                  High: 'bg-red-100 text-red-700 border-red-200',
                  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
                  Low: 'bg-green-100 text-green-700 border-green-200'
                };

                return (
                  <li 
                    key={idx} 
                    className="group flex items-start gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-4 border border-slate-200 hover:border-sky-200 transition-all duration-300 hover:shadow-md"
                  >
                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${
                      idx === 0 ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30' :
                      idx === 1 ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' :
                      'bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/30'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
                        {text}
                      </span>
                    </div>

                    <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${priorityColors[priority]} flex-shrink-0 shadow-sm`}>
                      {priority}
                    </span>
                  </li>
                );
              })}
            </ul>

            {recommendations.length > 4 && (
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                  +{recommendations.length - 4} more recommendations available in full report
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Email Sent Modal */}
      {emailSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-center text-lg sm:text-xl font-semibold text-slate-900">
              PDF Report Sent! 
            </h3>
            <p className="mt-3 text-center text-sm sm:text-base text-slate-600">
              Your website audit report has been sent to:
            </p>
            <p className="mt-2 text-center font-semibold text-slate-900 break-all">
              {previousEmailRef.current}
            </p>
            <p className="mt-3 text-center text-xs sm:text-sm text-slate-500 bg-sky-50 p-3 rounded-lg">
              📎 <strong>Check your inbox</strong><br />
              The PDF download link has been sent to your email.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-4 w-full rounded-2xl sm:rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}