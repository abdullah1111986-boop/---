import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { TraineeProfile } from '../types';

// Updated configuration for sijil-trainee2
const firebaseConfig = {
  apiKey: "AIzaSyCez4RYAlPwVHZpT7xfxY_dNNOoLzoAEHs",
  authDomain: "sijil-trainee2.firebaseapp.com",
  projectId: "sijil-trainee2",
  storageBucket: "sijil-trainee2.firebasestorage.app",
  messagingSenderId: "1096618904644",
  appId: "1:1096618904644:web:f5bb5605b84de9c0be8011",
  measurementId: "G-CWM7TXWTNE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTION_NAME = 'trainees';

/**
 * Uploads trainee data to Firestore.
 * This process involves:
 * 1. Deleting all existing documents in the collection (to mimic file replacement).
 * 2. Inserting new documents in batches.
 */
export const uploadTraineeData = async (data: TraineeProfile[]): Promise<void> => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    
    // 1. Fetch existing documents
    const snapshot = await getDocs(colRef);
    
    // Firestore allows max 500 operations per batch. We use 450 to be safe.
    const CHUNK_SIZE = 450;
    
    // 2. Delete existing documents in batches
    const deleteChunks = [];
    let currentDeleteBatch = writeBatch(db);
    let deleteCount = 0;

    snapshot.docs.forEach((doc) => {
      currentDeleteBatch.delete(doc.ref);
      deleteCount++;
      if (deleteCount >= CHUNK_SIZE) {
        deleteChunks.push(currentDeleteBatch.commit());
        currentDeleteBatch = writeBatch(db);
        deleteCount = 0;
      }
    });
    if (deleteCount > 0) deleteChunks.push(currentDeleteBatch.commit());
    await Promise.all(deleteChunks);

    // 3. Insert new data in batches
    const insertChunks = [];
    let currentInsertBatch = writeBatch(db);
    let insertCount = 0;

    data.forEach((trainee) => {
      // Create a reference with the Trainee ID as the Document ID
      const docRef = doc(colRef, trainee.id);
      
      // Clean undefined values by parsing via JSON
      const cleanData = JSON.parse(JSON.stringify(trainee));
      
      currentInsertBatch.set(docRef, cleanData);
      insertCount++;
      
      if (insertCount >= CHUNK_SIZE) {
        insertChunks.push(currentInsertBatch.commit());
        currentInsertBatch = writeBatch(db);
        insertCount = 0;
      }
    });
    
    if (insertCount > 0) insertChunks.push(currentInsertBatch.commit());
    await Promise.all(insertChunks);

    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error updating database:', error);
    throw new Error('فشل تحديث قاعدة البيانات. تأكد من إعدادات القواعد (Rules) في Firestore.');
  }
};

/**
 * Fetches all trainee profiles from Firestore.
 */
export const fetchTraineeData = async (): Promise<TraineeProfile[] | null> => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs.map(doc => doc.data() as TraineeProfile);
    return data;
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
    return null;
  }
};