// Render Arabic with the browser's shaping engine, then embed the page in a PDF.
// This keeps exports available offline without a font or PDF service dependency.
const SENBReport = (() => {
    const clinicianName = 'SLP.AHMAD GHANEM';
    const formatDate = date => new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    function wordFindings(summary) {
        const describe = types => types.map(type => `${type.label} (${type.percentage}%)`).join('، ');
        if (summary.strongest.length) return [
            `الأعلى أداءً في هذا الاختبار: ${describe(summary.strongest)}`,
            `الأقل أداءً في هذا الاختبار: ${describe(summary.weakest)}`
        ];
        return summary.wordTypes.length ? [`الأداء متساوٍ للأنواع المعروضة (${summary.wordTypes[0].percentage}%).`] : [];
    }
    function pdfFromCanvas(value) {
        const pages = Array.isArray(value) ? value : [value];
        const encoder = new TextEncoder();
        const parts = [], offsets = [0];
        let length = 0;
        const append = value => {
            const bytes = typeof value === 'string' ? encoder.encode(value) : value;
            parts.push(bytes);
            length += bytes.length;
        };
        const object = (id, body) => {
            offsets[id] = length;
            append(`${id} 0 obj\n${body}\nendobj\n`);
        };
        append('%PDF-1.4\n');
        object(1, '<< /Type /Catalog /Pages 2 0 R >>');
        object(2, `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 3} 0 R`).join(' ')}] /Count ${pages.length} >>`);
        pages.forEach((canvas, index) => {
            const pageId = 3 + index * 3, imageId = pageId + 1, contentId = pageId + 2;
            const jpeg = Uint8Array.from(atob(canvas.toDataURL('image/jpeg', .95).split(',')[1]), char => char.charCodeAt(0));
            object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Report ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
            offsets[imageId] = length;
            append(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
            append(jpeg);
            append('\nendstream\nendobj\n');
            const commands = 'q\n595.28 0 0 841.89 0 0 cm\n/Report Do\nQ\n';
            object(contentId, `<< /Length ${encoder.encode(commands).length} >>\nstream\n${commands}endstream`);
        });
        const count = 3 + pages.length * 3;
        const xref = length;
        append(`xref\n0 ${count}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
        return new Blob(parts, { type: 'application/pdf' });
    }
    function render(summary, expressive, folder, date) {
        const pages = [];
        let canvas, ctx, y;
        const bottom = 1560;
        const text = (value, x, top, size = 28, color = '#334155', align = 'right', bold = false, direction = 'rtl') => {
            ctx.direction = direction;
            ctx.fillStyle = color;
            ctx.font = `${bold ? '700' : '400'} ${size}px Tajawal, Arial, sans-serif`;
            ctx.textAlign = align;
            ctx.fillText(String(value), x, top);
        };
        function newPage() {
            canvas = document.createElement('canvas');
            canvas.width = 1240;
            canvas.height = 1754;
            ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textBaseline = 'middle';
            pages.push(canvas);
            text('جملة', 1160, 80, 34, '#0284c7', 'right', true);
            text(expressive ? 'تقرير اختبار التعبير' : 'تقرير اختبار الفهم', 1160, 145, 44, '#075985', 'right', true);
            text(clinicianName, 1160, 210, 28, '#334155', 'right', true, 'ltr');
            text(`تاريخ الاختبار: ${formatDate(date)}`, 1160, 260, 25);
            text(`${folder} كلمات · ${summary.trials} محاولة`, 1160, 310, 26);
            y = 365;
        }
        function wrap(value, width, size = 26) {
            ctx.font = `400 ${size}px Tajawal, Arial, sans-serif`;
            const lines = [''];
            for (const word of String(value).split(/\s+/)) {
                const index = lines.length - 1;
                const next = `${lines[index]} ${word}`.trim();
                if (ctx.measureText(next).width > width && lines[index]) lines.push(word);
                else lines[index] = next;
            }
            return lines;
        }
        function paragraph(value, size = 24) {
            for (const line of wrap(value, 1080, size)) {
                if (y + 40 > bottom) newPage();
                text(line, 1160, y + 20, size);
                y += 40;
            }
            y += 15;
        }
        function table(title, headings, rows) {
            const columns = headings.length === 3
                ? [{ x: 1135, width: 580, align: 'right' }, { x: 410, width: 200, align: 'center' }, { x: 180, width: 140, align: 'center' }]
                : [{ x: 1135, width: 790, align: 'right' }, { x: 250, width: 220, align: 'center' }];
            function header() {
                text(title, 1160, y + 20, 31, '#075985', 'right', true);
                y += 50;
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(80, y, 1080, 65);
                headings.forEach((heading, index) => text(heading, columns[index].x, y + 32, 25, '#075985', columns[index].align, true));
                y += 65;
            }
            if (y + 200 > bottom) newPage();
            header();
            for (const row of rows) {
                const lines = wrap(row[0], columns[0].width);
                const height = Math.max(78, lines.length * 35 + 30);
                if (y + height > bottom) { newPage(); header(); }
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(80, y, 1080, height - 2);
                lines.forEach((line, index) => text(line, columns[0].x, y + height / 2 + (index - (lines.length - 1) / 2) * 35, 26));
                row.slice(1).forEach((value, index) => text(value, columns[index + 1].x, y + height / 2, 28, '#0284c7', 'center', true, 'ltr'));
                y += height;
            }
            y += 25;
        }
        newPage();
        text(expressive ? `MLU = ${summary.mlu}` : `${summary.percentage}%`, 620, y + 45, 54, '#0284c7', 'center', true, 'ltr');
        y += 115;
        paragraph(expressive ? 'متوسط طول الملفوظ بالكلمات' : 'النسبة الكلية للإجابات الصحيحة', 28);
        if (expressive) paragraph('MLU بالكلمات = مجموع الكلمات المحددة ÷ عدد المحاولات المكتملة');
        table('نتائج المجموعات الفرعية', ['المجموعة الفرعية', expressive ? 'MLU بالكلمات' : 'الإجابات الصحيحة', expressive ? 'المحاولات' : 'النسبة'], summary.groups.map(group => [
            `${group.id}. ${group.name}`, expressive ? group.mlu : `${group.earned} / ${group.possible}`, expressive ? group.trials : `${group.percentage}%`
        ]));
        if (!expressive) paragraph('النسبة = الإجابات الصحيحة ÷ مجموع المحاولات');
        pages.forEach((page, index) => {
            ctx = page.getContext('2d');
            text(`${index + 1} / ${pages.length}`, 620, 1675, 23, '#64748b', 'center', false, 'ltr');
        });
        return pages;
    }
    return { clinicianName, formatDate, wordFindings, pdfFromCanvas, render };
})();

async function downloadActivityResults() {
    if (activity?.mount !== 'summary') return;
    const reportActivity = activity;
    const button = document.getElementById('downloadActivityResultsBtn');
    const status = document.getElementById('reportStatus');
    button.disabled = true;
    status.textContent = '';
    try {
        await document.fonts.ready;
        const expressive = reportActivity.mode === 'expressive';
        const summary = SENBActivities.assessmentSummary(reportActivity.results, expressive, reportActivity.folder);
        const canvas = SENBReport.render(summary, expressive, reportActivity.folder, reportActivity.reportDate);
        const url = URL.createObjectURL(SENBReport.pdfFromCanvas(canvas));
        const link = document.createElement('a');
        link.href = url;
        link.download = `senb-${reportActivity.mode}-${reportActivity.folder}-words.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        status.textContent = 'تعذّر تنزيل التقرير. حاول مجدداً.';
        console.error('SENB report export failed', error);
    } finally {
        button.disabled = false;
    }
}
