import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Check, X, AlertCircle, Clock, 
  ArrowRight, Info, Plus, Zap, Activity, 
  MessageSquare, Settings, Shield, Globe
} from 'lucide-react';

const S = {
  container: {
    minHeight: '100vh',
    background: '#0a0d14',
    color: '#fff',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    paddingBottom: 80,
    overflowX: 'hidden'
  },
  glass: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
  },
  chip: (color) => ({
    display: 'inline-flex',
    padding: '4px 12px',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: `${color}15`,
    color: color,
    border: `1px solid ${color}30`,
    borderRadius: 100,
    marginBottom: 12
  }),
  btn: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s ease'
  }
};

const PLANS = [
  {
    name: 'Basic Care Plan',
    price: '₱1,500',
    period: '/month',
    color: '#3b82f6',
    desc: 'Recommended for portfolio websites and small business landing pages.',
    includes: [
      'Website uptime monitoring',
      'Minor text/image updates',
      'Basic bug fixes',
      'Monthly database backup',
      'Basic technical support',
      'Security monitoring'
    ],
    limitations: [
      'Max 2 minor requests per month',
      'Completion within 3–7 business days',
      'No new features or redesigns',
      'Hosting/domain fees excluded'
    ]
  },
  {
    name: 'Standard Care Plan',
    price: '₱3,500',
    period: '/month',
    color: '#f59e0b',
    recommended: true,
    desc: 'Perfect for booking systems, small clinics, and ERP/POS systems.',
    includes: [
      'Everything in Basic Plan',
      'Minor UI/UX improvements',
      'Small workflow adjustments',
      'Database optimization',
      'Priority technical support',
      'Minor feature enhancements',
      'Monthly system health checks'
    ],
    limitations: [
      'Max 5 minor requests per month',
      'Max 1 small feature monthly',
      'Completion within 2–5 business days',
      'Major features quoted separately',
      'Third-party API costs excluded'
    ]
  },
  {
    name: 'Premium Continuous Improvement',
    price: '₱7,500',
    period: '/month+',
    color: '#10b981',
    desc: 'For high-traffic platforms, multi-branch ERPs, and growing businesses.',
    includes: [
      'Everything in Standard Plan',
      'Priority development queue',
      'Continuous system improvements',
      'Advanced reporting enhancements',
      'Performance optimization',
      'Consultation & scaling recommendations',
      'Advanced troubleshooting',
      'Dedicated support assistance'
    ],
    limitations: [
      'Max 10 minor requests monthly',
      'Max 2 moderate enhancements monthly',
      'Large modules billed separately',
      'External software/service excluded'
    ]
  }
];

const ADDONS = [
  { service: 'Additional Minor Request', price: '₱500/request' },
  { service: 'Emergency Same-Day Support', price: '₱1,500+' },
  { service: 'Additional Monthly Backup', price: '₱500/month' },
  { service: 'Server/Hosting Management', price: '₱1,000+/month' },
  { service: 'Feature Development', price: 'Subject for Quotation' },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div style={S.container}>
      {/* Navbar Overlay */}
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>ODYSSEY<span style={{ color: '#3b82f6' }}>PH</span></span>
        </div>
        <button onClick={() => navigate('/portal')} style={{ ...S.btn, background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, padding: '8px 20px' }}>
          Client Login
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '40%', background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.1), transparent 70%)', pointerEvents: 'none' }} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={S.chip('#3b82f6')}>Support & Maintenance</div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 850, letterSpacing: '-0.04em', margin: '0 0 20px 0', lineHeight: 1.1 }}>
            Simple Pricing for <span style={{ color: '#3b82f6' }}>Continuous Growth</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
            Reliable technical support, security monitoring, and system improvements tailored for your OdysseyPH developed systems.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ 
              ...S.glass, 
              padding: 40, 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              overflow: 'hidden',
              background: plan.recommended ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
              borderColor: plan.recommended ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'
            }}
          >
            {plan.recommended && (
              <div style={{ position: 'absolute', top: 20, right: -35, background: '#f59e0b', color: '#000', padding: '6px 40px', transform: 'rotate(45deg)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                Most Popular
              </div>
            )}
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0' }}>{plan.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>{plan.desc}</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 40 }}>
                <span style={{ fontSize: 48, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's Included:</div>
                {plan.includes.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    <Check size={18} color={plan.color} style={{ marginTop: 2, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limitations:</div>
                {plan.limitations.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    <X size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button style={{ ...S.btn, background: plan.color, color: '#fff', marginTop: 40, boxShadow: `0 8px 24px ${plan.color}30` }}>
              Get Started <ArrowRight size={18} />
            </button>
          </motion.div>
        ))}
      </section>

      {/* Definition of Minor Requests */}
      <section style={{ maxWidth: 1200, margin: '120px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px 0' }}>Definition of <span style={{ color: '#3b82f6' }}>Minor Requests</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0 auto' }}>Requests typically completed within 1–3 hours of workload.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { icon: <MessageSquare size={20} />, title: 'Text & Content', desc: 'Changing labels, descriptions, or general text content across the system.' },
            { icon: <Zap size={20} />, title: 'UI Adjustments', desc: 'Small visual tweaks, adjusting forms, and layout refinements.' },
            { icon: <Plus size={20} />, title: 'Field Additions', desc: 'Adding simple fields to existing forms or data displays.' },
            { icon: <Activity size={20} />, title: 'Reports & Data', desc: 'Small report modifications and dashboard improvements.' },
            { icon: <Settings size={20} />, title: 'Pricing & Values', desc: 'Updating product pricing, system variables, or config values.' },
            { icon: <Clock size={20} />, title: 'Speed Adjustments', desc: 'Simple automation tweaks and performance micro-optimizations.' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -5, background: 'rgba(255,255,255,0.06)' }}
              style={{ ...S.glass, padding: 24, transition: 'all 0.2s' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>{item.title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Not Included & Support Info */}
      <section style={{ maxWidth: 1200, margin: '120px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 40 }}>
        <div style={{ ...S.glass, padding: 40, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <AlertCircle color="#f87171" size={24} />
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Not Included</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 24 }}>The following require separate quotations and are not covered by maintenance plans:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              'Entire new modules', 'Mobile applications', 'AI integrations', 'Payroll systems',
              'Accounting systems', 'Multi-company architecture', 'Large database restructuring',
              'Third-party API integrations', 'Advanced analytics', 'Major redesigns'
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ color: '#f87171' }}>•</span> {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...S.glass, padding: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Support Hours</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Available 24/7<br />Dedicated support team always ready.</p>
            </div>
          </div>
          
          <div style={{ ...S.glass, padding: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Payment Terms</h4>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Monthly payments due as agreed. Non-refundable once service month begins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Add-ons */}
      <section style={{ maxWidth: 1200, margin: '120px auto 0', padding: '0 24px' }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Optional <span style={{ color: '#3b82f6' }}>Add-ons</span></h3>
        <div style={{ ...S.glass, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '20px 32px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Service</th>
                <th style={{ padding: '20px 32px', textAlign: 'right', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Pricing</th>
              </tr>
            </thead>
            <tbody>
              {ADDONS.map((addon, i) => (
                <tr key={addon.service} style={{ borderBottom: i === ADDONS.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '20px 32px', fontSize: 15, fontWeight: 600 }}>{addon.service}</td>
                  <td style={{ padding: '20px 32px', textAlign: 'right', fontSize: 15, color: '#3b82f6', fontWeight: 700 }}>{addon.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Important Terms Footer */}
      <section style={{ maxWidth: 800, margin: '100px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.6 }}>
          <p style={{ marginBottom: 16 }}>* Maintenance plans cover only systems developed by OdysseyPH IT Solutions unless otherwise agreed.</p>
          <p>Unused monthly requests do not roll over. OdysseyPH reserves the right to classify requests as minor or major based on technical scope.</p>
        </div>
      </section>

    </div>
  );
}
