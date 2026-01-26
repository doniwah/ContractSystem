import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)
    // 1. Clean up existing data
    await prisma.approval.deleteMany()
    await prisma.blockchainProof.deleteMany()
    await prisma.document.deleteMany()
    await prisma.contract.deleteMany()
    await prisma.user.deleteMany()

    console.log('Database cleaned.')

    // 2. Create Users
    const alice = await prisma.user.create({
        data: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'alice@example.com',
            password: hashedPassword,
            fullName: 'Alice Johnson',
            walletAddress: '0x1234567890123456789012345678901234567890',
        },
    })

    const bob = await prisma.user.create({
        data: {
            id: '00000000-0000-0000-0000-000000000002',
            email: 'bob@example.com',
            password: hashedPassword,
            fullName: 'Bob Smith',
            walletAddress: '0x2345678901234567890123456789012345678901',
        },
    })

    const charlie = await prisma.user.create({
        data: {
            id: '00000000-0000-0000-0000-000000000003',
            email: 'charlie@example.com',
            password: hashedPassword,
            fullName: 'Charlie Davis',
            walletAddress: '0x3456789012345678901234567890123456789012',
        },
    })

    const diana = await prisma.user.create({
        data: {
            id: '00000000-0000-0000-0000-000000000004',
            email: 'diana@example.com',
            password: hashedPassword,
            fullName: 'Diana Martinez',
            walletAddress: '0x4567890123456789012345678901234567890123',
        },
    })

    console.log('Users created.')

    // 3. Create Contracts
    const contract1 = await prisma.contract.create({
        data: {
            title: 'Partnership Agreement Q1 2026',
            description: 'Strategic partnership contract for first quarter operations',
            contractMode: 'onchain',
            status: 'pending',
            threshold: 2,
            creatorId: alice.id,
        },
    })

    const contract2 = await prisma.contract.create({
        data: {
            title: 'Vendor Service Contract',
            description: 'Annual service agreement with primary vendor',
            contractMode: 'offchain',
            status: 'completed',
            threshold: 3,
            creatorId: alice.id,
        },
    })

    console.log('Contracts created.')

    // 4. Create Approvals
    await prisma.approval.createMany({
        data: [
            {
                contractId: contract1.id,
                userId: alice.id,
                status: 'approved',
                approvedAt: new Date(),
            },
            {
                contractId: contract1.id,
                userId: bob.id,
                status: 'pending',
            },
            {
                contractId: contract2.id,
                userId: alice.id,
                status: 'approved',
                approvedAt: new Date(),
            },
            {
                contractId: contract2.id,
                userId: bob.id,
                status: 'approved',
                approvedAt: new Date(),
            },
            {
                contractId: contract2.id,
                userId: charlie.id,
                status: 'approved',
                approvedAt: new Date(),
            },
        ],
    })

    console.log('Approvals created.')
    console.log('Seeding finished successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
