import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create admin user
    const adminEmail = 'admin@contractsystem.com';
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            fullName: 'System Administrator',
            role: 'admin',
        },
    });

    console.log('Admin user created:', {
        email: admin.email,
        id: admin.id,
        role: admin.role,
    });

    console.log('\n=== Admin Credentials ===');
    console.log('Email: admin@contractsystem.com');
    console.log('Password: Admin123!');
    console.log('========================\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
