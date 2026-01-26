'use server';

import { supabase } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function uploadDocument(formData: FormData, contractId: string, userId: string) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Calculate SHA-256 Hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `contracts/${contractId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('contracts')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) throw error;

        // 3. Save metadata to Prisma
        const document = await prisma.document.create({
            data: {
                contractId,
                fileName: file.name,
                mimeType: file.type,
                fileSize: BigInt(file.size),
                fileHash,
                storageType: 'supabase',
                storagePath: filePath,
                uploadedBy: userId,
            },
        });

        revalidatePath('/');
        return { success: true, documentId: document.id };
    } catch (error: any) {
        console.error('Error uploading document:', error);
        return { success: false, error: error.message || 'Failed to upload document' };
    }
}

export async function getDocumentUrl(storagePath: string) {
    try {
        const { data, error } = await supabase.storage
            .from('contracts')
            .createSignedUrl(storagePath, 3600); // 1 hour link

        if (error) throw error;
        return { success: true, url: data.signedUrl };
    } catch (error: any) {
        console.error('Error getting document URL:', error);
        return { success: false, error: error.message || 'Failed to get download URL' };
    }
}
