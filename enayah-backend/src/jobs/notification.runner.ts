import { NotificationGeneratorService } from '../modules/notifications/service/notification-generator.service'

async function main() {
  console.log('🔔 Notification generation started')
  const result = await NotificationGeneratorService.runAll()
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Notification generation failed')
  console.error(error)
  process.exit(1)
})
