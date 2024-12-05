import React, { useState, FC, FormEvent } from 'react';
import axios from 'axios';

interface ApiResponse {
  Total_pages: number;
  Execution_Time: string;
  Time: string;
  Data?: string[];
}

const AdminPanel: FC = () => {
  const [rootUrl, setRootUrl] = useState<string>('');
  const [apiOutput, setApiOutput] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoadingSpinnerVisible, setIsLoadingSpinnerVisible] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoadingSpinnerVisible(true);

    try {
      if (!rootUrl) {
        throw new Error('Please enter a Root URL');
      }

      const response = await axios.post<ApiResponse>('https://interim-cabdemo-module.com', {
        url: rootUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setApiOutput(response.data);
      console.log(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.log(err);
    } finally {
      setIsLoadingSpinnerVisible(false);
      setLoading(false);
    }
  };

  const formatData = (data: ApiResponse): JSX.Element => {
    return (
      <div style={styles.responseContainer}>
        <div style={styles.statusMessage}>
          <span style={styles.icon}>✅</span>
          URL processed successfully and Stored to the s3 bucket as .zip file with metadata
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Pages</span>
            <span style={styles.statValue}>{data.Total_pages}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Execution Time</span>
            <span style={styles.statValue}>{data.Execution_Time}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Time</span>
            <span style={styles.statValue}>{data.Time}</span>
          </div>
        </div>

        <div style={styles.urlSection}>
          <h3 style={styles.urlTitle}>Processed URLs</h3>
          <div style={styles.urlList}>
            {data.Data?.map((url: string, index: number) => (
              <div key={index} style={styles.urlItem}>
                <span style={styles.urlIcon}>🔗</span>
                <a href={url} target="_blank" rel="noopener noreferrer" style={styles.url}>
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Auto-Connect admin panel for RAG </h1>
            <p style={styles.subtitle}>Process and analyze website URLs for Auto-Connect</p>
          </div>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputContainer}>
              <input
                type="text"
                placeholder="Please Enter Root URL"
                value={rootUrl}
                onChange={(e) => setRootUrl(e.target.value)}
                style={styles.input}
              />
              <button 
                type="submit" 
                disabled={loading}
                style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
              >
                {loading ? (
                  <div style={styles.loadingText}>
                    <span>Processing</span>
                    <span style={styles.dots}>...</span>
                  </div>
                ) : 'Submit'}
              </button>
            </div>
            {isLoadingSpinnerVisible && (
              <div style={styles.spinner}>
                <span>🔄 Loading...</span>
              </div>
            )}
            {!rootUrl && !loading && (
              <div style={styles.warningMessage}>
                <span style={styles.warningIcon}>⚠️</span>
                Please give a URL to proceed further
              </div>
            )}
          </form>

          {error && (
            <div style={styles.error}>
              <span style={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {apiOutput && formatData(apiOutput)}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  background: {
    minHeight: '88vh',
    backgroundColor: '#f0f2f5',
    paddingTop: '40px',
    paddingBottom: '40px',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  form: {
    marginBottom: '24px',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e1e1e1',
    borderRadius: '8px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  spinner: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#2563eb',
  },
  warningMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fef9c3',
    color: '#9a7b0c',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '8px',
  },
  warningIcon: {
    fontSize: '18px',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  responseContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statusMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    color: '#166534',
    fontSize: '16px',
    fontWeight: '500',
  },
  icon: {
    fontSize: '20px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '8px',
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '18px',
    color: '#0f172a',
    fontWeight: '600',
  },
  urlSection: {
    marginTop: '16px',
  },
  urlTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '12px',
  },
  urlList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  urlItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  urlIcon: {
    fontSize: '16px',
  },
  url: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px'
  },
};

export default AdminPanel;