const admin = require('firebase-admin');

const auth = admin.auth();


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Autentica o usuário no Firebase
    const userRecord = await auth.getUserByEmail(email);

    // 2. Gera o token JWT (simulado - na prática, o token é gerado no frontend)
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      success: true,
      message: "Login realizado com sucesso!",
      token: token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email
      }
    });

  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(401).json({
      success: false,
      message: "Credenciais inválidas ou usuário não encontrado!"
    });
  }
};

module.exports = { login };