const fs = require('fs');
let code = fs.readFileSync('src/components/SplashLogin.tsx', 'utf8');

const regex = /const handleUserAuth = async \(user: User\) => \{([\s\S]*?)const handleGoogleLogin/g;

const replacement = `const handleUserAuth = async (user: User) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'pm_usuarios', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setPendingUser({ ...user, existingData: data } as any);
      } else {
        if (user.email === 'lfalzatel@gmail.com') {
          await setDoc(userRef, {
            nombre: user.displayName || 'Admin',
            email: user.email,
            foto: user.photoURL,
            whatsapp: '3000000000',
            codigoGrupo: 'FOE',
            puntosTotal: 0,
            esAdmin: true,
            createdAt: new Date().toISOString()
          });
          setPendingUser({ ...user, existingData: {
            nombre: user.displayName || 'Admin',
            email: user.email,
            foto: user.photoURL,
            whatsapp: '3000000000',
            codigoGrupo: 'FOE'
          }} as any);
        } else {
          setPendingUser(user);
          setShowCompleteProfile(true);
        }
      }
    } catch (error) {
      console.error('Error in handleUserAuth:', error);
      setErrorText('Error de conexión.');
      setLoading(false);
    }
  };

  const handleGoogleLogin`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/SplashLogin.tsx', code);
