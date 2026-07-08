// 減少打 npm run migration:generate 命名產生的指令
// 原本: npm run typeorm -- migration:generate src/migrations/AddEmailToUser
// *減少: npm run migration:generate AddEmailToUser
// ------------------
import { spawnSync } from 'node:child_process'

const name = process.argv[2]

if (!name) {
  console.error('❌ 請輸入 migration 名稱')
  console.log('')
  console.log('例如：')
  console.log('npm run migration:generate AddEmailToUser')
  process.exit(1)
}

spawnSync('npm', ['run', 'typeorm', '--', 'migration:generate', `src/migrations/${name}`], {
  stdio: 'inherit',
  shell: true,
})
