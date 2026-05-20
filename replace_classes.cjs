const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  // Text Colors
  'text-slate-900': 'text-white',
  'text-slate-800': 'text-white/90',
  'text-slate-700': 'text-white/80',
  'text-slate-600': 'text-white/70',
  'text-slate-500': 'text-white/60',
  'text-slate-400': 'text-white/50',
  
  // Background Colors
  'bg-white': 'bg-brand-200',
  'bg-slate-50': 'bg-brand-100',
  'bg-slate-100': 'bg-brand-100',
  
  // Border Colors
  'border-slate-100': 'border-white/5',
  'border-slate-200': 'border-white/10',
  'border-slate-300': 'border-white/20',
  'border-gray-100': 'border-white/5',
  'border-gray-200': 'border-white/10',

  // Brand Colors used in light mode text/icons
  'text-brand-950': 'text-white',
  'text-brand-900': 'text-white',
  'text-brand-800': 'text-white/90',
  
  // Light brand backgrounds usually used for icons or headers
  'bg-brand-100': 'bg-brand-300',
  'bg-brand-50': 'bg-brand-100',
  
  // Shadows
  'shadow-sm': 'shadow-premium',
  'shadow-md': 'shadow-premium',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Perform replacements
      for (const [oldClass, newClass] of Object.entries(replacements)) {
        // Regex to match the class as a whole word
        const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
        content = content.replace(regex, newClass);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

processDirectory(directoryPath);
console.log('Class replacement complete!');
