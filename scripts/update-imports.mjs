import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
  [/from ['"](?:\.\.\/)+components\/ui\//g, "from '@/shared/components/ui/"],
  [/from ['"](?:\.\.\/)+components\/feedback\//g, "from '@/shared/components/feedback/"],
  [/from ['"](?:\.\.\/)+components\/forms\//g, "from '@/shared/components/forms/"],
  [/from ['"](?:\.\.\/)+components\/layout\//g, "from '@/shared/components/layout/"],
  [/from ['"](?:\.\.\/)+components\/settings\//g, "from '@/shared/components/settings/"],
  [/from ['"](?:\.\.\/)+theme\//g, "from '@/shared/theme/"],
  [/from ['"](?:\.\.\/)+utils\/uuid/g, "from '@/shared/utils/uuid"],
  [/from ['"](?:\.\.\/)+utils\/session/g, "from '@/shared/utils/session"],
  [/from ['"](?:\.\.\/)+utils\/tenant/g, "from '@/shared/utils/tenant"],
  [/from ['"](?:\.\.\/)+utils\/timestamps/g, "from '@/shared/utils/timestamps"],
  [/from ['"](?:\.\.\/)+hooks\/useAppSnackbar/g, "from '@/shared/hooks/useAppSnackbar"],
  [/from ['"](?:\.\.\/)+hooks\/useMobileDrawer/g, "from '@/shared/hooks/useMobileDrawer"],
  [/from ['"]\.\/httpClient/g, "from '@/shared/api/httpClient"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(js|jsx)$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      for (const [re, rep] of replacements) {
        const next = content.replace(re, rep);
        if (next !== content) {
          content = next;
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(full, content);
    }
  }
}

walk(srcDir);

const httpClient = path.join(srcDir, 'shared/api/httpClient.js');
let hc = fs.readFileSync(httpClient, 'utf8');
hc = hc.replace(/from ['"]\.\.\/config\/appConfig['"]/, "from '@/config/appConfig'");
fs.writeFileSync(httpClient, hc);

console.log('Done');
