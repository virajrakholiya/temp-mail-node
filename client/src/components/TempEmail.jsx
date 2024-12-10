import axios from 'axios';
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function TempMail() {
  const { token } = useAuth()
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  
  const generateEmail = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:3000/temp-mail/generate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const emailData = response.data.email;
      // Handle both string and object responses
      const emailAddress = typeof emailData === 'string' ? emailData : emailData.address;
      
      if (emailAddress) {
        setEmail(emailAddress);
      } else {
        throw new Error('No valid email address received');
      }
    } catch (error) {
      setError('Error generating email address');
      console.error('Error generating email:', error);
    }
  }

  const fetchEmails = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/temp-mail/fetch', 
        { email: `${email}@1secmail.com` },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 5000
        }
      );
      setEmails(response.data.emails || []);
    } catch (error) {
      if (axios.isCancel(error)) {
        setError('Request timed out');
      } else {
        setError('Error fetching emails');
        console.error('Error fetching emails:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      generateEmail();
    }
  }, [token]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border border-dashed border-gray-700 p-8 rounded-lg">
          <h1 className="text-2xl font-mono text-center mb-6">Your Temporary Email Address</h1>
          
          <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 mb-4">
            <span className="font-mono text-lg">{email}</span>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                onClick={copyToClipboard}
              >
                {copySuccess ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-center text-sm">
            Forget about spam, advertising mailings, hacking and attacking robots.
            Keep your real mailbox clean and secure. Temp Mail provides temporary,
            secure, anonymous, free, disposable email address.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            onClick={copyToClipboard}
          >
            Copy
          </button>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            onClick={fetchEmails}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            onClick={generateEmail}
          >
            Change
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-900 p-4 text-sm font-semibold">
            <div>SENDER</div>
            <div>SUBJECT</div>
            <div>VIEW</div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
              </svg>
              <p className="text-gray-400">Checking for new emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4">
                <svg className="h-12 w-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l4-4m0 0l4-4m-4 4v12" />
                </svg>
              </div>
              <h3 className="text-xl mb-2">Your inbox is empty</h3>
              <p className="text-gray-400">Waiting for incoming emails</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {emails.map((email, index) => (
                <div key={index} className="grid grid-cols-3 p-4">
                  <div>{email.from}</div>
                  <div>{email.subject || 'No Subject'}</div>
                  <div>
                    <button 
                      className="text-blue-500 hover:underline"
                      onClick={() => {
                        setSelectedEmail(email);
                        setShowDialog(true);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {showDialog && selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
              <button 
                onClick={() => setShowDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-2" dangerouslySetInnerHTML={{ __html: selectedEmail.message }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
