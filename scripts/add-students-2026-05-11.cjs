// scripts/add-students-2026-05-11.cjs
// Idempotent provision script for 2 new students (May 11, 2026)
// - سارة فهد العرابي: A2, private package, 3000 SAR, NO group
// - لمياء سعود الحربي: A1, asas package, 750 SAR, A1 group (discovered)

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TODAY = new Date().toISOString().slice(0, 10);

const STUDENTS = [
  {
    fullName: 'سارة فهد العرابي',
    email: 'sama33467@gmail.com',
    password: 'Fluentia2026!Sa67',
    academicLevel: 2,        // A2
    package: 'private',
    customPrice: 3000,
    needsGroup: false,       // private — no group
  },
  {
    fullName: 'لمياء سعود الحربي',
    email: 'almooshhh11@gmail.com',
    password: 'Fluentia2026!Lm11',
    academicLevel: 1,        // A1
    package: 'asas',
    customPrice: 750,
    needsGroup: true,        // joins A1 group
  },
];

// ── PHASE A: SCHEMA DISCOVERY ─────────────────────────────────
async function discoverSchema() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  PHASE A — SCHEMA DISCOVERY');
  console.log('═══════════════════════════════════════════════════\n');

  // 1) package enum values — probe via distinct values in students table
  const { data: distinctPkg } = await supabase
    .from('students').select('package').limit(1000);
  const pkgValues = [...new Set((distinctPkg || []).map(r => r.package).filter(Boolean))];
  console.log(`Package enum values seen: ${pkgValues.join(', ')}`);
  if (!pkgValues.includes('private')) {
    throw new Error(`'private' missing from package enum. STOP — Ali must decide whether to add it via migration.`);
  }
  if (!pkgValues.includes('asas')) {
    throw new Error(`'asas' missing from package enum. STOP.`);
  }
  console.log('✓ package enum: private ✅  asas ✅');

  // 2) must_change_password location — confirmed on profiles during manual discovery
  // Verified: 2026-05-11 discover-2026-05-11.cjs run
  let mcpTable = null;
  const { data: stuSample } = await supabase.from('students').select('*').limit(1);
  if (stuSample && stuSample[0] && 'must_change_password' in stuSample[0]) {
    mcpTable = 'students';
  } else {
    const { data: profSample } = await supabase.from('profiles').select('*').limit(1);
    if (profSample && profSample[0] && 'must_change_password' in profSample[0]) {
      mcpTable = 'profiles';
    }
  }
  if (!mcpTable) {
    throw new Error(`must_change_password column not found on students or profiles. STOP.`);
  }
  console.log(`must_change_password lives on: ${mcpTable}`);

  // 3) A1 group — manually confirmed: المجموعة 2 (bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb)
  //    Multiple A1 groups exist; Ali chose this one on 2026-05-11.
  const CHOSEN_A1_ID = 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  const { data: a1GroupRow, error: gErr } = await supabase
    .from('groups')
    .select('id, name, code, level, max_students')
    .eq('id', CHOSEN_A1_ID)
    .maybeSingle();
  if (gErr || !a1GroupRow) {
    throw new Error(`A1 group ${CHOSEN_A1_ID} not found. STOP.`);
  }
  const a1Group = a1GroupRow;

  const { count: a1Count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', a1Group.id)
    .eq('status', 'active');
  console.log(`A1 group: ${a1Group.name} (${a1Group.code}) — ${a1Count}/${a1Group.max_students} active`);
  if (a1Count >= a1Group.max_students) {
    console.warn(`⚠️  A1 group at capacity (${a1Count}/${a1Group.max_students}). Will exceed by adding لمياء — Ali was warned.`);
  }

  console.log('✓ Discovery complete.\n');
  return { mcpTable, a1Group };
}

// ── PHASE B: PROVISION ────────────────────────────────────────
async function provision(student, ctx) {
  const email = student.email.toLowerCase();
  console.log(`\n──── ${student.fullName} (${email}) ────`);

  // Check if profile/auth already exists (idempotent)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  let userId;

  if (existingProfile) {
    console.log(`  ⚠️  Profile already exists (id=${existingProfile.id}) — SKIPPING auth creation.`);
    userId = existingProfile.id;
  } else {
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: student.password,
      email_confirm: true,
      user_metadata: { full_name: student.fullName },
    });
    if (authErr) throw new Error(`Auth create failed for ${email}: ${authErr.message}`);
    userId = authData.user.id;
    console.log(`  ✅ Auth user created (id=${userId})`);

    // Upsert profile
    const profilePayload = {
      id: userId,
      email,
      full_name: student.fullName,
      role: 'student',
    };
    if (ctx.mcpTable === 'profiles') profilePayload.must_change_password = true;

    const { error: pErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });
    if (pErr) throw new Error(`Profile upsert failed for ${email}: ${pErr.message}`);
    console.log(`  ✅ Profile upserted`);
  }

  // Upsert student row
  const studentPayload = {
    id: userId,
    academic_level: student.academicLevel,
    package: student.package,
    custom_price: student.customPrice,
    group_id: student.needsGroup ? ctx.a1Group.id : null,
    enrollment_date: TODAY,
    status: 'active',
    payment_day: new Date().getDate(),
  };
  if (ctx.mcpTable === 'students') studentPayload.must_change_password = true;

  const { error: sErr } = await supabase
    .from('students')
    .upsert(studentPayload, { onConflict: 'id' });
  if (sErr) throw new Error(`Student upsert failed for ${email}: ${sErr.message}`);

  console.log(`  ✅ Student record upserted (level=${student.academicLevel}, pkg=${student.package}, price=${student.customPrice}, group=${student.needsGroup ? ctx.a1Group.name : 'NULL (private)'})`);
}

// ── PHASE C: VERIFY ───────────────────────────────────────────
async function verify() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  PHASE C — VERIFICATION');
  console.log('═══════════════════════════════════════════════════\n');

  const emails = STUDENTS.map(s => s.email.toLowerCase());

  const { data: profs } = await supabase
    .from('profiles').select('id, email').in('email', emails);

  const ids = (profs || []).map(p => p.id);

  const { data: rows, error } = await supabase
    .from('students')
    .select(`
      id, academic_level, package, custom_price, group_id, status,
      profiles:id ( full_name, email ),
      groups:group_id ( name, code, level )
    `)
    .in('id', ids);

  if (error) throw error;
  console.table(rows.map(r => ({
    name: r.profiles?.full_name,
    email: r.profiles?.email,
    level: r.academic_level,
    pkg: r.package,
    price: r.custom_price,
    group: r.groups?.name ?? 'NULL',
    status: r.status,
  })));

  if (rows.length !== STUDENTS.length) {
    console.warn(`⚠️  Expected ${STUDENTS.length} rows, got ${rows.length}.`);
  }
}

// ── MAIN ──────────────────────────────────────────────────────
(async () => {
  try {
    const ctx = await discoverSchema();
    for (const s of STUDENTS) {
      await provision(s, ctx);
    }
    await verify();
    console.log('\n✅ Done.\n');
  } catch (e) {
    console.error('\n💥 FATAL:', e.message);
    process.exit(1);
  }
})();
