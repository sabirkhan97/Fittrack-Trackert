
import All from './apps/All/All';
import { AuthProvider } from './context/AuthContext';

function App() {
     return (

          <>
               <AuthProvider>

                    <All />
               </AuthProvider>

          </>
     );
}

export default App;