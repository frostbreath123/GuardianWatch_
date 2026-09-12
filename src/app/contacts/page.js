"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { PencilSquareIcon, PhoneIcon, PlusIcon, TrashIcon, UserGroupIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { getContacts, setContacts as saveContacts } from "@/lib/storage";
import { useToast } from "@/components/ToastProvider";

const EMPTY_FORM = { name: "", relation: "", phone: "", email: "" };

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmId, setConfirmId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(contact) {
    setEditingId(contact.id);
    setForm(contact);
    setOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    let next;
    if (editingId) {
      next = contacts.map((c) => (c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      next = [...contacts, { ...form, id: crypto.randomUUID() }];
    }
    setContacts(next);
    saveContacts(next);
    setOpen(false);
    showToast(editingId ? "Contact updated." : "Contact added.", "success");
  }

  function remove(id) {
    const next = contacts.filter((c) => c.id !== id);
    setContacts(next);
    saveContacts(next);
    setConfirmId(null);
    showToast("Contact removed.", "info");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Emergency Contacts</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">People notified when you trigger an alert.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <PlusIcon className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] py-16 text-center">
          <UserGroupIcon className="h-10 w-10 text-[var(--fg-muted)]" />
          <p className="text-sm text-[var(--fg-muted)]">No contacts yet. Add someone you trust.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  {c.relation && <p className="text-xs text-[var(--fg-muted)]">{c.relation}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Edit">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmId(c.id)} className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Delete">
                    <TrashIcon className="h-4 w-4 text-brand-600" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-brand-600">
                    <PhoneIcon className="h-4 w-4" /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-brand-600">
                    <EnvelopeIcon className="h-4 w-4" /> {c.email}
                  </a>
                )}
              </div>

              {confirmId === c.id && (
                <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-50 dark:bg-brand-950 p-2 text-xs">
                  <span>Remove this contact?</span>
                  <div className="flex gap-2">
                    <button onClick={() => remove(c.id)} className="font-semibold text-brand-700 dark:text-brand-300">Yes</button>
                    <button onClick={() => setConfirmId(null)} className="text-[var(--fg-muted)]">Cancel</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <Transition show={open}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          <TransitionChild enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-md rounded-2xl bg-[var(--bg-elevated)] p-6 shadow-2xl">
                <DialogTitle className="text-lg font-bold">{editingId ? "Edit Contact" : "Add Contact"}</DialogTitle>
                <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
                  <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                  <Field label="Relation" value={form.relation} onChange={(v) => setForm({ ...form, relation: v })} placeholder="e.g. Sister, Friend" />
                  <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
                  <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" required />
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                      Save
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400"
      />
    </label>
  );
}
