import * as XLSX from 'xlsx';

export const exportMarkdownTableToExcel = (markdownContent: string, filename: string = "maya_export") => {
    // Extract all markdown tables from the content
    // Regex matches the standard table format: | Header | Header |\n|---|---|\n| Data | Data |
    const tableRegex = /\|(.+)\|[\r\n]+\|[-| :]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    let match;
    const wb = XLSX.utils.book_new();
    let tableIndex = 1;
    let hasTables = false;

    while ((match = tableRegex.exec(markdownContent)) !== null) {
        hasTables = true;
        // Parse rows and remove Markdown formatting
        const rows = match[0]
            .split('\n')
            .filter(row => row.trim() && !row.match(/^\|[-| :]+\|$/))
            .map(row =>
                row.split('|')
                   .filter((_, i, arr) => i > 0 && i < arr.length - 1)
                   .map(cell => {
                       let text = cell.trim();
                       // Remove markdown bold (**text** or __text__)
                       text = text.replace(/\*\*(.*?)\*\*/g, '$1');
                       text = text.replace(/__(.*?)__/g, '$1');
                       return text;
                   })
            );

        if (rows.length > 0) {
            const ws = XLSX.utils.aoa_to_sheet(rows);
            // Optionally auto-size columns for better Excel UI
            const colWidths = rows[0].map((_, colIndex) => {
                const maxLen = Math.max(...rows.map(row => (row[colIndex] ? row[colIndex].toString().length : 0)));
                return { wch: maxLen + 2 }; 
            });
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, `Data ${tableIndex}`);
            tableIndex++;
        }
    }

    if (!hasTables) return;

    // Generate output and auto-download it as an XLSX file natively instead of CSV
    XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
};
