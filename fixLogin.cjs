const fs = require('fs');
let code = fs.readFileSync('src/components/SplashLogin.tsx', 'utf8');

// Replace handleUserAuth
code = code.replace(
  /const handleUserAuth = async \(user: User\) => \{\s*try \{\s*setLoading\(true\);/g,
  `const handleUserAuth = async (user: User) => {\n    try {\n      // setLoading(true); // Removed to fix splash screen freeze`
);

// Replace handleGoogleLogin
const regexGoogleLogin = /const handleGoogleLogin = async \(\) => \{([\s\S]*?)const handleProfileSubmit/g;

const replacementGoogleLogin = `const handleGoogleLogin = async () => {
    try {
      setErrorText('');
      
      // Validar codigo de grupo si no es el admin
      let grupoValido = false;
      const codigoUpper = codigoGrupo.trim().toUpperCase();
      
      if (codigoUpper) {
        const grupoSnap = await getDoc(doc(db, 'pm_grupos', codigoUpper));
        if (grupoSnap.exists() && grupoSnap.data().activo) {
          grupoValido = true;
        } else {
          setErrorText("El código de grupo no existe o está inactivo.");
          return;
        }
      }
      
      // Reiniciar Splash Screen
      setLoading(true);
      setMinTimeElapsed(false);
      setAuthResolved(false);
      setProgress(0);
      
      const startTime = Date.now();
      const duration = 2500;
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setProgress(Math.min((elapsed / duration) * 100, 99));
      }, 50);

      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
        setProgress(100);
        clearInterval(interval);
      }, duration);

      await signInWithPopup(auth, googleProvider);
      // We don't call handleUserAuth here, onAuthStateChanged will handle it.

    } catch (error: any) {
      console.error("Error en login con Google", error);
      setMinTimeElapsed(true);
      setAuthResolved(true);
      setLoading(false);
      if (error.code !== 'auth/popup-closed-by-user') {
         setErrorText("No se pudo iniciar sesión con Google.");
      }
    }
  };

  const handleProfileSubmit`;

code = code.replace(regexGoogleLogin, replacementGoogleLogin);

fs.writeFileSync('src/components/SplashLogin.tsx', code);
