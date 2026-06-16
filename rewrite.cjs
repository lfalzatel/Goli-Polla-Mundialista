const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const insert_vars = `  const isConsoleMode = themeMode === 'kilocode' || themeMode === 'cyberpunk';
  const consoleHex = themeMode === 'cyberpunk' ? '#00FFB2' : '#e1b12c';
  const consoleTextClass = themeMode === 'cyberpunk' ? 'text-[#00FFB2]' : 'text-[#e1b12c]';
  const consoleBgClass = themeMode === 'cyberpunk' ? 'bg-[#00FFB2]' : 'bg-[#e1b12c]';
  const consoleBorderClass = themeMode === 'cyberpunk' ? 'border-[#00FFB2]' : 'border-[#e1b12c]';
  const consoleShadowClass = themeMode === 'cyberpunk' ? 'shadow-[#00FFB2]/20' : 'shadow-[#e1b12c]/20';

  const handleTabClick =`;

content = content.replace('  const handleTabClick =', insert_vars);

const nav_old = '<nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-4 pt-2.5 bg-[#034226] border-t-4 border-[#e1b12c] shadow-[0_-5px_20px_rgba(0,0,0,0.5)] rounded-t-3xl">';
const nav_new = '<nav className={`fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-4 pt-2.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] ${isConsoleMode ? "bg-[#0a0b0d] border-t border-white/10 rounded-none" : "bg-[#034226] border-t-4 border-[#e1b12c] rounded-t-3xl"}`}>';
content = content.replace(nav_old, nav_new);

const tabs = ['inicio', 'reglas', 'perfil', 'ranking'];

for (const tab of tabs) {
    const btn_pattern = new RegExp(`activeTab === '${tab}'\\s*\\?\\s*\`bg-\\[#e1b12c\\] text-\\[#034226\\] w-16 h-14 rounded-xl -translate-y-4 \\$\\{tabRotationToggle \\? 'rotate-6' : '-rotate-6'\\} scale-110 shadow-lg shadow-\\[#e1b12c\\]/40 border-2 border-\\[#034226\\]\`\\s*:\\s*'py-2\\.5 px-4 text-white/60 hover:text-white'`);
    
    const btn_new = `activeTab === '${tab}' 
                ? (isConsoleMode ? \`\${consoleBgClass} text-black w-16 h-14 rounded-none -translate-y-4 \${tabRotationToggle ? 'rotate-3' : '-rotate-3'} scale-110 border border-black shadow-lg \${consoleShadowClass} scanlines-bg\` : \`bg-[#e1b12c] text-[#034226] w-16 h-14 rounded-xl -translate-y-4 \${tabRotationToggle ? 'rotate-6' : '-rotate-6'} scale-110 shadow-lg shadow-[#e1b12c]/40 border-2 border-[#034226]\`)
                : (isConsoleMode ? \`py-2.5 px-4 \${consoleTextClass} opacity-60 hover:opacity-100 hover:bg-white/5\` : 'py-2.5 px-4 text-white/60 hover:text-white')`;
                
    content = content.replace(btn_pattern, btn_new);

    const span_pattern = new RegExp(`<span className={\`font-sans mt-0\\.5 uppercase tracking-wide \\$\\{activeTab === '${tab}' \\? 'text-\\[9px\\] font-bold' : 'text-\\[10px\\] font-semibold'\\}\`}`);
    const span_new = `<span className={\`\${isConsoleMode ? 'font-mono tracking-widest' : 'font-sans tracking-wide'} mt-0.5 uppercase \${activeTab === '${tab}' ? 'text-[9px] font-bold' : 'text-[10px] font-semibold'}\`}`;
    content = content.replace(span_pattern, span_new);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
