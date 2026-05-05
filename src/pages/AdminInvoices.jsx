import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Plus, X, Trash2, Printer, Edit2, RefreshCw, CheckCircle2, Clock, Eye, CreditCard } from 'lucide-react';

const CO = {
  address: '3409 Pearl Corner Jade St. Casals Village, Mabolo, Cebu City',
  email: 'odysseyclinsys1@gmail.com',
  phone: '09930050994 / 08099855322',
  preparedBy: 'Johnjosefir Roca',
  approvedBy: 'Jetch Merald S. Madaya',
  approvedPhone: '0909-985-5322',
  bankName: 'GoTyme',
  bankAccount: '012267894321',
  bankAccountName: 'Johnjosefir Roca',
};

const S = {
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' },
  btn: { cursor: 'pointer', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 },
  inp: { width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  lbl: { display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = (s) => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }); };
const calcTotal = (items) => (items || []).reduce((s, i) => s + Number(i.amount || 0), 0);

function printInvoice(inv) {
  const total = calcTotal(inv.items);
  const logoUrl = window.location.origin + '/images/odcclearlogo.png';
  const rows = (inv.items || []).map(i =>
    `<tr><td class="td">${i.service || ''}</td><td class="td ar">${fmt(i.amount)}</td></tr>`
  ).join('');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${inv.invoiceNumber}</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:12px;color:#333;background:#fff}
.pg{width:794px;min-height:1100px;padding:50px 60px;margin:0 auto}
.hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
.logo img{height:80px;width:auto;display:block}
.ci{text-align:right;line-height:1.9;color:#555;font-size:11px}
.ci a{color:#e85d04}
.ttl{text-align:center;font-size:20px;font-weight:700;letter-spacing:5px;padding:10px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;margin:20px 0}
.det{line-height:2;margin-bottom:22px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#f0f0f0;padding:10px 14px;font-size:11px;letter-spacing:1px;border:1px solid #ccc;text-align:center}
.td{padding:10px 14px;border:1px solid #ccc}
.ar{text-align:right}
.sub-row td{border-top:2px solid #ccc;font-weight:600}
.tot{text-align:right;font-size:22px;font-weight:700;margin:16px 0 24px}
.pi{margin-bottom:28px;line-height:1.8}
.ft{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;padding-top:20px;border-top:1px solid #ddd}
.sig{border-bottom:1px solid #333;margin-top:4px}
.sig-block{text-align:center;margin-top:32px;margin-bottom:2px}
.qr-row{display:flex;gap:40px;justify-content:center;margin-top:32px;padding-top:20px;border-top:1px solid #eee}
.qr-item{text-align:center}
.qr-item img{width:160px;height:160px;display:block;padding:10px;background:#fff;border:1px solid #ddd;border-radius:8px;image-rendering:crisp-edges}
.qr-label{font-size:12px;font-weight:700;color:#444;margin-top:8px;letter-spacing:0.5px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="pg">
  <div class="hd">
    <div class="logo"><img src="${logoUrl}" alt="ODC" /></div>
    <div class="ci">${CO.address}<br><a href="mailto:${CO.email}">${CO.email}</a><br>${CO.phone}</div>
  </div>
  <div class="ttl">INVOICE</div>
  <div class="det">
    <div><b>Invoice #:</b> ${inv.invoiceNumber || ''}</div>
    <div><b>Date:</b> ${fmtDate(inv.date)}</div>
    <div><b>Bill To:</b> ${inv.billTo || ''}</div>
    <div><b>Project:</b> ${inv.project || ''}</div>
    <div><b>Payment Terms:</b> ${inv.paymentTerms || ''}</div>
  </div>
  <table>
    <thead><tr><th style="width:70%">SERVICE</th><th style="width:30%">AMOUNT</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr class="sub-row"><td class="td"></td><td class="td ar">${fmt(total)}</td></tr></tfoot>
  </table>
  <div class="tot">Total Due: &#8369; ${fmt(total)}</div>
  <div class="pi"><b>Payment Instruction:</b><br>
    &nbsp;&nbsp;We kindly request that the payment be prepared either in cash or through a check payable to <b>${CO.approvedBy}</b>, or via bank transfer.
  </div>
  <div class="ft">
    <div><b>Payment Information:</b><br><br>Bank Name: ${CO.bankName}<br>Account No.: ${CO.bankAccount}<br>Account Name: ${CO.bankAccountName}<br><br>Contact Name: ${CO.approvedBy}<br>Number: ${CO.approvedPhone}</div>
    <div><b>Prepared By:</b><br><div class="sig-block">${inv.preparedBy || CO.preparedBy}</div><div class="sig"></div></div>
    <div><b>Approved By:</b><br><div class="sig-block">${CO.approvedBy}</div><div class="sig"></div></div>
  </div>
  ${(inv.qrCodes || []).length > 0 ? `
  <div class="qr-row">
    ${(inv.qrCodes || []).includes('gotyme') ? `<div class="qr-item"><img src="${window.location.origin}/images/jetchgotyme.png" alt="GoTyme QR" /><div class="qr-label">GoTyme — Scan to Pay</div></div>` : ''}
    ${(inv.qrCodes || []).includes('maribank') ? `<div class="qr-item"><img src="${window.location.origin}/images/jetchmaribank.png" alt="MariBank QR" /><div class="qr-label">MariBank — Scan to Pay</div></div>` : ''}
  </div>` : ''}
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

const emptyForm = () => ({ billTo: '', project: '', date: today(), paymentTerms: 'Cash/Bank Transfer', items: [{ id: 1, service: '', amount: '' }], notes: '', qrCodes: ['gotyme', 'maribank'], preparedBy: CO.preparedBy });

export default function AdminInvoices({ firebaseUser, isSuperAdmin }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (spin = true) => {
    if (spin) setRefreshing(true);
    try {
      const snap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(false); }, [load]);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), service: '', amount: '' }] }));
  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  const updItem = (id, k, v) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [k]: v } : i) }));
  const formTotal = calcTotal(form.items);

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setShowSidebar(true); };
  const openEdit = (inv) => {
    setEditingId(inv.id);
    setForm({ billTo: inv.billTo || '', project: inv.project || '', date: inv.date || today(), paymentTerms: inv.paymentTerms || 'Cash/Bank Transfer', items: (inv.items || []).map((i, idx) => ({ ...i, id: idx })), notes: inv.notes || '', qrCodes: inv.qrCodes || ['gotyme', 'maribank'], preparedBy: inv.preparedBy || CO.preparedBy });
    setShowSidebar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, total: formTotal, updatedAt: serverTimestamp() };
    try {
      if (editingId) {
        await updateDoc(doc(db, 'invoices', editingId), payload);
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const num = `INV-${year}-${month}-${String(invoices.length + 1).padStart(3, '0')}`;
        await addDoc(collection(db, 'invoices'), { ...payload, invoiceNumber: num, status: 'unpaid', createdAt: serverTimestamp(), createdBy: firebaseUser.email });
      }
      setShowSidebar(false);
      load();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const [payModal, setPayModal] = useState(null); // { inv }
  const [payMethod, setPayMethod] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payConfirming, setPayConfirming] = useState(false);
  const [viewInv, setViewInv] = useState(null);

  const openPayModal = (inv) => { setPayModal({ inv }); setPayMethod(''); setPayRef(''); };

  const confirmPayment = async () => {
    if (!payMethod) return;
    if (payMethod !== 'cash' && !payRef.trim()) return;
    setPayConfirming(true);
    const update = { status: 'paid', paidAt: serverTimestamp(), paymentMethod: payMethod, referenceNumber: payMethod !== 'cash' ? payRef.trim() : null };
    await updateDoc(doc(db, 'invoices', payModal.inv.id), update);
    setInvoices(prev => prev.map(i => i.id === payModal.inv.id ? { ...i, ...update, paidAt: new Date() } : i));
    setPayModal(null);
    setPayConfirming(false);
  };

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete ${inv.invoiceNumber}?`)) return;
    await deleteDoc(doc(db, 'invoices', inv.id));
    setInvoices(prev => prev.filter(i => i.id !== inv.id));
  };

  const paid = invoices.filter(i => i.status === 'paid');
  const unpaid = invoices.filter(i => i.status !== 'paid');
  const revenue = paid.reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>Invoices</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => load()} disabled={refreshing} style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          {isSuperAdmin && (
            <button onClick={openCreate} style={{ ...S.btn, background: 'linear-gradient(135deg,#ff6a1a,#ff9a4a)', color: '#fff', padding: '10px 18px', boxShadow: '0 4px 14px rgba(255,106,26,0.3)' }}>
              <Plus size={16} /> New Invoice
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {[{ l: 'Total', v: invoices.length, c: '#fff' }, { l: 'Paid', v: paid.length, c: '#34d399' }, { l: 'Unpaid', v: unpaid.length, c: '#f87171' }, { l: 'Revenue', v: `₱${fmt(revenue)}`, c: '#ff9a4a' }].map(({ l, v, c }) => (
          <div key={l} style={{ ...S.card }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{l}</div>
            <div style={{ color: c, fontSize: 24, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} /><p>Loading…</p>
        </div>
      ) : invoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>No invoices yet.</div>
      ) : (
        <div style={{ ...S.card, padding: 0, overflowX: 'auto', overflowY: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
              <tr>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Invoice</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Client / Project</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="inv-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '18px 24px', fontWeight: 700, color: '#fff', verticalAlign: 'middle' }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{inv.billTo}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{inv.project}</div>
                  </td>
                  <td style={{ padding: '18px 24px', color: 'rgba(255,255,255,0.5)', fontSize: 13, verticalAlign: 'middle' }}>{fmtDate(inv.date)}</td>
                  <td style={{ padding: '18px 24px', textAlign: 'right', color: '#ff9a4a', fontWeight: 700, fontSize: 16, verticalAlign: 'middle' }}>₱{fmt(inv.total)}</td>
                  <td style={{ padding: '18px 24px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {inv.status === 'paid' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8 }}>
                        <CheckCircle2 size={11} /> Paid
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8 }}>
                        <Clock size={11} /> Unpaid
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {inv.status === 'paid' ? (
                        <button onClick={() => setViewInv(inv)} style={{ ...S.btn, background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }} title="View Details"><Eye size={14} /> View</button>
                      ) : (
                        <button onClick={() => openPayModal(inv)} style={{ ...S.btn, background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }} title="Mark as Paid"><CreditCard size={14} /> Mark As Paid</button>
                      )}
                      <button onClick={() => printInvoice(inv)} style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }} title="Print Invoice"><Printer size={14} /> Print</button>
                      {isSuperAdmin && (
                        <>
                          <button onClick={() => openEdit(inv)} style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', padding: 8 }} title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(inv)} style={{ ...S.btn, background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: 8 }} title="Delete"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <>
          <div onClick={() => setPayModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f1218', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, zIndex: 201, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Mark as Paid</h3>
              <button onClick={() => setPayModal(null)} style={{ ...S.btn, background: 'none', color: 'rgba(255,255,255,0.5)', padding: 4 }}><X size={16} /></button>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>{payModal.inv.invoiceNumber} · {payModal.inv.billTo} · <span style={{ color: '#ff9a4a', fontWeight: 700 }}>₱{fmt(payModal.inv.total)}</span></div>
            <div style={{ marginBottom: 18 }}>
              <label style={S.lbl}>Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                {[{ id: 'cash', label: '💵 Cash' }, { id: 'gotyme', label: '🏦 GoTyme' }, { id: 'maribank', label: '🏧 MariBank' }, { id: 'gcash', label: '📱 GCash' }].map(({ id, label }) => (
                  <button key={id} type="button" onClick={() => setPayMethod(id)} style={{ ...S.btn, justifyContent: 'center', padding: '12px 0', background: payMethod === id ? 'rgba(255,106,26,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${payMethod === id ? 'rgba(255,106,26,0.6)' : 'rgba(255,255,255,0.1)'}`, color: payMethod === id ? '#ff9a4a' : 'rgba(255,255,255,0.6)', fontWeight: payMethod === id ? 700 : 400, borderRadius: 12 }}>{label}</button>
                ))}
              </div>
            </div>
            {payMethod && payMethod !== 'cash' && (
              <div style={{ marginBottom: 18 }}>
                <label style={S.lbl}>Reference Number</label>
                <input style={S.inp} value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="e.g. REF-20260506-001" autoFocus />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setPayModal(null)} style={{ ...S.btn, flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={confirmPayment} disabled={!payMethod || (payMethod !== 'cash' && !payRef.trim()) || payConfirming} style={{ ...S.btn, flex: 2, justifyContent: 'center', background: (!payMethod || (payMethod !== 'cash' && !payRef.trim())) ? 'rgba(52,211,153,0.2)' : 'linear-gradient(135deg,#34d399,#059669)', color: '#fff', fontWeight: 600, padding: '12px 0', boxShadow: '0 4px 14px rgba(52,211,153,0.2)' }}>
                <CreditCard size={15} /> {payConfirming ? 'Confirming…' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Invoice Modal */}
      {viewInv && (
        <>
          <div onClick={() => setViewInv(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#0f1218', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: 32, zIndex: 201, width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>{viewInv.invoiceNumber}</h3>
              <button onClick={() => setViewInv(null)} style={{ ...S.btn, background: 'none', color: 'rgba(255,255,255,0.5)', padding: 4 }}><X size={16} /></button>
            </div>
            {[['Bill To', viewInv.billTo], ['Project', viewInv.project], ['Date', fmtDate(viewInv.date)], ['Payment Terms', viewInv.paymentTerms], ['Prepared By', viewInv.preparedBy || CO.preparedBy], ['Approved By', CO.approvedBy]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{k}</span>
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ margin: '16px 0 8px', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Line Items</div>
            {(viewInv.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{item.service}</span>
                <span style={{ color: '#ff9a4a', fontSize: 13, fontWeight: 600 }}>₱{fmt(item.amount)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid rgba(255,255,255,0.1)', marginTop: 4 }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Total Due</span>
              <span style={{ color: '#ff9a4a', fontWeight: 700, fontSize: 18 }}>₱{fmt(viewInv.total)}</span>
            </div>
            <div style={{ marginTop: 16, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✓ Payment Received</div>
              {[['Method', viewInv.paymentMethod ? viewInv.paymentMethod.charAt(0).toUpperCase() + viewInv.paymentMethod.slice(1) : '—'], ...(viewInv.referenceNumber ? [['Reference #', viewInv.referenceNumber]] : []), ['Paid At', viewInv.paidAt ? (viewInv.paidAt.toDate ? viewInv.paidAt.toDate() : new Date(viewInv.paidAt)).toLocaleString('en-PH') : '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{k}</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { printInvoice(viewInv); }} style={{ ...S.btn, width: '100%', justifyContent: 'center', marginTop: 16, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', padding: '11px 0' }}><Printer size={14} /> Print Invoice</button>
          </div>
        </>
      )}

      {showSidebar && (
        <>
          <div onClick={() => setShowSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520, background: '#0f1218', borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 101, overflowY: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>{editingId ? 'Edit Invoice' : 'New Invoice'}</h3>
              <button onClick={() => setShowSidebar(false)} style={{ ...S.btn, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', padding: '6px 10px' }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={S.lbl}>Bill To (Client)</label>
                <input style={S.inp} value={form.billTo} onChange={e => setForm(f => ({ ...f, billTo: e.target.value }))} placeholder="e.g. CPRMed" required />
              </div>
              <div>
                <label style={S.lbl}>Project</label>
                <input style={S.inp} value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} placeholder="e.g. Clinic Management" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={S.lbl}>Date</label>
                  <input type="date" style={S.inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label style={S.lbl}>Payment Terms</label>
                  <input style={S.inp} value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} placeholder="Cash/Bank Transfer" />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={S.lbl}>Line Items</label>
                  <button type="button" onClick={addItem} style={{ ...S.btn, background: 'rgba(255,106,26,0.15)', color: '#ff9a4a', fontSize: 12, padding: '4px 10px' }}><Plus size={13} /> Add Row</button>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Amount (₱)</span>
                    <span />
                  </div>
                  {form.items.map((item) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '4px 8px', alignItems: 'center' }}>
                      <input style={{ ...S.inp, background: 'transparent', border: 'none', padding: '6px 8px', fontSize: 13 }} value={item.service} onChange={e => updItem(item.id, 'service', e.target.value)} placeholder="Description" />
                      <input type="number" min="0" step="0.01" style={{ ...S.inp, background: 'transparent', border: 'none', padding: '6px 8px', fontSize: 13, textAlign: 'right' }} value={item.amount} onChange={e => updItem(item.id, 'amount', e.target.value)} placeholder="0" />
                      <button type="button" onClick={() => removeItem(item.id)} disabled={form.items.length === 1} style={{ ...S.btn, padding: 4, background: 'none', color: '#f87171', opacity: form.items.length === 1 ? 0.3 : 1 }}><X size={14} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 32px', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>Total</span>
                    <span style={{ color: '#ff9a4a', fontSize: 16, fontWeight: 700, textAlign: 'right' }}>₱{fmt(formTotal)}</span>
                    <span />
                  </div>
                </div>
              </div>

              <div>
                <label style={S.lbl}>Prepared By</label>
                <input style={S.inp} value={form.preparedBy} onChange={e => setForm(f => ({ ...f, preparedBy: e.target.value }))} placeholder="e.g. Johnjosefir Roca" />
              </div>

              <div>
                <label style={S.lbl}>Notes (Optional)</label>
                <textarea style={{ ...S.inp, resize: 'vertical', minHeight: 70 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes…" />
              </div>

              <div>
                <label style={S.lbl}>QR Code on Invoice</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  {[{ id: 'gotyme', label: 'GoTyme', img: '/images/jetchgotyme.png' }, { id: 'maribank', label: 'MariBank', img: '/images/jetchmaribank.png' }].map(({ id, label, img }) => {
                    const active = (form.qrCodes || []).includes(id);
                    const toggle = () => setForm(f => ({ ...f, qrCodes: active ? (f.qrCodes || []).filter(q => q !== id) : [...(f.qrCodes || []), id] }));
                    return (
                      <button key={id} type="button" onClick={toggle} style={{ ...S.btn, flexDirection: 'column', gap: 6, padding: '10px 14px', background: active ? 'rgba(255,106,26,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? 'rgba(255,106,26,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, color: active ? '#ff9a4a' : 'rgba(255,255,255,0.4)', minWidth: 90 }}>
                        <img src={img} alt={label} style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover', opacity: active ? 1 : 0.4 }} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: 10 }}>{active ? '✓ Included' : 'Excluded'}</span>
                      </button>
                    );
                  })}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
                    <button type="button" onClick={() => setForm(f => ({ ...f, qrCodes: ['gotyme', 'maribank'] }))} style={{ ...S.btn, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', fontSize: 11, padding: '6px 10px' }}>Both</button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, qrCodes: [] }))} style={{ ...S.btn, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', fontSize: 11, padding: '6px 10px' }}>None</button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} style={{ ...S.btn, background: saving ? 'rgba(255,106,26,0.4)' : 'linear-gradient(135deg,#ff6a1a,#ff9a4a)', color: '#fff', padding: '13px 0', justifyContent: 'center', fontSize: 15, fontWeight: 600, boxShadow: saving ? 'none' : '0 4px 16px rgba(255,106,26,0.3)', width: '100%', marginTop: 4 }}>
                {saving ? 'Saving…' : editingId ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .inv-row:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>
    </div>
  );
}
