import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Storage Service
 * Generic Firestore operations
 */

/**
 * Create document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {object} data - Document data
 * @returns {Promise<void>}
 */
export const createDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error(`Failed to create ${collectionName} document`);
  }
};

/**
 * Get document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<object|null>}
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw new Error(`Failed to get ${collectionName} document`);
  }
};

/**
 * Update document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @param {object} updates - Updates to apply
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, documentId, updates) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error(`Failed to update ${collectionName} document`);
  }
};

/**
 * Delete document
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete ${collectionName} document`);
  }
};

/**
 * Get all documents from collection
 * @param {string} collectionName - Collection name
 * @returns {Promise<Array>}
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw new Error(`Failed to get ${collectionName} documents`);
  }
};

/**
 * Query documents
 * @param {string} collectionName - Collection name
 * @param {Array} conditions - Query conditions
 * @param {string} orderByField - Order by field
 * @param {number} limitCount - Limit count
 * @returns {Promise<Array>}
 */
export const queryDocuments = async (
  collectionName,
  conditions = [],
  orderByField = null,
  limitCount = null
) => {
  try {
    let q = collection(db, collectionName);

    // Apply where conditions
    conditions.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });

    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField));
    }

    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error querying documents:', error);
    throw new Error(`Failed to query ${collectionName} documents`);
  }
};

/**
 * Check if document exists
 * @param {string} collectionName - Collection name
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>}
 */
export const documentExists = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking document existence:', error);
    return false;
  }
};

/**
 * Batch update documents
 * @param {string} collectionName - Collection name
 * @param {Array} updates - Array of {id, data} objects
 * @returns {Promise<void>}
 */
export const batchUpdate = async (collectionName, updates) => {
  try {
    const promises = updates.map(({ id, data }) =>
      updateDocument(collectionName, id, data)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error batch updating:', error);
    throw new Error(`Failed to batch update ${collectionName} documents`);
  }
};

/**
 * Batch delete documents
 * @param {string} collectionName - Collection name
 * @param {Array} documentIds - Array of document IDs
 * @returns {Promise<void>}
 */
export const batchDelete = async (collectionName, documentIds) => {
  try {
    const promises = documentIds.map(id =>
      deleteDocument(collectionName, id)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error batch deleting:', error);
    throw new Error(`Failed to batch delete ${collectionName} documents`);
  }
};

export default {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getAllDocuments,
  queryDocuments,
  documentExists,
  batchUpdate,
  batchDelete
};