import { pgTable, text, timestamp, boolean, integer, real, jsonb, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS TABLE - Core identity with RLS
// ============================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    dob: varchar('dob', { length: 10 }), // YYYY-MM-DD
    bloodType: varchar('blood_type', { length: 10 }),
    organDonor: boolean('organ_donor').default(false),
    importantNotes: text('important_notes'), // Free-form critical info
    isOnboardingComplete: boolean('is_onboarding_complete').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
}));

// ============================================
// EMERGENCY CONTACTS
// ============================================
export const emergencyContacts = pgTable('emergency_contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    relationship: varchar('relationship', { length: 100 }),
    isPrimary: boolean('is_primary').default(false),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('emergency_contacts_user_idx').on(table.userId),
}));

// ============================================
// ALLERGIES (normalized for better querying)
// ============================================
export const allergies = pgTable('allergies', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    severity: varchar('severity', { length: 50 }), // mild, moderate, severe
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('allergies_user_idx').on(table.userId),
}));

// ============================================
// CONDITIONS
// ============================================
export const conditions = pgTable('conditions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    diagnosedDate: varchar('diagnosed_date', { length: 10 }),
    status: varchar('status', { length: 50 }).default('active'), // active, managed, resolved
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('conditions_user_idx').on(table.userId),
}));

// ============================================
// MEDICATIONS
// ============================================
export const medications = pgTable('medications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    dosage: varchar('dosage', { length: 100 }),
    frequency: varchar('frequency', { length: 100 }),
    instructions: text('instructions'),
    prescribedBy: varchar('prescribed_by', { length: 255 }),
    startDate: varchar('start_date', { length: 10 }),
    endDate: varchar('end_date', { length: 10 }),
    status: varchar('status', { length: 50 }).default('active'), // active, completed, discontinued
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    userIdx: index('medications_user_idx').on(table.userId),
    statusIdx: index('medications_status_idx').on(table.status),
}));

// ============================================
// APPOINTMENTS
// ============================================
export const appointments = pgTable('appointments', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    doctorName: varchar('doctor_name', { length: 255 }),
    location: varchar('location', { length: 500 }),
    dateTime: timestamp('date_time').notNull(),
    type: varchar('type', { length: 100 }),
    status: varchar('status', { length: 50 }).default('scheduled'), // scheduled, completed, cancelled
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    userIdx: index('appointments_user_idx').on(table.userId),
    dateIdx: index('appointments_date_idx').on(table.dateTime),
}));

// ============================================
// VITAL SIGNS
// ============================================
export const vitalSigns = pgTable('vital_signs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bloodPressureSystolic: integer('bp_systolic'),
    bloodPressureDiastolic: integer('bp_diastolic'),
    heartRate: integer('heart_rate'),
    weight: real('weight'),
    height: real('height'),
    temperature: real('temperature'),
    oxygenSaturation: integer('oxygen_saturation'),
    respiratoryRate: integer('respiratory_rate'),
    bloodGlucose: integer('blood_glucose'),
    recordedDate: timestamp('recorded_date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('vital_signs_user_idx').on(table.userId),
    dateIdx: index('vital_signs_date_idx').on(table.recordedDate),
}));

// ============================================
// DOCUMENTS (Vault)
// ============================================
export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileType: varchar('file_type', { length: 100 }),
    storagePath: text('storage_path').notNull(),
    category: varchar('category', { length: 100 }), // Lab Results, Imaging, Prescriptions, Insurance, etc.
    fileSize: integer('file_size'),
    description: text('description'),
    tags: jsonb('tags').$type<string[]>(),
    uploadDate: timestamp('upload_date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('documents_user_idx').on(table.userId),
    categoryIdx: index('documents_category_idx').on(table.category),
}));

// ============================================
// TIMELINE EVENTS
// ============================================
export const timelineEvents = pgTable('timeline_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    details: text('details'),
    date: timestamp('date').notNull(),
    category: varchar('category', { length: 50 }).notNull(), // Medication, Appointment, Document, Vitals, Test, Other
    relatedId: uuid('related_id'), // FK to related entity (medication, appointment, etc.)
    notes: text('notes'), // User-entered notes
    isSystem: boolean('is_system').default(false), // Auto-generated events
    systemType: varchar('system_type', { length: 50 }), // threshold, summary
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('timeline_user_idx').on(table.userId),
    dateIdx: index('timeline_date_idx').on(table.date),
    categoryIdx: index('timeline_category_idx').on(table.category),
}));

// ============================================
// CAREGIVER ACCESS (for sharing)
// ============================================
export const caregiverAccess = pgTable('caregiver_access', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    caregiverId: uuid('caregiver_id').references(() => users.id, { onDelete: 'cascade' }),
    accessLevel: varchar('access_level', { length: 50 }).default('read'), // read, emergency, full
    shareToken: varchar('share_token', { length: 255 }).unique(),
    expiresAt: timestamp('expires_at'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdx: index('caregiver_user_idx').on(table.userId),
    tokenIdx: index('caregiver_token_idx').on(table.shareToken),
}));

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
    emergencyContacts: many(emergencyContacts),
    allergies: many(allergies),
    conditions: many(conditions),
    medications: many(medications),
    appointments: many(appointments),
    vitalSigns: many(vitalSigns),
    documents: many(documents),
    timelineEvents: many(timelineEvents),
    caregiverAccess: many(caregiverAccess),
}));

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
    user: one(users, { fields: [emergencyContacts.userId], references: [users.id] }),
}));

export const allergiesRelations = relations(allergies, ({ one }) => ({
    user: one(users, { fields: [allergies.userId], references: [users.id] }),
}));

export const conditionsRelations = relations(conditions, ({ one }) => ({
    user: one(users, { fields: [conditions.userId], references: [users.id] }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
    user: one(users, { fields: [medications.userId], references: [users.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
    user: one(users, { fields: [appointments.userId], references: [users.id] }),
}));

export const vitalSignsRelations = relations(vitalSigns, ({ one }) => ({
    user: one(users, { fields: [vitalSigns.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    user: one(users, { fields: [documents.userId], references: [users.id] }),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
    user: one(users, { fields: [timelineEvents.userId], references: [users.id] }),
}));

export const caregiverAccessRelations = relations(caregiverAccess, ({ one }) => ({
    user: one(users, { fields: [caregiverAccess.userId], references: [users.id] }),
    caregiver: one(users, { fields: [caregiverAccess.caregiverId], references: [users.id] }),
}));
