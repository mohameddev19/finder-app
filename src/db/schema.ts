import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum for prisoner status
export const prisonerStatusEnum = pgEnum('prisoner_status', ['under_search', 'found']);

// Enum for user types
export const userTypeEnum = pgEnum('user_type', ['family', 'authority']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  userType: userTypeEnum('user_type').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  organization: text('organization'),
  position: text('position'),
  details: text('details'),
  token: text('token'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Prisoners table
export const prisoners = pgTable('prisoners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  reasonForCapture: text('reason_for_capture'),
  locationOfDisappearance: text('location_of_disappearance'),
  dateOfDisappearance: timestamp('date_of_disappearance'),
  additionalInfo: text('additional_info'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  status: prisonerStatusEnum('status').notNull().default('under_search'),
  isRegular: boolean('is_regular').default(true),
  isCivilian: boolean('is_civilian').default(true),
  releasedDate: timestamp('released_date'),
  releasedLocation: text('released_location'),
  releasedNotes: text('released_notes'),
  addedById: integer('added_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Family connections table
export const familyConnections = pgTable('family_connections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  prisonerId: integer('prisoner_id').references(() => prisoners.id).notNull(),
  relationship: text('relationship').notNull(),
  isMainContact: boolean('is_main_contact').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  prisonerId: integer('prisoner_id').references(() => prisoners.id).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notification subscriptions
export const notificationSubscriptions = pgTable('notification_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  prisonerId: integer('prisoner_id').references(() => prisoners.id).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}); 