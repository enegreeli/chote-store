const fs = require('fs');
const path = require('path');

const target = process.argv[2]; // 'supabase' or 'sqlite'

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

if (target === 'supabase' || target === 'postgresql') {
  console.log('🔄 Alternando Prisma para PostgreSQL / Supabase...');
  schemaContent = schemaContent.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log('✅ prisma/schema.prisma configurado com provider = "postgresql"!');
  console.log('\n📝 Próximos passos para conectar ao seu Supabase:');
  console.log('1. Abra o arquivo .env e cole a sua DATABASE_URL do Supabase (Project Settings > Database > Connection URI)');
  console.log('2. Execute no terminal:');
  console.log('   npx prisma db push');
  console.log('   node prisma/seed.js');
  console.log('\n✨ Todas as tabelas, produtos e controle de estoque serão criados no seu Supabase!');
} else if (target === 'sqlite') {
  console.log('🔄 Alternando Prisma para SQLite Local...');
  schemaContent = schemaContent.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  console.log('✅ prisma/schema.prisma configurado com provider = "sqlite"!');
  console.log('Execute: npx prisma generate && npx prisma db push');
} else {
  console.log('Uso: node scripts/switch-db.js supabase | sqlite');
}

