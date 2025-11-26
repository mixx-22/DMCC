import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('documents')
    return saved ? JSON.parse(saved) : []
  })

  const [archivedDocuments, setArchivedDocuments] = useState(() => {
    const saved = localStorage.getItem('archivedDocuments')
    return saved ? JSON.parse(saved) : []
  })

  const [certifications, setCertifications] = useState(() => {
    const saved = localStorage.getItem('certifications')
    return saved ? JSON.parse(saved) : []
  })

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('activityLogs')
    return saved ? JSON.parse(saved) : []
  })

  const [recentDocuments, setRecentDocuments] = useState(() => {
    const saved = localStorage.getItem('recentDocuments')
    return saved ? JSON.parse(saved) : []
  })

  const [starredDocuments, setStarredDocuments] = useState(() => {
    const saved = localStorage.getItem('starredDocuments')
    return saved ? JSON.parse(saved) : []
  })

  const [recentFolders, setRecentFolders] = useState(() => {
    const saved = localStorage.getItem('recentFolders')
    return saved ? JSON.parse(saved) : []
  })

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('accounts')
    return saved ? JSON.parse(saved) : []
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents))
  }, [documents])

  useEffect(() => {
    localStorage.setItem('archivedDocuments', JSON.stringify(archivedDocuments))
  }, [archivedDocuments])

  useEffect(() => {
    localStorage.setItem('certifications', JSON.stringify(certifications))
  }, [certifications])

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
  }, [activityLogs])

  useEffect(() => {
    localStorage.setItem('recentDocuments', JSON.stringify(recentDocuments))
  }, [recentDocuments])

  useEffect(() => {
    localStorage.setItem('starredDocuments', JSON.stringify(starredDocuments))
  }, [starredDocuments])

  useEffect(() => {
    localStorage.setItem('recentFolders', JSON.stringify(recentFolders))
  }, [recentFolders])

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const addActivityLog = (action, type, itemId, itemName) => {
    const log = {
      id: Date.now().toString(),
      action,
      type,
      itemId,
      itemName,
      timestamp: new Date().toISOString(),
    }
    setActivityLogs(prev => [log, ...prev].slice(0, 100)) // Keep last 100 logs
  }

  const addRecentDocument = (documentId, documentName, type) => {
    const recent = {
      id: documentId,
      name: documentName,
      type,
      openedAt: new Date().toISOString(),
    }
    setRecentDocuments(prev => {
      const filtered = prev.filter(doc => doc.id !== documentId)
      return [recent, ...filtered].slice(0, 10) // Keep last 10
    })
  }

  const addRecentFolder = (folderName) => {
    const recent = {
      name: folderName,
      openedAt: new Date().toISOString(),
    }
    setRecentFolders(prev => {
      const filtered = prev.filter(f => f.name !== folderName)
      return [recent, ...filtered].slice(0, 10) // Keep last 10
    })
  }

  const toggleStar = (documentId) => {
    setStarredDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId)
      }
      return [...prev, documentId]
    })
  }

  const generateDocumentId = () => {
    const prefix = 'DOC'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}-${timestamp}-${random}`
  }

  const addDocument = (document) => {
    const newDoc = {
      ...document,
      id: Date.now().toString(),
      documentId: document.documentId || generateDocumentId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      isNew: true,
      department: document.department || '',
      createdBy: document.createdBy || null,
      createdByName: document.createdByName || currentUser?.name || null,
      createdByUserType: document.createdByUserType || null,
      versions: document.versions || [{ version: 1, file: document.file, uploadedAt: new Date().toISOString() }],
    }
    setDocuments(prev => [...prev, newDoc])
    addActivityLog('created', 'document', newDoc.id, newDoc.title)
    return newDoc
  }

  const updateDocument = (id, updates) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, ...updates } : doc
      )
    )
    addActivityLog('updated', 'document', id, updates.title || 'Document')
  }

  const deleteDocument = (id) => {
    const doc = documents.find(d => d.id === id)
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    addActivityLog('deleted', 'document', id, doc?.title || 'Document')
  }

  const archiveDocument = (id) => {
    const doc = documents.find(d => d.id === id)
    if (!doc) return
    const archived = {
      ...doc,
      archivedAt: new Date().toISOString(),
      status: 'archived',
    }
    setArchivedDocuments(prev => [archived, ...prev])
    setDocuments(prev => prev.filter(d => d.id !== id))
    addActivityLog('archived', 'document', id, doc.title || 'Document')
  }

  const restoreDocument = (id) => {
    const doc = archivedDocuments.find(d => d.id === id)
    if (!doc) return
    const restored = {
      ...doc,
      status: 'pending',
      archivedAt: null,
    }
    setDocuments(prev => [restored, ...prev])
    setArchivedDocuments(prev => prev.filter(d => d.id !== id))
    addActivityLog('restored', 'document', id, doc.title || 'Document')
  }

  const deleteArchivedDocument = (id) => {
    const doc = archivedDocuments.find(d => d.id === id)
    setArchivedDocuments(prev => prev.filter(d => d.id !== id))
    addActivityLog('deleted_permanently', 'document', id, doc?.title || 'Document')
  }

  const approveDocument = (id) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { 
          ...doc, 
          status: 'approved', 
          approvedAt: new Date().toISOString(),
          isNew: false,
          isRevised: false,
        } : doc
      )
    )
    const doc = documents.find(d => d.id === id)
    addActivityLog('approved', 'document', id, doc?.title || 'Document')
  }

  const rejectDocument = (id, reason) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, status: 'rejected', rejectionReason: reason } : doc
      )
    )
    const doc = documents.find(d => d.id === id)
    addActivityLog('rejected', 'document', id, doc?.title || 'Document')
  }

  const addDocumentVersion = (id, file) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          const newVersion = {
            version: doc.versions.length + 1,
            file,
            uploadedAt: new Date().toISOString(),
          }
          return {
            ...doc,
            versions: [...doc.versions, newVersion],
            status: 'pending',
            isRevised: true,
            isNew: false,
          }
        }
        return doc
      })
    )
    addActivityLog('version_added', 'document', id, 'Document')
  }

  const checkOutDocument = (id) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { 
          ...doc, 
          checkedOut: true,
          checkedOutAt: new Date().toISOString(),
          checkedOutBy: currentUser
            ? { id: currentUser.id, name: currentUser.name }
            : { id: 'anonymous', name: 'Current User' }, // Fallback for missing auth context
        } : doc
      )
    )
    const doc = documents.find(d => d.id === id)
    addActivityLog('checked_out', 'document', id, doc?.title || 'Document')
  }

  const checkInDocument = (id, file) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          const newVersion = {
            version: doc.versions.length + 1,
            file,
            uploadedAt: new Date().toISOString(),
          }
          return {
            ...doc,
            versions: [...doc.versions, newVersion],
            checkedOut: false,
            checkedOutAt: null,
            checkedOutBy: null,
            checkedInAt: new Date().toISOString(),
            status: 'pending', // Requires approval before posting
            isRevised: true,
            isNew: false,
            // Preserve department and creator info
            department: doc.department,
            createdBy: doc.createdBy,
            createdByUserType: doc.createdByUserType,
          }
        }
        return doc
      })
    )
    const doc = documents.find(d => d.id === id)
    addActivityLog('checked_in', 'document', id, doc?.title || 'Document')
  }

  const addCertification = (certification) => {
    const newCert = {
      ...certification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      department: certification.department || currentUser?.department || '',
      requestedBy: certification.requestedBy || currentUser?.id || null,
      requestedByName: certification.requestedByName || currentUser?.name || '',
    }
    setCertifications(prev => [...prev, newCert])
    addActivityLog('created', 'certification', newCert.id, newCert.name)
    return newCert
  }

  const updateCertification = (id, updates) => {
    setCertifications(prev =>
      prev.map(cert =>
        cert.id === id
          ? {
              ...cert,
              ...updates,
              department: updates.department ?? cert.department,
            }
          : cert
      )
    )
    addActivityLog('updated', 'certification', id, updates.name || 'Certification')
  }

  const deleteCertification = (id) => {
    const cert = certifications.find(c => c.id === id)
    setCertifications(prev => prev.filter(c => c.id !== id))
    addActivityLog('deleted', 'certification', id, cert?.name || 'Certification')
  }

  const getExpiringCertifications = () => {
    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    
    return certifications.filter(cert => {
      if (!cert.expirationDate) return false
      const expDate = new Date(cert.expirationDate)
      return expDate <= twoMonthsFromNow && expDate >= new Date()
    })
  }

  const addAccount = (account) => {
    const newAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setAccounts(prev => [...prev, newAccount])
    addActivityLog('created', 'account', newAccount.id, newAccount.name)
    return newAccount
  }

  const updateAccount = (id, updates) => {
    setAccounts(prev =>
      prev.map(account =>
        account.id === id ? { ...account, ...updates, updatedAt: new Date().toISOString() } : account
      )
    )
    addActivityLog('updated', 'account', id, updates.name || 'Account')
  }

  const deleteAccount = (id) => {
    const account = accounts.find(a => a.id === id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    addActivityLog('deleted', 'account', id, account?.name || 'Account')
  }

  const login = (account) => {
    setCurrentUser(account)
    addActivityLog('logged_in', 'account', account.id, account.name)
  }

  const logout = () => {
    if (currentUser) {
      addActivityLog('logged_out', 'account', currentUser.id, currentUser.name)
    }
    setCurrentUser(null)
  }

  return (
    <AppContext.Provider
      value={{
        documents,
        certifications,
        accounts,
        activityLogs,
        recentDocuments,
        recentFolders,
        starredDocuments,
        currentUser,
        login,
        logout,
        addDocument,
        updateDocument,
        deleteDocument,
        approveDocument,
        rejectDocument,
        addDocumentVersion,
        checkOutDocument,
        checkInDocument,
        addCertification,
        updateCertification,
        deleteCertification,
        addAccount,
        updateAccount,
        deleteAccount,
        addActivityLog,
        addRecentDocument,
        addRecentFolder,
        toggleStar,
        getExpiringCertifications,
        archivedDocuments,
        archiveDocument,
        restoreDocument,
        deleteArchivedDocument,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}




