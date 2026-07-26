const PDFDocument = require('pdfkit');

/**
 * PDF Service
 * 
 * Dedicated service to generate professional PDF analysis reports using PDFKit.
 * Enforces clean architecture by encapsulating document structure, styling, multi-page handling,
 * and binary stream piping.
 */
const pdfService = {
  /**
   * Generates a styled PDF analysis report and streams it directly to the Express response stream.
   * 
   * @param {Object} resume - Mongoose Resume document containing analysis data
   * @param {string} candidateName - Full name of the candidate/user
   * @param {import('express').Response} resStream - Express response stream
   * @returns {Promise<void>} Resolves when PDF finishes streaming to response
   */
  generateResumeAnalysisPdf: (resume, candidateName, resStream) => {
    return new Promise((resolve, reject) => {
      let isResolvedOrRejected = false;

      const safeReject = (err) => {
        if (!isResolvedOrRejected) {
          isResolvedOrRejected = true;
          reject(err);
        }
      };

      const safeResolve = () => {
        if (!isResolvedOrRejected) {
          isResolvedOrRejected = true;
          resolve();
        }
      };

      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true, // Enables page numbering loop across all pages
          info: {
            Title: `AI Resume Analysis - ${resume.originalFileName || 'Report'}`,
            Author: 'AI Resume Analyzer & Interview Coach',
            Subject: 'ATS Resume Analysis Report',
            Keywords: 'Resume, ATS, Gemini AI, Analysis, Interview',
          },
        });

        // Event Listeners for robust stream error handling
        doc.on('error', (err) => safeReject(err));
        resStream.on('error', (err) => safeReject(err));
        resStream.on('finish', () => safeResolve());
        resStream.on('close', () => safeResolve());

        // Pipe document stream directly into Express response
        doc.pipe(resStream);

        const analysis = resume.analysis || {};
        const atsScore = typeof analysis.atsScore === 'number' ? analysis.atsScore : 0;
        const generatedDate = analysis.analyzedAt
          ? new Date(analysis.analyzedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

        // Curated Palette for High Quality PDF Aesthetic
        const colors = {
          primary: '#3730A3',      // Deep Indigo
          secondary: '#1E293B',    // Slate 800
          accent: '#4F46E5',       // Indigo 600
          emerald: '#059669',      // Emerald 600
          amber: '#D97706',        // Amber 600
          rose: '#DC2626',         // Red 600
          muted: '#64748B',        // Slate 500
          lightBg: '#F8FAFC',      // Slate 50
          cardBorder: '#E2E8F0',   // Slate 200
        };

        const maxPageBottom = 740; // Height threshold before inserting page break

        /**
         * Helper to check vertical overflow and add page if required
         */
        const checkOverflow = (heightNeeded = 40) => {
          if (doc.y + heightNeeded > maxPageBottom) {
            doc.addPage();
            doc.y = 40;
          }
        };

        // ==========================================
        // 1. HEADER SECTION
        // ==========================================
        doc.rect(40, 40, 515, 60).fill(colors.primary);

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(18)
           .text('AI Resume Analyzer & Interview Coach', 55, 52, { width: 485, align: 'left' });

        doc.fillColor('#E0E7FF')
           .font('Helvetica')
           .fontSize(10.5)
           .text('ATS Resume Evaluation & Actionable AI Report', 55, 76, { width: 485, align: 'left' });

        doc.y = 115;

        // ==========================================
        // 2. CANDIDATE & FILE METADATA CARD
        // ==========================================
        checkOverflow(85);
        const metaBoxY = doc.y;
        doc.rect(40, metaBoxY, 515, 80).fillAndStroke(colors.lightBg, colors.cardBorder);

        // Column 1: Candidate Info (with width limits to prevent overlapping Column 2)
        doc.fillColor(colors.secondary).font('Helvetica-Bold').fontSize(9.5);
        doc.text('Candidate Name:', 55, metaBoxY + 12);
        doc.font('Helvetica').fillColor(colors.primary).text(candidateName || 'N/A', 150, metaBoxY + 12, { width: 175, height: 14, ellipsis: true });

        doc.fillColor(colors.secondary).font('Helvetica-Bold');
        doc.text('Resume File:', 55, metaBoxY + 32);
        doc.font('Helvetica').fillColor(colors.secondary).text(resume.originalFileName || 'N/A', 150, metaBoxY + 32, { width: 175, height: 14, ellipsis: true });

        doc.fillColor(colors.secondary).font('Helvetica-Bold');
        doc.text('Target Position:', 55, metaBoxY + 52);
        doc.font('Helvetica').fillColor(colors.secondary).text(resume.jobTitle || 'General Application', 150, metaBoxY + 52, { width: 175, height: 14, ellipsis: true });

        // Column 2: Date & System Info
        doc.fillColor(colors.secondary).font('Helvetica-Bold');
        doc.text('Report Date:', 340, metaBoxY + 12);
        doc.font('Helvetica').fillColor(colors.muted).text(generatedDate, 420, metaBoxY + 12, { width: 120, height: 14 });

        doc.fillColor(colors.secondary).font('Helvetica-Bold');
        doc.text('Engine Version:', 340, metaBoxY + 32);
        doc.font('Helvetica').fillColor(colors.muted).text('Gemini 1.5 Pro', 420, metaBoxY + 32, { width: 120, height: 14 });

        doc.y = metaBoxY + 95;

        // ==========================================
        // 3. ATS SCORE CALLOUT BOX
        // ==========================================
        checkOverflow(70);
        const scoreBoxY = doc.y;
        let scoreColor = colors.emerald;
        let scoreBadge = 'Top Match';

        if (atsScore < 70) {
          scoreColor = colors.amber;
          scoreBadge = 'Needs Work';
        }
        if (atsScore < 50) {
          scoreColor = colors.rose;
          scoreBadge = 'Low Alignment';
        }

        doc.rect(40, scoreBoxY, 515, 65).fillAndStroke('#EEF2FF', colors.accent);

        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(11);
        doc.text('OVERALL ATS COMPATIBILITY SCORE', 55, scoreBoxY + 14);

        doc.fillColor(scoreColor).font('Helvetica-Bold').fontSize(26);
        doc.text(`${atsScore} / 100`, 390, scoreBoxY + 12, { width: 150, align: 'right' });

        doc.fillColor(colors.muted).font('Helvetica').fontSize(9);
        doc.text(`Match Rating: ${scoreBadge}`, 55, scoreBoxY + 36);

        doc.y = scoreBoxY + 80;

        // ==========================================
        // 4. EXECUTIVE AI SUMMARY
        // ==========================================
        if (analysis.summary && analysis.summary.trim()) {
          checkOverflow(80);
          doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(13);
          doc.text('Executive AI Summary', 40, doc.y);
          doc.moveDown(0.4);

          const summaryText = analysis.summary.trim();
          const summaryHeight = doc.heightOfString(summaryText, { width: 491, fontSize: 9.5 }) + 20;

          checkOverflow(summaryHeight + 10);
          const sumBoxY = doc.y;
          doc.rect(40, sumBoxY, 515, summaryHeight).fillAndStroke(colors.lightBg, colors.cardBorder);

          doc.fillColor(colors.secondary)
             .font('Helvetica')
             .fontSize(9.5)
             .text(summaryText, 52, sumBoxY + 10, { width: 491, lineGap: 3 });

          doc.y = sumBoxY + summaryHeight + 15;
        }

        // ==========================================
        // 5. STRENGTHS SECTION
        // ==========================================
        const strengths = Array.isArray(analysis.strengths) ? analysis.strengths.filter(Boolean) : [];
        if (strengths.length > 0) {
          checkOverflow(60);
          doc.fillColor(colors.emerald).font('Helvetica-Bold').fontSize(13);
          doc.text('Key Strengths Identified', 40, doc.y);
          doc.moveDown(0.4);

          strengths.forEach((str) => {
            const itemHeight = doc.heightOfString(str, { width: 485, fontSize: 9.5 }) + 6;
            checkOverflow(itemHeight);

            const bulletY = doc.y;
            doc.circle(48, bulletY + 5, 3).fill(colors.emerald);
            doc.fillColor(colors.secondary)
               .font('Helvetica')
               .fontSize(9.5)
               .text(str, 58, bulletY, { width: 485, lineGap: 2 });

            doc.y = Math.max(doc.y, bulletY + itemHeight);
          });
          doc.moveDown(0.6);
        }

        // ==========================================
        // 6. WEAKNESSES & GAPS SECTION
        // ==========================================
        const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses.filter(Boolean) : [];
        if (weaknesses.length > 0) {
          checkOverflow(60);
          doc.fillColor(colors.amber).font('Helvetica-Bold').fontSize(13);
          doc.text('Weaknesses & Resume Gaps', 40, doc.y);
          doc.moveDown(0.4);

          weaknesses.forEach((weak) => {
            const itemHeight = doc.heightOfString(weak, { width: 485, fontSize: 9.5 }) + 6;
            checkOverflow(itemHeight);

            const bulletY = doc.y;
            doc.rect(45, bulletY + 2, 6, 6).fill(colors.amber);
            doc.fillColor(colors.secondary)
               .font('Helvetica')
               .fontSize(9.5)
               .text(weak, 58, bulletY, { width: 485, lineGap: 2 });

            doc.y = Math.max(doc.y, bulletY + itemHeight);
          });
          doc.moveDown(0.6);
        }

        // ==========================================
        // 7. MISSING SKILLS & KEYWORDS SECTION
        // ==========================================
        const missingSkills = Array.isArray(analysis.missingSkills) ? analysis.missingSkills.filter(Boolean) : [];
        if (missingSkills.length > 0) {
          checkOverflow(60);
          doc.fillColor(colors.rose).font('Helvetica-Bold').fontSize(13);
          doc.text('Missing Skills & Recommended Keywords', 40, doc.y);
          doc.moveDown(0.4);

          const skillsList = missingSkills.join('   •   ');
          const skillsHeight = doc.heightOfString(skillsList, { width: 495, fontSize: 9.5 }) + 16;
          checkOverflow(skillsHeight);

          const skillBoxY = doc.y;
          doc.rect(40, skillBoxY, 515, skillsHeight).fillAndStroke('#FEF2F2', '#FCA5A5');

          doc.fillColor(colors.rose)
             .font('Helvetica-Bold')
             .fontSize(9.5)
             .text(skillsList, 50, skillBoxY + 8, { width: 495, lineGap: 4 });

          doc.y = skillBoxY + skillsHeight + 15;
        }

        // ==========================================
        // 8. ACTIONABLE IMPROVEMENTS SECTION
        // ==========================================
        const improvements = Array.isArray(analysis.improvements) ? analysis.improvements.filter(Boolean) : [];
        if (improvements.length > 0) {
          checkOverflow(60);
          doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(13);
          doc.text('Actionable Improvement Suggestions', 40, doc.y);
          doc.moveDown(0.4);

          improvements.forEach((imp, index) => {
            const itemText = `${index + 1}. ${imp}`;
            const itemHeight = doc.heightOfString(itemText, { width: 495, fontSize: 9.5 }) + 6;
            checkOverflow(itemHeight);

            const impY = doc.y;
            doc.fillColor(colors.secondary)
               .font('Helvetica')
               .fontSize(9.5)
               .text(itemText, 45, impY, { width: 495, lineGap: 2 });

            doc.y = Math.max(doc.y, impY + itemHeight);
          });
        }

        // ==========================================
        // PAGE NUMBERS & FOOTER LOOP
        // ==========================================
        const range = doc.bufferedPageRange();
        const totalPages = range.count;

        for (let i = range.start; i < range.start + totalPages; i++) {
          doc.switchToPage(i);

          // Top Header Border line on pages 2+
          if (i > range.start) {
            doc.rect(40, 25, 515, 2).fill(colors.primary);
            doc.fillColor(colors.muted).font('Helvetica').fontSize(8);
            doc.text(`AI Resume Analysis - ${candidateName}`, 40, 14, { width: 515, align: 'left' });
          }

          // Bottom Footer Line & Page Numbers
          doc.rect(40, 780, 515, 0.5).fill(colors.cardBorder);

          doc.fillColor(colors.muted).font('Helvetica').fontSize(8);
          doc.text('AI Resume Analyzer & Interview Coach • Confidential', 40, 788, { align: 'left' });
          doc.text(`Page ${i + 1} of ${totalPages}`, 40, 788, { width: 515, align: 'right' });
        }

        // Finalize document stream
        doc.end();
      } catch (err) {
        safeReject(err);
      }
    });
  },
};

module.exports = pdfService;
