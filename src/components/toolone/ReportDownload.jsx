import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import emailjs from '@emailjs/browser';
import axios from 'axios';

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

const getRecommendation = (problem) => {
  const lower = problem.toLowerCase();
  if (lower.includes("no ssl") || lower.includes("not secure")) {
    return "Install SSL certificate and enforce HTTPS redirects.";
  }
  if (lower.includes("ssl certificate is valid")) {
    return "SSL is properly configured. Keep certificates updated.";
  }
  if (lower.includes("slow") || lower.includes("loading time")) {
    return "Optimize images, enable caching, and use a CDN.";
  }
  if (lower.includes("average loading")) {
    return "Consider image optimization and browser caching.";
  }
  if (lower.includes("fast loading")) {
    return "Great performance! Keep optimizing regularly.";
  }
  if (lower.includes("viewport") || lower.includes("mobile")) {
    return "Add viewport meta tag for responsive design.";
  }
  if (lower.includes("title") && lower.includes("missing")) {
    return "Add a descriptive title tag (50-60 characters).";
  }
  if (lower.includes("meta description") && lower.includes("missing")) {
    return "Add meta description (150-160 characters) for SEO.";
  }
  if (lower.includes("alt") && lower.includes("missing")) {
    return "Add descriptive alt text to all images.";
  }
  if (lower.includes("x-frame-options")) {
    return "Add X-Frame-Options header to prevent clickjacking.";
  }
  if (lower.includes("csp") || lower.includes("content-security-policy")) {
    return "Implement Content-Security-Policy header.";
  }
  if (lower.includes("hsts")) {
    return "Enable HSTS for better security.";
  }
  if (lower.includes("gzip") && lower.includes("not enabled")) {
    return "Enable GZIP compression on your server.";
  }
  if (lower.includes("uncommon domain extension")) {
    return "Consider using a more common domain extension (.com, .org, .net).";
  }
  if (lower.includes("domain contains hyphens")) {
    return "Remove hyphens from your domain name for better branding.";
  }
  return "Review this issue and apply appropriate optimization.";
};

// ============================================
// ✅ FILTERS - SAME AS PROBLEMSLIST (EXACT MATCH)
// ============================================

// ✅ Exact copy of ProblemsList filter
const filterProblems = (problems) => {
  return problems.filter((p) => {
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

    return true;
  });
};

// ✅ Exact copy of ProblemsList severity
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
    return "Critical";
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
    return "Warning";
  }

  return "Info";
};

// ============================================
// RECOMMENDATIONS
// ============================================
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
  email,
  onRequestEmail,
}) {
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const previousEmailRef = useRef("");
  const gradeColor = getGradeColor(grade);
  const cleanedProblems = problems.map((p) => cleanProblemText(p));

  // ============================================
  // ✅ USE SAME FILTER AS PROBLEMSLIST
  // ============================================
  const filteredProblems = filterProblems(problems);
  const realIssueCount = filteredProblems.length;
  
  // ✅ USE SAME SEVERITY LOGIC AS PROBLEMSLIST
  const criticalIssues = filteredProblems.filter(p => getSeverity(p) === "Critical");
  const warnings = filteredProblems.filter(p => getSeverity(p) === "Warning");
  const infoIssues = filteredProblems.filter(p => getSeverity(p) === "Info");

  const criticalCount = criticalIssues.length;
  const warningCount = warnings.length;

  // ============================================
  // GENERATE PDF
  // ============================================
  const generatePDF = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let yPos = 0;

      const colors = {
        ink: [15, 23, 42],
        cover: [13, 18, 36],
        coverPanel: [22, 28, 51],
        coverLine: [45, 52, 80],
        accent: [79, 70, 229],
        accentSoft: [224, 222, 255],
        success: [5, 150, 105],
        successSoft: [209, 250, 229],
        warning: [217, 119, 6],
        warningSoft: [254, 240, 199],
        danger: [220, 38, 38],
        dangerSoft: [254, 224, 224],
        text: [30, 41, 59],
        textLight: [100, 116, 139],
        textLighter: [148, 163, 184],
        border: [226, 232, 240],
        surface: [248, 250, 252],
        surfaceAlt: [241, 245, 249],
        white: [255, 255, 255],
      };

      const gradeColorRgb =
        {
          A: colors.success,
          B: colors.success,
          C: colors.warning,
          D: [234, 88, 12],
          F: colors.danger,
        }[grade] || colors.text;

      const gradeSoftRgb =
        {
          A: colors.successSoft,
          B: colors.successSoft,
          C: colors.warningSoft,
          D: colors.warningSoft,
          F: colors.dangerSoft,
        }[grade] || colors.surfaceAlt;

      const gradeLabels = {
        A: "Excellent",
        B: "Very Good",
        C: "Average",
        D: "Needs Improvement",
        F: "Critical",
      };

      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const finalScore = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 50;

      const setFont = (size, color, style = "normal") => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        if (color) doc.setTextColor(color[0], color[1], color[2]);
      };

      const writeText = (text, x, y, options = {}) => {
        try {
          const cleanText = String(text)
            .replace(/[^\x20-\x7E]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          doc.text(cleanText, x, y, options);
        } catch (e) {
          doc.text("", x, y, options);
        }
      };

      const drawLine = (y, color = colors.border, width = 0.3, x1 = margin, x2 = pageWidth - margin) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(width);
        doc.line(x1, y, x2, y);
      };

      const drawRoundedRect = (x, y, w, h, r = 6, fill = null, stroke = null, strokeWidth = 0.4) => {
        if (fill) {
          doc.setFillColor(fill[0], fill[1], fill[2]);
          doc.roundedRect(x, y, w, h, r, r, "F");
        }
        if (stroke) {
          doc.setDrawColor(stroke[0], stroke[1], stroke[2]);
          doc.setLineWidth(strokeWidth);
          doc.roundedRect(x, y, w, h, r, r, "S");
        }
      };

      const drawPill = (label, x, h, color, options = {}) => {
        const align = options.align || "left";
        const padX = options.padX ?? 4;
        const textColor = options.textColor || colors.white;
        const fontSize = options.fontSize || 6.5;
        setFont(fontSize, textColor, "bold");
        const w = doc.getTextWidth(label) + padX * 2;
        const px = align === "right" ? x - w : x;
        drawRoundedRect(px, options.y, w, h, h / 2, color);
        writeText(label, px + w / 2, options.y + h / 2 + fontSize * 0.32, { align: "center" });
        return { x: px, width: w };
      };

      const drawArcStroke = (cx, cy, radius, startDeg, endDeg, color, lineWidth) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(lineWidth);
        if (doc.setLineCap) doc.setLineCap("round");
        const toRad = (d) => (d * Math.PI) / 180;
        const steps = Math.max(2, Math.round(Math.abs(endDeg - startDeg) / 2.5));
        let prevX = cx + radius * Math.cos(toRad(startDeg));
        let prevY = cy + radius * Math.sin(toRad(startDeg));
        for (let i = 1; i <= steps; i++) {
          const deg = startDeg + ((endDeg - startDeg) * i) / steps;
          const x = cx + radius * Math.cos(toRad(deg));
          const y = cy + radius * Math.sin(toRad(deg));
          doc.line(prevX, prevY, x, y);
          prevX = x;
          prevY = y;
        }
        if (doc.setLineCap) doc.setLineCap("butt");
      };

      const drawScoreGauge = (cx, cy, radius, lineWidth, pct, color, trackColor) => {
        drawArcStroke(cx, cy, radius, -90, 270, trackColor, lineWidth);
        const sweep = (Math.max(0, Math.min(100, pct)) / 100) * 360;
        if (sweep > 0.5) drawArcStroke(cx, cy, radius, -90, -90 + sweep, color, lineWidth);
      };

      const drawPageHeader = () => {
        doc.setFillColor(colors.ink[0], colors.ink[1], colors.ink[2]);
        doc.rect(0, 0, pageWidth, 4, "F");
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.rect(0, 4, pageWidth, 0.9, "F");
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.circle(margin + 1.6, 15.5, 1.6, "F");
        setFont(7.5, colors.textLighter, "bold");
        writeText("WEBSITE AUDIT REPORT", margin + 6, 16.3);
        setFont(7.5, colors.textLighter, "normal");
        writeText(url, pageWidth - margin, 16.3, { align: "right" });
        drawLine(21, colors.border, 0.3);
      };

      const drawPageFooter = (pageNum, totalPages, dark = false) => {
        const y = pageHeight - 13;
        if (dark) {
          drawLine(y - 6, colors.coverLine, 0.3);
          setFont(7.5, [148, 163, 184], "normal");
        } else {
          drawLine(y - 6, colors.border, 0.3);
          setFont(7.5, colors.textLighter, "normal");
        }
        writeText(`Generated ${currentDate}`, margin, y);
        writeText(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, y, { align: "center" });
        writeText("CONFIDENTIAL", pageWidth - margin, y, { align: "right" });
      };

      const drawSectionTitle = (title, yStart) => {
        setFont(19, colors.ink, "bold");
        writeText(title, margin, yStart);
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.rect(margin, yStart + 3.5, 15, 1.3, "F");
        return yStart + 15;
      };

      const startInteriorPage = () => {
        doc.addPage();
        drawPageHeader();
        return 31;
      };

      // ============================================
      // PAGE 1: COVER
      // ============================================
      doc.setFillColor(colors.cover[0], colors.cover[1], colors.cover[2]);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.rect(0, 0, pageWidth, 2, "F");
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.circle(margin + 1.8, 19, 1.8, "F");
      setFont(8.5, [226, 232, 240], "bold");
      writeText("WEBSITE AUDIT", margin + 7, 19.8);
      setFont(8, [148, 163, 184], "normal");
      writeText("CONFIDENTIAL", pageWidth - margin, 19.8, { align: "right" });
      drawLine(26, colors.coverLine, 0.3);
      setFont(9, [148, 163, 184], "bold");
      writeText("PERFORMANCE - SECURITY - SEO - ACCESSIBILITY", pageWidth / 2, 58, { align: "center" });
      setFont(29, [255, 255, 255], "bold");
      writeText("Website Audit Report", pageWidth / 2, 73, { align: "center" });
      setFont(11, [148, 163, 184], "normal");
      writeText("A comprehensive, data-driven review of your site's health", pageWidth / 2, 82, { align: "center" });

      setFont(10, [226, 232, 240], "normal");
      const urlPillW = doc.getTextWidth(url) + 18;
      drawRoundedRect(pageWidth / 2 - urlPillW / 2, 89, urlPillW, 11, 5.5, colors.coverPanel, colors.coverLine, 0.4);
      writeText(url, pageWidth / 2, 96, { align: "center" });

      const gaugeCx = pageWidth / 2;
      const gaugeCy = 156;
      const gaugeR = 33;
      drawScoreGauge(gaugeCx, gaugeCy, gaugeR, 7.5, finalScore, gradeColorRgb, colors.coverLine);
      setFont(38, [255, 255, 255], "bold");
      writeText(String(finalScore), gaugeCx, gaugeCy + 4, { align: "center" });
      setFont(8.5, [148, 163, 184], "bold");
      writeText("SCORE OUT OF 100", gaugeCx, gaugeCy + 14, { align: "center" });

      const badgeY = gaugeCy + gaugeR + 13;
      const badgeLabel = `GRADE ${grade}  -  ${(gradeLabels[grade] || "").toUpperCase()}`;
      setFont(10.5, [255, 255, 255], "bold");
      const badgeW = doc.getTextWidth(badgeLabel) + 20;
      drawRoundedRect(gaugeCx - badgeW / 2, badgeY - 7, badgeW, 14, 7, gradeColorRgb);
      writeText(badgeLabel, gaugeCx, badgeY + 2.3, { align: "center" });

      const coverStats = [
        { label: "Total Checks", value: problems.length },
        { label: "Issues Found", value: realIssueCount },
        { label: "Critical", value: criticalCount },
        { label: "Warnings", value: warningCount },
      ];

      const statStartY = badgeY + 18;
      const statGap = 3;
      const statW = (contentWidth - statGap * 3) / 4;
      let sx = margin;
      coverStats.forEach((stat) => {
        drawRoundedRect(sx, statStartY, statW, 30, 6, colors.coverPanel, colors.coverLine, 0.35);
        setFont(7, [148, 163, 184], "bold");
        writeText(stat.label.toUpperCase(), sx + statW / 2, statStartY + 9, { align: "center" });
        setFont(18, [255, 255, 255], "bold");
        writeText(String(stat.value), sx + statW / 2, statStartY + 23, { align: "center" });
        sx += statW + statGap;
      });
      drawPageFooter(1, 0, true);

      // ============================================
      // PAGE 2: EXECUTIVE SUMMARY
      // ============================================
      yPos = startInteriorPage();
      yPos = drawSectionTitle("Executive Summary", yPos);
      yPos += 10;

      const summaryText = `This audit provides a detailed analysis of ${url} across critical performance dimensions including speed, security, SEO, and accessibility. The website achieved an overall grade of ${grade} (${gradeLabels[grade]}) with a performance score of ${finalScore} out of 100. ${
        realIssueCount === 0
          ? "All checks passed successfully - this website demonstrates exceptional performance standards across every evaluated category."
          : `The audit identified ${realIssueCount} issue${realIssueCount === 1 ? "" : "s"} requiring attention, comprising ${criticalCount} critical and ${warningCount} warning${warningCount === 1 ? "" : "s"} that should be addressed.`
      }`;

      setFont(9.5, colors.text, "normal");
      const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 24);
      const summaryBoxH = summaryLines.length * 5.6 + 18;
      drawRoundedRect(margin, yPos, contentWidth, summaryBoxH, 8, colors.surface, colors.border);
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.rect(margin, yPos, 1.4, summaryBoxH, "F");
      let textY = yPos + 12;
      summaryLines.forEach((line) => {
        writeText(line, margin + 12, textY);
        textY += 5.6;
      });
      yPos += summaryBoxH + 16;

      if (yPos + 14 + 70 > pageHeight - 28) {
        yPos = startInteriorPage();
        yPos = drawSectionTitle("Executive Summary (continued)", yPos);
        yPos += 10;
      }

      setFont(14, colors.ink, "bold");
      writeText("Key Performance Metrics", margin, yPos);
      yPos += 10;

      const metrics = [
        ["Performance Score", `${finalScore} / 100`, gradeColorRgb, gradeSoftRgb],
        ["Total Issues", String(realIssueCount), colors.text, colors.surfaceAlt],
        ["Critical Issues", String(criticalCount), colors.danger, colors.dangerSoft],
        ["Warnings", String(warningCount), colors.warning, colors.warningSoft],
      ];

      const metricGap = 6;
      const metricW = (contentWidth - metricGap) / 2;
      metrics.forEach((metric, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const x = margin + col * (metricW + metricGap);
        const y = yPos + row * 33;
        drawRoundedRect(x, y, metricW, 29, 7, colors.white, colors.border);
        doc.setFillColor(metric[3][0], metric[3][1], metric[3][2]);
        doc.roundedRect(x + 10, y + 7.5, 6, 6, 1.5, 1.5, "F");
        setFont(8.5, colors.textLight, "normal");
        writeText(metric[0], x + 22, y + 10.5);
        setFont(17, metric[2], "bold");
        writeText(metric[1], x + 22, y + 21.5);
      });
      yPos += 33 * 2 + 10;

      if (yPos + 40 > pageHeight - 28) {
        yPos = startInteriorPage();
        yPos = drawSectionTitle("Executive Summary (continued)", yPos);
        yPos += 10;
      }

      setFont(14, colors.ink, "bold");
      writeText("Score Meter", margin, yPos);
      yPos += 11;

      const zones = [
        { from: 0, to: 40, color: colors.danger },
        { from: 40, to: 60, color: [234, 88, 12] },
        { from: 60, to: 75, color: colors.warning },
        { from: 75, to: 90, color: [101, 163, 13] },
        { from: 90, to: 100, color: colors.success },
      ];
      const meterH = 9;
      zones.forEach((zone) => {
        const zx = margin + (zone.from / 100) * contentWidth;
        const zw = ((zone.to - zone.from) / 100) * contentWidth;
        doc.setFillColor(zone.color[0], zone.color[1], zone.color[2]);
        doc.rect(zx, yPos, zw, meterH, "F");
      });
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.4);
      doc.rect(margin, yPos, contentWidth, meterH, "S");

      const pointerX = margin + (finalScore / 100) * contentWidth;
      doc.setFillColor(colors.ink[0], colors.ink[1], colors.ink[2]);
      doc.triangle(pointerX - 3, yPos - 5, pointerX + 3, yPos - 5, pointerX, yPos - 0.5, "F");
      doc.setDrawColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setLineWidth(0.8);
      doc.line(pointerX, yPos - 0.5, pointerX, yPos + meterH + 0.5);
      setFont(9, colors.ink, "bold");
      writeText(`${finalScore}`, pointerX, yPos - 7.5, { align: "center" });
      yPos += meterH + 10;
      setFont(7, colors.textLighter, "normal");
      writeText("0", margin, yPos);
      writeText("50", margin + contentWidth / 2, yPos, { align: "center" });
      writeText("100", pageWidth - margin, yPos, { align: "right" });
      drawPageFooter(2, 0);

      // ============================================
      // PAGE 3: DETAILED FINDINGS
      // ============================================
      yPos = startInteriorPage();
      yPos = drawSectionTitle("Detailed Findings", yPos);
      yPos += 10;

      const realIssuesList = cleanedProblems.filter((p) => {
        const lower = p.toLowerCase();
        return (
          !lower.includes("excellent website performance") &&
          !lower.includes("good performance with minor improvements") &&
          !lower.includes("moderate issues found") &&
          !lower.includes("significant issues found") &&
          !lower.includes("critical issues found") &&
          !lower.includes("perfect score") &&
          !lower.includes("minor issues found") &&
          !lower.includes("all checks passed")
        );
      });

      if (realIssuesList.length === 0) {
        const iconY = yPos + 36;
        doc.setFillColor(colors.successSoft[0], colors.successSoft[1], colors.successSoft[2]);
        doc.circle(pageWidth / 2, iconY - 8, 16, "F");
        setFont(20, colors.success, "bold");
        writeText("OK", pageWidth / 2, iconY - 4, { align: "center" });
        setFont(16, colors.ink, "bold");
        writeText("All Clear", pageWidth / 2, iconY + 20, { align: "center" });
        setFont(10, colors.textLight, "normal");
        writeText("No issues detected - this website is performing exceptionally well.", pageWidth / 2, iconY + 30, { align: "center" });
        setFont(9, colors.textLighter, "normal");
        writeText("All security, performance, and accessibility checks passed successfully.", pageWidth / 2, iconY + 39, { align: "center" });
      } else {
        realIssuesList.forEach((issue, index) => {
          const lower = issue.toLowerCase();
          let severityColor = colors.accent;
          let severitySoft = colors.accentSoft;
          let severityLabel = "Info";

          if (lower.includes("critical") || lower.includes("no ssl") || lower.includes("fail")) {
            severityColor = colors.danger;
            severitySoft = colors.dangerSoft;
            severityLabel = "Critical";
          } else if (lower.includes("warning") || lower.includes("average") || lower.includes("consider") || lower.includes("not enabled")) {
            severityColor = colors.warning;
            severitySoft = colors.warningSoft;
            severityLabel = "Warning";
          }

          const recommendation = getRecommendation(issue);
          const issueLines = doc.splitTextToSize(issue, contentWidth - 48);
          const recLines = recommendation ? doc.splitTextToSize(`Recommended fix: ${recommendation}`, contentWidth - 48) : [];

          let cardHeight = 22;
          cardHeight += issueLines.length * 5.5;
          if (recLines.length > 0) cardHeight += recLines.length * 4.8 + 4;

          if (yPos + cardHeight > pageHeight - 28) {
            yPos = startInteriorPage();
            yPos = drawSectionTitle("Detailed Findings (continued)", yPos);
            yPos += 10;
          }

          const startY = yPos;
          drawRoundedRect(margin, startY, contentWidth, cardHeight, 7, colors.white, colors.border);
          doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
          doc.rect(margin, startY, 1.6, cardHeight, "F");
          doc.setFillColor(severitySoft[0], severitySoft[1], severitySoft[2]);
          doc.circle(margin + 16, startY + 11, 6.5, "F");
          setFont(8, severityColor, "bold");
          writeText(String(index + 1), margin + 16, startY + 13.3, { align: "center" });
          drawPill(severityLabel.toUpperCase(), pageWidth - margin - 4, 8, severityColor, {
            align: "right",
            y: startY + 6,
            fontSize: 6.5,
          });

          let currentY = startY + 9;
          issueLines.forEach((line, i) => {
            setFont(9, i === 0 ? colors.ink : colors.text, i === 0 ? "bold" : "normal");
            writeText(line, margin + 30, currentY + i * 5.5);
          });
          currentY += issueLines.length * 5.5 + 3.5;

          if (recLines.length > 0) {
            setFont(8, colors.textLight, "italic");
            recLines.forEach((line, i) => {
              writeText(line, margin + 30, currentY + i * 4.8);
            });
          }
          yPos = startY + cardHeight + 6;
        });
      }
      drawPageFooter(3, 0);

      // ============================================
      // PAGE 4: RECOMMENDATIONS
      // ============================================
      yPos = startInteriorPage();
      yPos = drawSectionTitle("Action Plan & Recommendations", yPos);
      yPos += 10;

      setFont(10, colors.text, "normal");
      writeText("Prioritized recommendations to improve performance, security, and user experience:", margin, yPos);
      yPos += 14;

      const recs = getRecommendations(cleanedProblems);
      recs.forEach((rec, index) => {
        const recLines = doc.splitTextToSize(rec, contentWidth - 48);
        const cardHeight = Math.max(recLines.length * 5.5 + 20, 30);

        if (yPos + cardHeight > pageHeight - 28) {
          yPos = startInteriorPage();
          yPos = drawSectionTitle("Action Plan (continued)", yPos);
          yPos += 10;
        }

        const startY = yPos;
        const priority = index < 2 ? "High" : index < 4 ? "Medium" : "Low";
        const priorityColor = index < 2 ? colors.danger : index < 4 ? colors.warning : colors.textLight;

        drawRoundedRect(margin, startY, contentWidth, cardHeight, 7, colors.surface, colors.border);
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.circle(margin + 15, startY + 11, 6.5, "F");
        setFont(8.5, colors.white, "bold");
        writeText(String(index + 1), margin + 15, startY + 13.3, { align: "center" });
        drawPill(`PRIORITY: ${priority.toUpperCase()}`, pageWidth - margin - 4, 8, priorityColor, {
          align: "right",
          y: startY + 6,
          fontSize: 6.5,
        });
        setFont(9.5, colors.text, "normal");
        recLines.forEach((line, i) => {
          writeText(line, margin + 29, startY + 9 + i * 5.5);
        });
        yPos = startY + cardHeight + 8;
      });

      yPos += 6;
      if (yPos + 24 > pageHeight - 28) {
        yPos = startInteriorPage();
      }
      drawRoundedRect(margin, yPos, contentWidth, 22, 8, colors.accentSoft, [199, 195, 250]);
      setFont(9.5, colors.accent, "bold");
      writeText("Need help implementing these recommendations? Contact your development team.", pageWidth / 2, yPos + 13, { align: "center" });
      drawPageFooter(4, 0);

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawPageFooter(i, totalPages, i === 1);
      }

      const dataUri = doc.output("datauristring");
      const base64Attachment = dataUri.split(",")[1];
      const baseSummaryName = url
        .replace(/https?:\/\//g, "")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 30);
      const filename = `${baseSummaryName}_audit_report.pdf`;

      return { filename, base64Attachment };
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF. Please try again.");
      return false;
    }
  };

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
  const sendEmailWithPDFLink = async () => {
    if (!email) {
      setSendStatus("Enter your email below first to receive the PDF report.");
      if (typeof onRequestEmail === "function") {
        onRequestEmail();
      }
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
  // HANDLERS
  // ============================================
  const handleSendReport = async () => {
    if (!email) {
      setSendStatus("Enter your email below first to receive the PDF report.");
      if (typeof onRequestEmail === "function") {
        onRequestEmail();
      }
      return;
    }
    await sendEmailWithPDFLink();
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
  // AUTO-SEND
  // ============================================
  useEffect(() => {
    if (!email || !grade) return;
    if (previousEmailRef.current === email) return;

    const timer = setTimeout(() => {
      handleSendReport();
    }, 1000);

    return () => clearTimeout(timer);
  }, [email, grade]);

  // ============================================
  // SCORE CALCULATION & RECOMMENDATIONS
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

          <div className="mt-6 sm:mt-8 space-y-3">
            <button
              onClick={handleSendReport}
              disabled={isSending}
              className="inline-flex w-full items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-sky-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Sending...'}
                </>
              ) : (
                "📧 Send PDF to Email"
              )}
            </button>

            <button
              onClick={handleManualDownload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl sm:rounded-3xl bg-slate-100 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ⬇️ Download PDF Only
            </button>
          </div>

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
              <div className={`rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                grade === 'A' ? 'bg-green-50 text-green-700' :
                grade === 'B' ? 'bg-blue-50 text-blue-700' :
                grade === 'C' ? 'bg-yellow-50 text-yellow-700' :
                grade === 'D' ? 'bg-orange-50 text-orange-700' :
                'bg-red-50 text-red-700'
              }`}>
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

          {/* ✅ Recommendations - Now Showing */}
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-white p-4 sm:p-5 lg:p-6 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">
                Recommendations
              </p>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {recommendations.length} tips
              </span>
            </div>
            <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
              {recommendations.slice(0, 4).map((rec, idx) => {
                const emoji = rec.match(/^[^\s]+/)?.[0] || '•';
                const text = rec.replace(/^[^\s]+\s/, '');
                return (
                  <li key={idx} className="flex gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl bg-slate-50 p-3 sm:p-4 text-xs sm:text-sm text-slate-700">
                    <span className="mt-0.5 text-base flex-shrink-0">{emoji}</span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                );
              })}
            </ul>
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
              PDF Report Sent! ✅
            </h3>
            <p className="mt-3 text-center text-sm sm:text-base text-slate-600">
              Your website audit report has been sent to:
            </p>
            <p className="mt-2 text-center font-semibold text-slate-900 break-all">
              {email}
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