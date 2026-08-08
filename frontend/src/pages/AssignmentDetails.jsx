import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { uploadToStorage } from '../services/firebase';
import { 
  FileText, Upload, Calendar, Clock, CheckCircle2, 
  AlertCircle, ArrowLeft, Download, Paperclip, Send 
} from 'lucide-react';

export default function AssignmentDetails() {
  const { id } = useParams(); // courseId
  
  const [assignments, setAssignments] = useState([]);
  const [selectedAss, setSelectedAss] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Submit form state
  const [textInput, setTextInput] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const loadAssignmentsData = async () => {
    try {
      setLoading(true);
      const assRes = await api.get(`/assignments/course/${id}`);
      const list = assRes.data.assignments || [];
      setAssignments(list);
      
      if (list.length > 0) {
        // Auto-select first assignment
        await selectAssignment(list[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assignments.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentsData();
  }, [id]);

  const selectAssignment = async (ass) => {
    setSelectedAss(ass);
    setError('');
    setSuccess('');
    setTextInput('');
    setFileUrl('');
    
    try {
      // Check if student has an existing submission
      const subRes = await api.get(`/assignments/course/${id}/my`);
      const existingSub = subRes.data.submissions?.find(s => s.assignment_id === ass.id);
      setSubmission(existingSub || null);
      if (existingSub) {
        setTextInput(existingSub.submission_text || '');
        setFileUrl(existingSub.file_url || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isMockConfig = !import.meta.env.VITE_FIREBASE_API_KEY || 
                          import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                          import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

    try {
      setUploadingFile(true);
      setSuccess('Uploading template guidelines attachment...');
      
      let url = '';
      if (!isMockConfig) {
        url = await uploadToStorage('assignments', file);
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        url = response.data.fileUrl;
      }
      
      setFileUrl(url);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to upload file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!textInput && !fileUrl) {
      setError('Please provide a submission text or attach a file.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/assignments/${selectedAss.id}/submit`, {
        submissionText: textInput,
        fileUrl
      });
      setSuccess('✓ Assignment submitted successfully!');
      
      // Dispatch progress check recount
      try {
        await api.post('/progress/update', { lessonId: 0, completed: true });
      } catch (pErr) {
        console.warn(pErr);
      }

      await selectAssignment(selectedAss);
    } catch (err) {
      console.error(err);
      setError('Failed to submit assignment.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', minHeight: '80vh', paddingBottom: '80px' }}>
      
      {/* Sidebar List */}
      <div className="glass-panel" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20, height: 'fit-content' }}>
        
        <Link to={`/courses/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={14} /> Back to Course
        </Link>

        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: 12 }}>
            Assignments List
          </h4>

          {assignments.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No assignments posted</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {assignments.map(ass => {
                const isSelected = selectedAss?.id === ass.id;
                return (
                  <div
                    key={ass.id}
                    onClick={() => selectAssignment(ass)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255, 51, 68, 0.08)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                      fontSize: '13px',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ass.title}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ass.section_title || 'Module Deliverable'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Details Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {selectedAss ? (
          <div>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', border: '1px solid var(--glass-border)', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span className="badge badge-category" style={{ marginBottom: 8 }}>COURSE ASSIGNMENT</span>
                  <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: 8 }}>{selectedAss.title}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{selectedAss.description || 'Review the requirements outline below.'}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Due Date: {new Date(selectedAss.due_date || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                    <span>Max Marks: {selectedAss.max_points || 100}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission card details */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: 20 }}>Submission Brief</h3>
              
              {submission ? (
                // Already Submitted details
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={16} />
                    <span>Assignment submission has been successfully uploaded.</span>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Submitted Text Notes:</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Date: {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#fff', whiteSpace: 'pre-line' }}>{submission.submission_text || 'No text note provided.'}</p>
                    
                    {submission.file_url && (
                      <div style={{ marginTop: 16 }}>
                        <a 
                          href={submission.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-small"
                          style={{ display: 'inline-flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}
                        >
                          <Download size={12} /> Download Attachment File
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Grading feedback if graded */}
                  {submission.graded_at ? (
                    <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.02)' }}>
                      <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: 6 }}>Grade Awarded: {submission.points_earned} / {selectedAss.max_points}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <strong>Instructor Feedback:</strong> {submission.feedback || 'No written feedback was provided.'}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: 12 }}>
                        Graded Date: {new Date(submission.graded_at).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--color-warning)' }} />
                      <span>Submission pending review and grading by the instructor.</span>
                    </div>
                  )}

                  {/* Re-submission Form */}
                  {!submission.graded_at && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 20, marginTop: 10 }}>
                      <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: 12 }}>Resubmit Deliverables</h4>
                      <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-group">
                          <textarea
                            className="form-input"
                            placeholder="Add files guidelines descriptions..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            style={{ minHeight: '100px' }}
                          />
                        </div>

                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                            <Upload size={13} /> {uploadingFile ? 'Uploading...' : 'Upload Attachment Document'}
                            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                          </label>
                          {fileUrl && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Paperclip size={12} /> {fileUrl.split('/').pop()}
                            </span>
                          )}
                        </div>

                        <button type="submit" className="btn btn-primary btn-small" style={{ width: 'fit-content' }}>
                          Update Submission
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              ) : (
                // Submit Form
                <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px' }}>Submission Notes</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Paste your code repository link, description details, or comments here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      style={{ minHeight: '120px' }}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <label className="btn btn-secondary btn-small" style={{ cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Upload size={14} /> {uploadingFile ? 'Uploading...' : 'Attach PDF / ZIP File'}
                      <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                    {fileUrl && (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Paperclip size={12} /> {fileUrl.split('/').pop()}
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary btn-small" style={{ width: 'fit-content', marginTop: 8 }}>
                    Submit Assignment Deliverable
                  </button>
                </form>
              )}

            </div>

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h4>No assignments created for this course.</h4>
          </div>
        )}

      </div>

    </div>
  );
}
