import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  CreditCard, Smartphone, Landmark, ArrowLeft, 
  ShieldCheck, CheckCircle2, Loader2, BookOpen
} from 'lucide-react';

export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, bank
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  // Load Course Info
  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data.course);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve course details.');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container-wide" style={{ padding: '60px 0', textAlign: 'center' }}>
        <ShieldCheck size={48} color="#ef4444" style={{ marginBottom: 16 }} />
        <h2>{error || 'Course not found'}</h2>
        <Link to="/courses" className="btn btn-secondary" style={{ marginTop: 20 }}>Return to Catalog</Link>
      </div>
    );
  }

  const originalPrice = parseFloat(course.price || 0);
  const discountAmount = originalPrice * 0.20; // 20% discount
  const baseAmount = originalPrice - discountAmount;
  const gstAmount = baseAmount * 0.18; // GST 18%
  const totalPayable = baseAmount + gstAmount;

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!dbUser) {
      return navigate('/login/student');
    }

    try {
      setProcessing(true);
      setError('');
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Log payment record and enroll student
      await api.post(`/enrollments/${courseId}/payment`, {
        amount: totalPayable,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionId
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="container-wide" style={{ maxWidth: '600px', padding: '80px 0', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '8px' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
            You have successfully enrolled in <strong>{course.title}</strong>. The course curriculum has been unlocked.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '32px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Course Name:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{course.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>₹{totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
              <span style={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase' }}>{paymentMethod}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Link to={`/courses/${courseId}/play`} className="btn btn-primary">
              Start Learning Now
              <ArrowLeft style={{ transform: 'rotate(180deg)' }} size={16} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ maxWidth: '900px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link to={`/courses/${courseId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '32px', color: '#fff' }}>Secure Checkout</h1>

      {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>{error}</div>}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '30px'
      }} className="catalog-layout">
        
        {/* Left: Payment Form options */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px' }}>Select Payment Method</h3>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: '30px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPaymentMethod('card')}
              style={{
                flex: 1, minWidth: '100px', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                background: paymentMethod === 'card' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.02)',
                color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <CreditCard size={20} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Credit / Debit Card</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('upi')}
              style={{
                flex: 1, minWidth: '100px', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                background: paymentMethod === 'upi' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.02)',
                color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <Smartphone size={20} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>UPI</span>
            </button>
            
            <button
              onClick={() => setPaymentMethod('bank')}
              style={{
                flex: 1, minWidth: '100px', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                background: paymentMethod === 'bank' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.02)',
                color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
              }}
            >
              <Landmark size={20} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Net Banking</span>
            </button>
          </div>

          <form onSubmit={handlePaymentSubmit}>
            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    className="form-input"
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      className="form-input"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength="3"
                      className="form-input"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <div className="form-group">
                <label className="form-label">UPI ID (Virtual Payment Address)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'bank' && (
              <div className="form-group">
                <label className="form-label">Select Your Bank</label>
                <select
                  className="form-select"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '30px', display: 'flex', justifyStyle: 'center', justifyContent: 'center', gap: 10 }}
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Processing Transaction...
                </>
              ) : (
                `Pay Securely ₹${totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              )}
            </button>
          </form>
        </div>

        {/* Right: Checkout Course Summary */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={18} style={{ color: 'var(--accent-primary)' }} /> Order Summary
            </h3>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '6px',
                backgroundImage: `url(${course.thumbnail_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0
              }} />
              <div>
                <h4 style={{ fontSize: '13px', color: '#fff', margin: '0 0 4px 0', lineHeight: 1.4 }}>{course.title}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>By {course.instructor_name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--glass-border)', paddingTop: 16, fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Original Price</span>
                <span>₹{originalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                <span>Promo Discount (20%)</span>
                <span>-₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: 12, color: 'var(--text-secondary)' }}>
                <span>Amount</span>
                <span>₹{baseAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>GST (18%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: 12, color: '#fff', fontWeight: 700, fontSize: '16px' }}>
                <span>Total Amount</span>
                <span>₹{totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '11px', padding: '0 10px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <span>SSL Secured Checkout. Skein LMS uses 256-bit encryption for all transactional operations.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
