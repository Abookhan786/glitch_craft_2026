const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GlitchCraft database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'web' }, create: { name: 'Web Forensics', slug: 'web', icon: '🌐', color: '#00ff88' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'stego' }, create: { name: 'Steganography', slug: 'stego', icon: '🖼️', color: '#ff0066' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'metadata' }, create: { name: 'Metadata', slug: 'metadata', icon: '📋', color: '#0088ff' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'crypto' }, create: { name: 'Cryptography', slug: 'crypto', icon: '🔐', color: '#ff8800' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'osint' }, create: { name: 'OSINT', slug: 'osint', icon: '🔍', color: '#aa00ff' }, update: {} }),
    prisma.category.upsert({ where: { slug: 'forensics' }, create: { name: 'Digital Forensics', slug: 'forensics', icon: '🧪', color: '#ff4444' }, update: {} }),
  ]);

  const [web, stego, metadata, crypto, osint, forensics] = categories;

  // Sample challenges
  const challenges = [
    {
      title: 'Source of Truth',
      description: 'The suspect left clues in the HTML comments of a public-facing website. Analyze the page source carefully — not everything is rendered on screen. The flag is hidden where users never look.\n\n**Target**: `http://glitchcraft.local/case1`\n\nLook beyond what the browser shows you.',
      difficulty: 'EASY',
      points: 100,
      flag: 'GC{html_c0mm3nt5_4r3_n0t_s3cr3t}',
      categoryId: web.id,
      isFeatured: true,
      hints: [{ content: 'Use CTRL+U or right-click → View Page Source', cost: 0 }, { content: 'Search for <!-- in the source code', cost: 25 }],
    },
    {
      title: 'Cookie Monster',
      description: 'An insider threat used session cookies to exfiltrate data. We\'ve captured a traffic snapshot. Decode the Base64-encoded cookie value to find the hidden payload.\n\n**Cookie**: `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJmbGFnIjoiR0N7ajN1c3RfZGVjMGQzX3RoM19jMDBraWV9In0.`\n\nSomething smells... delicious.',
      difficulty: 'EASY',
      points: 150,
      flag: 'GC{j3ust_dec0d3_th3_c00kie}',
      categoryId: web.id,
      hints: [{ content: 'This looks like a JWT token', cost: 0 }, { content: 'Decode each part separated by . using Base64', cost: 30 }],
    },
    {
      title: 'Pixel Secrets',
      description: 'The suspect communicated using innocent-looking images. The evidence photo was intercepted — we know data was hidden inside using LSB steganography.\n\n**Tool hint**: Try `steghide`, `zsteg`, or analyze RGB channel values.\n\nThe truth is hiding in plain pixels.',
      difficulty: 'MEDIUM',
      points: 250,
      flag: 'GC{l5b_st3g0_1s_cl4ss1c}',
      categoryId: stego.id,
      isFeatured: true,
      hints: [{ content: 'LSB = Least Significant Bit', cost: 0 }, { content: 'Use `zsteg image.png` or `steghide extract -sf image.jpg`', cost: 50 }],
    },
    {
      title: 'Silent Audio',
      description: 'An audio file was used as a dead drop. Intelligence suggests data is hidden in the spectrogram. Load the file into a spectrogram analyzer.\n\n**Tool**: Audacity, Sonic Visualiser, or online spectrogram tools.\n\nListen... but with your eyes.',
      difficulty: 'MEDIUM',
      points: 300,
      flag: 'GC{sp3ctr0gr4m_r3v34ls_4ll}',
      categoryId: stego.id,
      hints: [{ content: 'Open the audio in Audacity and switch to Spectrogram view', cost: 0 }],
    },
    {
      title: 'EXIF Exposed',
      description: 'A photo was posted publicly. The suspect didn\'t know that cameras embed location and device data in image files.\n\n**Task**: Extract the GPS coordinates from the EXIF metadata and convert them to a decimal degree location. Submit the flag in the format: `GC{lat_lon}` rounded to 4 decimal places.\n\n**Tools**: `exiftool`, Jeffrey\'s Exif Viewer, or any EXIF reader.',
      difficulty: 'EASY',
      points: 100,
      flag: 'GC{13.0827_80.2707}',
      categoryId: metadata.id,
      hints: [{ content: 'Use: exiftool image.jpg | grep GPS', cost: 0 }],
    },
    {
      title: 'Document Trail',
      description: 'A leaked Word document contains hidden metadata revealing who authored it and when it was last modified. The author\'s username is the key.\n\n**Format**: `GC{username_YYYY-MM-DD}`\n\nDocuments remember more than their creators think.',
      difficulty: 'MEDIUM',
      points: 200,
      flag: 'GC{gh0st_wr1ter_2024-01-15}',
      categoryId: metadata.id,
      hints: [{ content: 'Open in LibreOffice → File → Properties → General Tab', cost: 0 }, { content: 'Or use: python-docx to read document.core_properties', cost: 40 }],
    },
    {
      title: 'Caesar Strikes Back',
      description: 'Classic but effective — the first message intercepted was encrypted with a simple Caesar cipher.\n\n**Ciphertext**: `TF{e4f4r_p1cu3r_1f_g00_b1qu3u}`\n\nNote: The cipher wraps letters only, preserving special chars.\n\nShift until it reveals itself.',
      difficulty: 'EASY',
      points: 75,
      flag: 'GC{c4e4s4r_c1ph3r_1s_t00_e4sy}',
      categoryId: crypto.id,
      hints: [{ content: 'Try all 25 possible shifts (ROT brute force)', cost: 0 }],
    },
    {
      title: 'XOR Warfare',
      description: 'The encrypted C2 beacon uses single-byte XOR. We\'ve captured the hex payload:\n\n`2b 4f 4e 4f 7b 78 30 72 5f 6d 34 67 31 63 7d`\n\nHint: XOR with `0x4e` starts looking familiar...\n\nBreak the cipher, trace the beacon.',
      difficulty: 'MEDIUM',
      points: 250,
      flag: 'GC{x0r_m4g1c}',
      categoryId: crypto.id,
    },
    {
      title: 'Digital Dossier',
      description: 'The suspect used an online alias `gl1tch_phantom`. Using only open-source intelligence, find:\n1. Their registered email provider domain\n2. The year they first appeared online\n\n**Format**: `GC{domain.com_YYYY}`\n\nOSINT is an art — trace the digital ghost.',
      difficulty: 'HARD',
      points: 400,
      flag: 'GC{protonmail.com_2019}',
      categoryId: osint.id,
      isFeatured: true,
      hints: [{ content: 'Check username on multiple platforms: GitHub, Reddit, Twitter', cost: 0 }, { content: 'Use Sherlock or whatsmyname.app for username enumeration', cost: 75 }],
    },
    {
      title: 'Memory Dump',
      description: 'A memory snapshot was captured from the suspect\'s machine during a live incident response. The attacker had a process running — something that shouldn\'t be there.\n\n**File**: `dump.raw`\n\n**Tools**: `strings`, `grep`, `base64`, Volatility3\n\nDead memory still tells stories. But you have to read between the lines.',
      difficulty: 'HARD',
      points: 500,
      flag: 'GC{v0l4t1l1ty_m3m0ry_4n4lys1s}',
      categoryId: forensics.id,
      hints: [{ content: 'Malware hides in plain sight — start by listing all process names in the dump and read them very carefully.', cost: 0 }, { content: 'PowerShell\'s -enc / -EncodedCommand flag accepts a Base64-encoded command. Find a suspicious process\'s command line and decode it.', cost: 100 }],
    },
    {
      title: 'Network Ghost',
      description: 'A PCAP file captured during the incident contains exfiltrated data. The attacker used DNS tunneling to exfiltrate the flag in TXT record queries.\n\n**Filter**: Look for unusually long DNS query names.\n\n**Tools**: Wireshark → `dns.qry.name contains "glitch"`\n\nData hides in unexpected protocols.',
      difficulty: 'INSANE',
      points: 750,
      flag: 'GC{dn5_tunn3l_3xf1ltr4t10n}',
      categoryId: forensics.id,
      hints: [{ content: 'DNS TXT record queries can carry arbitrary data', cost: 0 }, { content: 'Filter: dns.qry.type == 16 in Wireshark for TXT records', cost: 100 }, { content: 'Decode the subdomain labels - they\'re Base32 encoded', cost: 150 }],
    },
  ];

  for (const ch of challenges) {
    const { hints = [], ...challengeData } = ch;
    await prisma.challenge.upsert({
      where: { id: (await prisma.challenge.findFirst({ where: { title: ch.title } }))?.id || 'new' },
      create: { ...challengeData, hints: { create: hints } },
      update: {},
    });
  }

  // Admin team
  const adminPass = await bcrypt.hash('glitchcraft_admin_2024', 12);
  await prisma.team.upsert({
    where: { email: 'admin@glitchcraft.io' },
    create: { name: 'GlitchCraft Admin', email: 'admin@glitchcraft.io', password: adminPass, isAdmin: true, avatarSeed: 'admin' },
    update: {},
  });

  // Default event config
  const configs = [
    { key: 'event_name', value: 'GlitchCraft 2024' },
    { key: 'event_start', value: new Date().toISOString() },
    { key: 'event_end', value: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() },
    { key: 'registration_open', value: 'true' },
    { key: 'scoreboard_visible', value: 'true' },
    { key: 'challenges_visible', value: 'true' },
  ];

  for (const config of configs) {
    await prisma.eventConfig.upsert({ where: { key: config.key }, create: config, update: {} });
  }

  console.log('✅ Seed complete! Admin: admin@glitchcraft.io / glitchcraft_admin_2024');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
