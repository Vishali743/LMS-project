import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, CheckCircle2, Clock, Calendar, Download, 
  Search, ArrowLeft, Loader2, Edit3, Trash2, Eye, 
  RefreshCw, X, ChevronLeft, ChevronRight, Award, HelpCircle
} from 'lucide-react';

export default function InstructorAssignments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    initialTab === 'pending' ? 'pending' : initialTab === 'graded' ? 'reviewed' : 'all'
  );
  const [courseFilter, setCourseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync state if query params change on-the-fly
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'pending') {
      setStatusFilter('pending');
    } else if (tab === 'graded') {
      setStatusFilter('reviewed');
    }
  }, [searchParams]);

  // Selected submission for View/Grade modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Custom Deletion Confirmation Modal
  const [subToDelete, setSubToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubId, setDeletingSubId] = useState(null);

  // Auto-refresh interval ref
  const autoRefreshRef = useRef(null);

  const loadSubmissions = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      
      const res = await api.get('/assignments/instructor/all-submissions');
      setSubmissions(res.data.submissions || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve student submissions list. Please check server connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Fetch & Auto Refresh setup
  useEffect(() => {
    loadSubmissions(true);

    // Set up auto-refresh every 30 seconds to fetch dynamically
    autoRefreshRef.current = setInterval(() => {
      loadSubmissions(false);
    }, 30000);

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, []);

  // Reset pagination on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, courseFilter]);

  // Display success/error alerts briefly and fade out
  const showToast = (message, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Grade Submission Action
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (gradeInput === '' || isNaN(gradeInput)) {
      showToast('Please enter a valid numeric grade.', false);
      return;
    }

    const numericGrade = parseInt(gradeInput);
    if (numericGrade < 0 || numericGrade > selectedSub.max_points) {
      showToast(`Grade points must be between 0 and ${selectedSub.max_points}.`, false);
      return;
    }

    try {
      setSubmittingGrade(true);
      await api.put(`/assignments/submission/${selectedSub.id}/grade`, {
        pointsEarned: numericGrade,
        feedback: feedbackInput
      });
      
      showToast('✓ Assignment grade and feedback saved successfully!');
      setIsViewModalOpen(false);
      setSelectedSub(null);
      await loadSubmissions(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save grading metrics.', false);
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Return Submission for Resubmission Action
  const handleReturnSubmission = async () => {
    if (!selectedSub) return;
    try {
      setSubmittingGrade(true);
      await api.post(`/assignments/submission/${selectedSub.id}/return`);
      
      showToast('✓ Assignment returned to the student for resubmission.');
      setIsViewModalOpen(false);
      setSelectedSub(null);
      await loadSubmissions(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to return assignment for resubmission.', false);
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Delete Submission Action
  const handleDeleteSubmission = async () => {
    if (!subToDelete) return;
    try {
      setDeletingSubId(subToDelete.id);
      await api.delete(`/assignments/submission/${subToDelete.id}`);
      
      showToast('Submission deleted successfully.');
      setIsDeleteModalOpen(false);
      setSubToDelete(null);
      await loadSubmissions(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete student submission.', false);
    } finally {
      setDeletingSubId(null);
    }
  };

  const openViewGradeModal = (sub, autoFocusGrade = false) => {
    setSelectedSub(sub);
    setGradeInput(sub.points_earned !== null && sub.points_earned !== undefined ? sub.points_earned.toString() : '');
    setFeedbackInput(sub.feedback || '');
    setIsViewModalOpen(true);
  };

  const triggerDeleteConfirm = (sub) => {
    setSubToDelete(sub);
    setIsDeleteModalOpen(true);
  };

  // Filtering Logic
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      (sub.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.assignment_title || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || (sub.course_id && sub.course_id.toString() === courseFilter);
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = sub.graded_at === null;
    } else if (statusFilter === 'reviewed') {
      matchesStatus = sub.graded_at !== null;
    }

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Unique Courses list for dropdown filtering
  const coursesList = Array.from(
    new Map(
      submissions
        .filter(s => s.course_id && s.course_title)
        .map(s => [s.course_id, { id: s.course_id, title: s.course_title }])
    ).values()
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container-wide" style={{ paddingBottom: '80px', color: 'var(--text-primary)' }}>
      
      {/* Toast Alert Popups */}
      {success && (
        <div className="glass-panel" style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '12px', borderLeft: '4px solid var(--color-success)',
          background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 12, animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={20} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{success}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '16px 24px', borderRadius: '12px', borderLeft: '4px solid var(--color-error)',
          background: 'var(--bg-secondary)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 12, animation: 'slideIn 0.3s ease-out'
        }}>
          <X size={20} style={{ color: 'var(--color-error)' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Breadcrumbs / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: '36px' }}>
        <div>
          <Link to="/dashboard/teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', marginBottom: 12, transition: 'var(--transition-fast)' }} className="hover-red">
            <ArrowLeft size={14} /> Back to Teacher Dashboard
          </Link>
          <h1 style={{ fontSize: '32px', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #a3a3a3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Assignment Management Console
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 4 }}>
            Review, evaluate and manage all submissions received from your enrolled specializations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => loadSubmissions(false)} 
            disabled={loading || refreshing}
            className="btn btn-secondary" 
            style={{ padding: '10px 18px', display: 'flex', gap: 8, alignItems: 'center', fontSize: '13px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}
          >
            <RefreshCw size={14} className={(loading || refreshing) ? 'spin' : ''} style={{ color: 'var(--accent-primary)' }} />
            {refreshing ? 'Syncing...' : 'Sync Submissions'}
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginBottom: '32px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 2, minWidth: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by student name or assignment title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '42px', width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 51, 68, 0.08)' }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
          {[
            { value: 'all', label: 'All Submissions' },
            { value: 'pending', label: 'Pending Evaluation' },
            { value: 'reviewed', label: 'Reviewed & Graded' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: statusFilter === opt.value ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === opt.value ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Course Dropdown */}
        <div style={{ minWidth: '200px' }}>
          <select 
            className="form-input"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 51, 68, 0.08)' }}
          >
            <option value="all">All Courses</option>
            {coursesList.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 16 }}>
          <Loader2 size={40} className="spin" style={{ color: 'var(--accent-primary)' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px', letterSpacing: '0.05em' }}>FETCHING DATA FROM SYNC POOL...</span>
        </div>
      ) : currentSubmissions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '16px', borderStyle: 'dashed' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(255,51,68,0.05)', border: '1px solid rgba(255,51,68,0.1)', marginBottom: 16 }}>
            <FileText size={36} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: 8 }}>No submissions found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '14px' }}>
            There are no student files matching your search query or filter constraints at the moment.
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', boxShadow: 'var(--shadow-lg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Assignment Title</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Course Spec</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Submission Date</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Marks</th>
                  <th style={{ padding: '18px 24px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSubmissions.map((sub, idx) => {
                  const submissionDate = sub.submitted_at ? new Date(sub.submitted_at) : null;
                  const isLate = sub.due_date && submissionDate && new Date(sub.submitted_at) > new Date(sub.due_date);

                  return (
                    <tr 
                      key={sub.id} 
                      style={{ 
                        borderBottom: idx === currentSubmissions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.02)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                        transition: 'var(--transition-fast)'
                      }}
                      className="table-row-hover"
                    >
                      {/* Student Details */}
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>{sub.student_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{sub.student_email}</div>
                        </div>
                      </td>

                      {/* Assignment */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                          {sub.assignment_title}
                        </div>
                      </td>

                      {/* Course */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {sub.course_title}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '16px 24px' }}>
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} style={{ color: 'var(--accent-primary)' }} />
                            {submissionDate ? submissionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </div>
                          {isLate && (
                            <span style={{ fontSize: '10px', color: 'var(--color-error)', fontWeight: 600, background: 'var(--color-error-bg)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                              LATE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 24px' }}>
                        {sub.graded_at ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            <CheckCircle2 size={12} /> Reviewed
                          </span>
                        ) : sub.returned_for_resubmission ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            Returned
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Marks */}
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: sub.graded_at ? '#fff' : 'var(--text-muted)' }}>
                          {sub.points_earned !== null ? `${sub.points_earned} / ${sub.max_points}` : `- / ${sub.max_points}`}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            onClick={() => openViewGradeModal(sub, false)}
                            style={{ padding: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition-fast)' }}
                            title="View Submission details"
                            className="btn-action-hover"
                          >
                            <Eye size={14} />
                          </button>
                          
                          {sub.file_url ? (
                            <a 
                              href={sub.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ padding: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--color-success)', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'var(--transition-fast)' }}
                              title="Download Attachment File"
                              className="btn-action-hover"
                            >
                              <Download size={14} />
                            </a>
                          ) : (
                            <button 
                              disabled
                              style={{ padding: 8, background: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'not-allowed', display: 'flex', alignItems: 'center' }}
                              title="No attachment uploaded"
                            >
                              <Download size={14} style={{ opacity: 0.3 }} />
                            </button>
                          )}

                          <button 
                            onClick={() => openViewGradeModal(sub, true)}
                            style={{ padding: 8, background: 'rgba(255,51,68,0.02)', border: '1px solid var(--glass-border)', color: 'var(--accent-primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition-fast)' }}
                            title="Grade & Feedback"
                            className="btn-action-hover-red"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button 
                            onClick={() => triggerDeleteConfirm(sub)}
                            style={{ padding: 8, background: 'rgba(239,68,68,0.02)', border: '1px solid var(--glass-border)', color: 'var(--color-error)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'var(--transition-fast)' }}
                            title="Delete Submission"
                            className="btn-action-hover-error"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, filteredSubmissions.length)}</strong> of <strong>{filteredSubmissions.length}</strong> submissions
            </span>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn btn-secondary btn-small"
                style={{ padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center', fontSize: '13px', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === pageNum ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                      border: currentPage === pageNum ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn btn-secondary btn-small"
                style={{ padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center', fontSize: '13px', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* VIEW & EVALUATE GRADE MODAL */}
      {isViewModalOpen && selectedSub && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '20px'
        }} onClick={() => setIsViewModalOpen(false)}>
          
          <div 
            className="glass-panel" 
            style={{
              width: '100%', maxWidth: '850px', borderRadius: '16px',
              border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', maxHeight: '90vh',
              animation: 'modalOpen 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.15)' }}>
              <div>
                <span className="badge badge-category" style={{ marginBottom: 6, display: 'inline-block' }}>{selectedSub.course_title}</span>
                <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>Evaluate Student Submission</h2>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
                className="hover-red"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flex: 1, overflowY: 'auto', flexWrap: 'wrap' }}>
              
              {/* Left Column: Student Details & Work */}
              <div style={{ flex: 1, minWidth: '320px', padding: '28px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 8 }}>Student Info</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '16px' }}>
                      {(selectedSub.student_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{selectedSub.student_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedSub.student_email}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 4 }}>Assignment Details</h4>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{selectedSub.assignment_title}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> Submitted: {new Date(selectedSub.submitted_at).toLocaleDateString()}</span>
                    {selectedSub.due_date && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> Due: {new Date(selectedSub.due_date).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 8 }}>Student Answer Note</h4>
                  <div style={{
                    flex: 1, padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', fontSize: '13px', color: 'var(--text-secondary)',
                    minHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.6'
                  }}>
                    {selectedSub.submission_text || 'No text justification was attached with this submission.'}
                  </div>
                </div>

                {selectedSub.file_url && (
                  <div>
                    <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 8 }}>Submission Attachment</h4>
                    <a 
                      href={selectedSub.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary"
                      style={{ width: '100%', display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', fontSize: '13px' }}
                    >
                      <Download size={14} style={{ color: 'var(--color-success)' }} /> Download Student Document ZIP/PDF
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Grading Inputs */}
              <div style={{ width: '340px', padding: '28px', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={18} style={{ color: 'var(--accent-primary)' }} /> Marking Evaluation
                </h3>
                
                <form onSubmit={handleGradeSubmission} style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px' }}>Points Awarded (Max: {selectedSub.max_points})</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      placeholder="e.g. 85"
                      min="0"
                      max={selectedSub.max_points}
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 51, 68, 0.08)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '12px' }}>Feedback & Remarks Guidelines</label>
                    <textarea
                      className="form-input"
                      rows="6"
                      placeholder="Write feedback notes, code improvements, details..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255, 51, 68, 0.08)', resize: 'none', height: '120px', padding: '12px' }}
                    />
                  </div>

                  {selectedSub.graded_at && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Graded on {new Date(selectedSub.graded_at).toLocaleString()}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submittingGrade}
                      style={{ width: '100%', display: 'flex', gap: 8, justifyContent: 'center' }}
                    >
                      {submittingGrade ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
                      {submittingGrade ? 'Updating Scores...' : 'Save & Publish Grade'}
                    </button>

                    <button 
                      type="button" 
                      onClick={handleReturnSubmission}
                      className="btn btn-secondary"
                      disabled={submittingGrade}
                      style={{ width: '100%', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', gap: 8, justifyContent: 'center', background: 'transparent' }}
                    >
                      <RefreshCw size={14} /> Return for Resubmission
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION DIALOG */}
      {isDeleteModalOpen && subToDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div 
            className="glass-panel" 
            style={{
              width: '100%', maxWidth: '480px', borderRadius: '16px',
              padding: '32px', background: 'var(--bg-secondary)',
              border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'var(--shadow-lg)',
              animation: 'modalOpen 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: '50%', background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: 700 }}>Confirm Deletion</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 28 }}>
              Are you sure you want to delete the submission of <strong>{subToDelete.student_name}</strong> for the assignment <strong>"{subToDelete.assignment_title}"</strong>? 
              This will erase their grading file history and remove records from the ledger.
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setSubToDelete(null); }}
                className="btn btn-secondary"
                disabled={deletingSubId !== null}
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteSubmission}
                className="btn"
                disabled={deletingSubId !== null}
                style={{ background: 'var(--color-error)', color: '#fff', padding: '10px 20px', fontSize: '13px', display: 'flex', gap: 8, alignItems: 'center' }}
              >
                {deletingSubId ? <Loader2 size={14} className="spin" /> : null}
                {deletingSubId ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Animations styling block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes modalOpen {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .table-row-hover:hover {
          background: rgba(255, 51, 68, 0.02) !important;
          border-left: 2px solid var(--accent-primary);
        }
        .btn-action-hover:hover {
          background: rgba(255,255,255,0.08) !important;
          transform: translateY(-1px);
        }
        .btn-action-hover-red:hover {
          background: rgba(255,51,68,0.1) !important;
          border-color: rgba(255,51,68,0.3) !important;
          transform: translateY(-1px);
        }
        .btn-action-hover-error:hover {
          background: rgba(239,68,68,0.1) !important;
          border-color: rgba(239,68,68,0.3) !important;
          transform: translateY(-1px);
        }
        .hover-red:hover {
          color: var(--accent-primary) !important;
        }
      `}} />

    </div>
  );
}
