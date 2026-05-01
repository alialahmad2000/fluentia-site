require('dotenv').config({ path: '../Desktop/fluentia-lms/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials. Pull from LMS .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  // 1. Read source
  const srcPath = path.join(__dirname, '..', 'src', 'App.jsx');
  const sourceJsx = fs.readFileSync(srcPath, 'utf8');

  // 2. Get git metadata
  const commitSha = execSync('git rev-parse HEAD', { cwd: path.join(__dirname, '..') }).toString().trim();
  const gitTag = 'v1-classic-2026-05-01';
  const gitBranch = 'archive/landing-v1-classic';

  // 3. Extract packages snapshot from source
  const packagesSnapshot = {
    extracted_from: 'src/App.jsx',
    note: 'Manual extraction — see source_jsx for complete fidelity',
    visible_packages: [
      { name: 'أساس', price: 750, classes: 8, position: 1 },
      { name: 'طلاقة', price: 1100, classes: 8, popular: true, position: 2 },
      { name: 'تميّز', price: 1500, classes: 8, premium: true, position: 3 },
      { name: 'IELTS', price: 2000, classes: null, standalone: true }
    ]
  };

  // 4. Copy snapshot — key marketing strings
  const copySnapshot = {
    hero_headline: 'تكلّم إنجليزي بطلاقة',
    discount_active: true,
    discount_percent: 20,
    cta_primary: 'احجز كلاس تجريبي مجاني',
    seats_max: 7,
    archived_reason: 'Replaced by premium editorial redesign targeting professional women'
  };

  // 5. Get rendered HTML (best-effort — fetch live site)
  let renderedHtml = '<!-- Live HTML fetch skipped — preserve source_jsx -->';
  try {
    const res = await fetch('https://fluentia.academy', {
      headers: { 'User-Agent': 'fluentia-archive-bot' }
    });
    if (res.ok) renderedHtml = await res.text();
  } catch (e) {
    console.warn('Could not fetch live HTML:', e.message);
  }

  // 6. Insert
  const { data, error } = await supabase
    .from('archived_landing_pages')
    .insert({
      version_label: 'v1-classic-2026-05-01',
      git_commit_sha: commitSha,
      git_tag: gitTag,
      git_branch: gitBranch,
      rendered_html: renderedHtml,
      source_jsx: sourceJsx,
      packages_snapshot: packagesSnapshot,
      copy_snapshot: copySnapshot,
      notes: 'Classic mass-market landing — first iteration of fluentia.academy. Archived before premium editorial redesign. Restorable via git checkout v1-classic-2026-05-01.'
    })
    .select()
    .single();

  if (error) {
    console.error('Archive failed:', error);
    process.exit(1);
  }

  console.log('✅ Archived successfully');
  console.log('   ID:', data.id);
  console.log('   Version:', data.version_label);
  console.log('   Source size:', sourceJsx.length, 'chars');
  console.log('   HTML size:', renderedHtml.length, 'chars');
})();
