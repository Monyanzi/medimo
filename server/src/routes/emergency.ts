import { Hono } from 'hono';
import { db } from '../db';
import { users, allergies, conditions, medications, emergencyContacts } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = new Hono();

// Public emergency profile endpoint - no auth required
// Returns simple plain text for low-tech emergency environments
router.get('/:token', async (c) => {
  try {
    const token = c.req.param('token');

    if (!token || !token.startsWith('user-')) {
      return c.text('Invalid emergency profile link', 404);
    }

    const userId = token.replace('user-', '');

    // Fetch user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return c.text('Emergency profile not found', 404);
    }

    // Fetch related data
    const userAllergies = await db.select().from(allergies).where(eq(allergies.userId, userId));
    const userConditions = await db.select().from(conditions).where(eq(conditions.userId, userId));
    const userMedications = await db.select().from(medications).where(eq(medications.userId, userId));
    const userEmergencyContacts = await db.select().from(emergencyContacts).where(eq(emergencyContacts.userId, userId));

    const primaryContact = userEmergencyContacts[0];
    const activeMeds = userMedications.filter(m => m.status === 'active');

    // Generate simple plain text - black and white, no formatting
    const lines = [
      '================================',
      '    EMERGENCY MEDICAL INFO',
      '================================',
      '',
      `NAME: ${user.name}`,
      `BLOOD TYPE: ${user.bloodType || 'Not specified'}`,
      '',
      '--- ALLERGIES ---',
      userAllergies.length > 0
        ? userAllergies.map(a => `* ${a.allergen}${a.severity ? ` (${a.severity})` : ''}`).join('\n')
        : 'None reported',
      '',
      '--- MEDICAL CONDITIONS ---',
      userConditions.length > 0
        ? userConditions.map(c => `* ${c.name}`).join('\n')
        : 'None reported',
      '',
      '--- CURRENT MEDICATIONS ---',
      activeMeds.length > 0
        ? activeMeds.slice(0, 5).map(m => `* ${m.name} ${m.dosage || ''}`).join('\n')
        : 'None',
      '',
      '--- EMERGENCY CONTACT ---',
      primaryContact
        ? `${primaryContact.name}\n${primaryContact.phone}\n(${primaryContact.relationship || 'Contact'})`
        : 'Not specified',
      '',
      '================================',
      `Generated: ${new Date().toLocaleString()}`,
      'Powered by Medimo',
      '================================'
    ];

    c.header('Content-Type', 'text/plain; charset=utf-8');
    return c.text(lines.join('\n'));

  } catch (error) {
    console.error('Emergency profile error:', error);
    return c.text('Error loading emergency profile', 500);
  }
});

export default router;
