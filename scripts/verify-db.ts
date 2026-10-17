import { prisma } from '../src/db';

/**
 * Standalone database persistence verification script.
 * 1. Connects to the configured database.
 * 2. Inserts a temporary synthetic test record using the User model.
 * 3. Reads the record back and validates stored values.
 * 4. Ensures the temporary record is deleted even if assertions fail.
 * 5. Disconnects cleanly.
 */
async function verifyDatabasePersistence(): Promise<void> {
  const timestamp = Date.now();
  const syntheticEmail = `test_persistence_${timestamp}@verification.synthetic`;
  const syntheticHash = `synthetic_hash_${timestamp}`;
  let createdId: string | null = null;

  console.log('[VerifyDB] Testing database connection...');

  try {
    // 1. Connectivity check
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log('[VerifyDB] Database connection successful.');

    // 2. Insert temporary synthetic test record
    console.log('[VerifyDB] Inserting temporary test record...');
    const createdUser = await prisma.user.create({
      data: {
        email: syntheticEmail,
        passwordHash: syntheticHash,
        displayName: 'Synthetic Verification User',
        department: 'Test Engineering',
        academicYear: '2026',
      },
    });
    createdId = createdUser.id;
    console.log(`[VerifyDB] Record inserted successfully (ID: ${createdId}).`);

    // 3. Read the record back and verify stored values
    console.log('[VerifyDB] Reading record back to verify persistence...');
    const retrievedUser = await prisma.user.findUnique({
      where: { id: createdId },
    });

    if (!retrievedUser) {
      throw new Error(`Verification failed: record with ID ${createdId} could not be retrieved.`);
    }

    if (retrievedUser.email !== syntheticEmail) {
      throw new Error(`Verification failed: email mismatch (expected: ${syntheticEmail}, got: ${retrievedUser.email}).`);
    }

    if (retrievedUser.passwordHash !== syntheticHash) {
      throw new Error('Verification failed: password hash mismatch.');
    }

    console.log('[VerifyDB] Verified stored values successfully.');
  } finally {
    // 4. Delete the temporary record even if verification failed
    if (createdId) {
      try {
        console.log(`[VerifyDB] Cleaning up temporary record (ID: ${createdId})...`);
        await prisma.user.delete({ where: { id: createdId } });
        console.log('[VerifyDB] Cleanup completed.');
      } catch (cleanupErr) {
        console.error('[VerifyDB] Warning: failed to clean up temporary record:', cleanupErr);
      }
    }

    // 5. Close the database connection cleanly
    await prisma.$disconnect();
    console.log('[VerifyDB] Database connection closed.');
  }
}

verifyDatabasePersistence()
  .then(() => {
    console.log('[VerifyDB] RESULT: PASS — Database connection and persistence successfully verified.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[VerifyDB] RESULT: FAIL —', err.message);
    process.exit(1);
  });
