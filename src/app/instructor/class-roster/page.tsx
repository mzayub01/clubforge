// Instructors get the same class roster as admins, served under /instructor so the
// instructor layout (not the admin-only layout) wraps it. The roster reads via the
// CRUD select route (allowed for staff) and writes via the staff check-in endpoints.
export { default } from '@/app/admin/class-roster/page';
