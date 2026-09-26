const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "mangystau-go-secret-change-me";

async function registerUser(pool, { name, email, password, phone }) {
  if (!name || !email || !password) {
    throw new Error("Имя, email и пароль обязательны");
  }

  if (password.length < 6) {
    throw new Error("Пароль должен содержать минимум 6 символов");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (existing.rows.length > 0) {
    throw new Error("Пользователь с таким email уже зарегистрирован");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, role, created_at`,
    [
      name.trim(),
      normalizedEmail,
      phone || null,
      passwordHash,
    ]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user,
    token,
  };
}

async function loginUser(pool, { email, password }) {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT
       id,
       name,
       email,
       phone,
       role,
       password_hash,
       created_at
     FROM users
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new Error("Неверный email или пароль");
  }

  const user = result.rows[0];

  if (!user.password_hash) {
    throw new Error(
      "Для этого пользователя ещё не установлен пароль"
    );
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!validPassword) {
    throw new Error("Неверный email или пароль");
  }

  delete user.password_hash;

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user,
    token,
  };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Требуется авторизация",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Недействительный или просроченный токен",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Доступ только для администратора",
    });
  }

  next();
}

module.exports = {
  registerUser,
  loginUser,
  authenticateToken,
  requireAdmin,
};