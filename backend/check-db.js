import { PrismaClient } from "./generated/prisma/client/index.js"
const prisma = new PrismaClient()

async function check() {
  const token = "CMrmc8zRyJnAw9hDbyZEr8MtujqIlBAH"
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })
  console.log("SESSION_RESULT:", JSON.stringify(session, null, 2))
  process.exit(0)
}

check().catch(err => {
  console.error(err)
  process.exit(1)
})
