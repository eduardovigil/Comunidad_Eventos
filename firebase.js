  import { initializeApp } from 'firebase/app';
  import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
  import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
  import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
  import NetInfo from '@react-native-community/netinfo';
  
  const firebaseConfig = {
    apiKey: "AIzaSyDUOqXs5-bpRvR1OHA3RBmMWFFxHW3UTh8",
    authDomain: "eventos-cc8c2.firebaseapp.com",
    projectId: "eventos-cc8c2",
    storageBucket: "eventos-cc8c2.firebasestorage.app",
    messagingSenderId: "25473723630",
    appId: "1:25473723630:web:c7a7912eaa281377fd57ff"
  };

  
  const app = initializeApp(firebaseConfig);
  
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  
  const db = getFirestore(app);
  
  const handleFirestoreConnection = async () => {
    const netInfo = await NetInfo.fetch();
    
    if (netInfo.isConnected) {
      try {
        await enableNetwork(db);
        console.log('Conexión a Firestore habilitada');
      } catch (error) {
        console.error('Error al habilitar la conexión a Firestore:', error);
      }
    } else {
      try {
        await disableNetwork(db);
        console.log('Conexión a Firestore deshabilitada debido a falta de red');
      } catch (error) {
        console.error('Error al deshabilitar la conexión a Firestore:', error);
      }
    }
  };
  
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      handleFirestoreConnection();
    } else {
      disableNetwork(db).catch(console.error);
    }
  });
  
  handleFirestoreConnection();
  
  export { auth, db };
  
  